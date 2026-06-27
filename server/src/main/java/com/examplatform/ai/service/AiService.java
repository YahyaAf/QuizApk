package com.examplatform.ai.service;

import com.examplatform.common.exception.BadRequestException;
import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.exam.entity.Exam;
import com.examplatform.exam.repository.ExamRepository;
import com.examplatform.ai.dto.AiQuizRequest;
import com.examplatform.question.dto.ChoiceDto;
import com.examplatform.question.dto.QuestionDto;
import com.examplatform.question.entity.QuestionType;
import com.examplatform.question.service.QuestionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.InputStream;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final ExamRepository examRepository;
    private final QuestionService questionService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${ai.openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Value("${ai.openai.enabled:false}")
    private boolean openAiEnabled;

    /**
     * Generates quiz questions from a provided text using either OpenAI (if configured)
     * or a built-in template-based generator as a fallback.
     */
    public List<QuestionDto> generateQuestionsFromText(AiQuizRequest request, String teacherEmail) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId()));

        if (exam.isPublished()) {
            throw new BadRequestException("Cannot add questions to a published exam. Please unpublish it first.");
        }

        if (request.getText() == null || request.getText().trim().isEmpty()) {
            throw new BadRequestException("Text content is required for quiz generation.");
        }

        int count = request.getQuestionCount() != null ? Math.min(request.getQuestionCount(), 20) : 5;
        int points = request.getPointsPerQuestion() != null ? request.getPointsPerQuestion() : 1;
        String type = request.getQuestionType() != null ? request.getQuestionType().toUpperCase() : "SINGLE_CHOICE";

        List<QuestionDto> generatedQuestions;

        if (openAiEnabled && openAiApiKey != null && !openAiApiKey.isEmpty()) {
            generatedQuestions = generateWithOpenAi(request.getText(), count, type, points);
        } else {
            log.info("OpenAI is not enabled/configured. Using template-based generation.");
            generatedQuestions = generateWithTemplate(request.getText(), count, type, points);
        }

        // Persist questions
        List<QuestionDto> saved = new ArrayList<>();
        for (QuestionDto dto : generatedQuestions) {
            try {
                saved.add(questionService.addQuestion(request.getExamId(), dto, teacherEmail));
            } catch (Exception e) {
                log.error("Failed to save generated question: {}", e.getMessage());
            }
        }
        return saved;
    }

    /**
     * Calls OpenAI Chat Completion API to generate questions.
     */
    private List<QuestionDto> generateWithOpenAi(String text, int count, String type, int points) {
        String prompt = buildPrompt(text, count, type);

        Map<String, Object> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", openAiModel);
        body.put("messages", List.of(message));
        body.put("temperature", 0.7);
        body.put("max_tokens", 3000);
        body.put("response_format", Map.of("type", "json_object"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.openai.com/v1/chat/completions",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            String content = objectMapper.readTree(response.getBody())
                    .path("choices").get(0)
                    .path("message").path("content").asText();

            return parseQuestionsFromJson(content, type, points);
        } catch (Exception e) {
            log.error("OpenAI API call failed: {}. Falling back to template generation.", e.getMessage());
            return generateWithTemplate(text, count, type, points);
        }
    }

    /**
     * Template-based fallback generator when OpenAI is not available.
     * Generates simple questions based on keywords extracted from the text.
     */
    private List<QuestionDto> generateWithTemplate(String text, int count, String type, int points) {
        List<QuestionDto> questions = new ArrayList<>();
        String[] sentences = text.split("[.!?\\n]+");
        List<String> validSentences = new ArrayList<>();
        for (String s : sentences) {
            String trimmed = s.trim();
            if (trimmed.length() > 15 && trimmed.split("\\s+").length >= 4) {
                validSentences.add(trimmed);
            }
        }

        int maxQuestions = Math.min(count, validSentences.size());
        if (maxQuestions == 0) {
            throw new BadRequestException("Le texte fourni est trop court pour générer des questions. Veuillez fournir un texte plus long et détaillé.");
        }

        for (int i = 0; i < maxQuestions; i++) {
            String sentence = validSentences.get(i);
            QuestionDto q = new QuestionDto();
            q.setStatement("Concernant le texte fourni, laquelle des affirmations suivantes est correcte ?\n\n\"" + sentence + "\"");
            q.setPoints(points);
            q.setExplanation("Réponse générée automatiquement depuis le texte source.");

            if ("TRUE_FALSE".equals(type)) {
                q.setType(QuestionType.TRUE_FALSE);
                q.setChoices(List.of(
                        new ChoiceDto(null, "Vrai", true),
                        new ChoiceDto(null, "Faux", false)
                ));
            } else if ("MULTIPLE_CHOICE".equals(type)) {
                q.setType(QuestionType.MULTIPLE_CHOICE);
                q.setChoices(List.of(
                        new ChoiceDto(null, "Cette affirmation est exacte", true),
                        new ChoiceDto(null, "Cette affirmation est correcte selon le contexte", true),
                        new ChoiceDto(null, "Cette affirmation est incorrecte", false),
                        new ChoiceDto(null, "Cette affirmation est hors sujet", false)
                ));
            } else if ("TEXT".equals(type)) {
                q.setType(QuestionType.TEXT);
                q.setChoices(new ArrayList<>());
            } else {
                q.setType(QuestionType.SINGLE_CHOICE);
                q.setChoices(List.of(
                        new ChoiceDto(null, "Cette affirmation est exacte et complète", true),
                        new ChoiceDto(null, "Cette affirmation est partiellement incorrecte", false),
                        new ChoiceDto(null, "Cette affirmation est totalement fausse", false),
                        new ChoiceDto(null, "Cette affirmation est hors contexte", false)
                ));
            }
            questions.add(q);
        }
        return questions;
    }

    private String buildPrompt(String text, int count, String type) {
        String typeDesc = switch (type) {
            case "TRUE_FALSE" -> "Vrai/Faux (2 choix uniquement: Vrai et Faux, un seul correct)";
            case "MULTIPLE_CHOICE" -> "QCM à réponses multiples (4 choix, 2+ corrects)";
            case "TEXT" -> "Question ouverte (aucun choix, tu DOIS renvoyer un tableau choices vide [])";
            default -> "QCM à réponse unique (4 choix, 1 seul correct)";
        };

        return """
            Génère exactement %d question(s) de type "%s" en français, basées sur ce texte:
            
            ---
            %s
            ---
            
            Réponds UNIQUEMENT en JSON valide avec la structure suivante:
            {
              "questions": [
                {
                  "statement": "Énoncé de la question",
                  "explanation": "Explication de la réponse attendue",
                  "choices": [
                    // Pour le type TEXT: le tableau doit être obligatoirement vide [].
                    // Sinon, renvoie les choix comme ceci:
                    // {"label": "Texte choix", "isCorrect": true}
                  ]
                }
              ]
            }
            """.formatted(count, typeDesc, text.substring(0, Math.min(text.length(), 3000)));
    }

    private List<QuestionDto> parseQuestionsFromJson(String json, String type, int points) {
        List<QuestionDto> result = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode questionsNode = root.path("questions");
            if (questionsNode.isArray()) {
                for (JsonNode qNode : questionsNode) {
                    QuestionDto dto = new QuestionDto();
                    dto.setStatement(qNode.path("statement").asText());
                    dto.setExplanation(qNode.path("explanation").asText(""));
                    dto.setPoints(points);
                    dto.setType(QuestionType.valueOf(type.equals("MIXED") ? "SINGLE_CHOICE" : type));

                    List<ChoiceDto> choices = new ArrayList<>();
                    for (JsonNode c : qNode.path("choices")) {
                        choices.add(new ChoiceDto(null, c.path("label").asText(), c.path("isCorrect").asBoolean()));
                    }
                    dto.setChoices(choices);
                    result.add(dto);
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse OpenAI JSON response: {}", e.getMessage());
        }
        return result;
    }

    /**
     * Extracts text from a uploaded PDF file and generates questions from it.
     */
    public List<QuestionDto> generateQuestionsFromPdf(
            Long examId,
            MultipartFile file,
            Integer questionCount,
            String questionType,
            Integer pointsPerQuestion,
            String teacherEmail
    ) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("PDF file is required for quiz generation.");
        }

        try {
            String extractedText;
            try (InputStream is = file.getInputStream();
                 PDDocument document = PDDocument.load(is)) {
                PDFTextStripper stripper = new PDFTextStripper();
                extractedText = stripper.getText(document);
            }

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new BadRequestException("Failed to extract text from PDF or PDF is empty.");
            }

            log.info("Successfully extracted {} characters from PDF: {}", extractedText.length(), file.getOriginalFilename());

            AiQuizRequest request = new AiQuizRequest();
            request.setExamId(examId);
            request.setText(extractedText);
            request.setQuestionCount(questionCount);
            request.setQuestionType(questionType);
            request.setPointsPerQuestion(pointsPerQuestion);

            return generateQuestionsFromText(request, teacherEmail);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse PDF file for quiz generation", e);
            throw new BadRequestException("Failed to process PDF file: " + e.getMessage());
        }
    }
}
