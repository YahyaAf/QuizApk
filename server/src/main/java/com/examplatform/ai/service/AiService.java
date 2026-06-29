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
@SuppressWarnings("null")
public class AiService {

    private final ExamRepository examRepository;
    private final QuestionService questionService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    // Google Gemini (free tier: 1500 requests/day)
    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${ai.gemini.enabled:false}")
    private boolean geminiEnabled;

    private static final String GEMINI_API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

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

        if (geminiEnabled && geminiApiKey != null && !geminiApiKey.isBlank()) {
            generatedQuestions = generateWithGemini(request.getText(), count, type, points);
        } else {
            throw new BadRequestException("Génération par IA impossible : Gemini n'est pas configuré ou activé.");
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
     * Calls Google Gemini API (free tier) to generate questions.
     * Gemini 1.5 Flash: 1500 requests/day, 1M tokens/min — completely free.
     */
    private List<QuestionDto> generateWithGemini(String text, int count, String type, int points) {
        String prompt = buildPrompt(text, count, type);
        String url = String.format(GEMINI_API_URL, geminiModel, geminiApiKey);

        // Gemini API request body
        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> generationConfig = Map.of(
            "temperature", 0.7,
            "maxOutputTokens", 4096,
            "responseMimeType", "application/json"
        );
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("contents", List.of(content));
        body.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            String jsonText = root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            log.info("Gemini generated JSON ({} chars)", jsonText.length());
            return parseQuestionsFromJson(jsonText, type, points);

        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            throw new BadRequestException("Erreur de l'API Gemini : " + e.getMessage());
        }
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
