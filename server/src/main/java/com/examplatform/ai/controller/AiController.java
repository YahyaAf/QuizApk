package com.examplatform.ai.controller;

import com.examplatform.ai.dto.AiQuizRequest;
import com.examplatform.ai.service.AiService;
import com.examplatform.common.dto.ApiResponse;
import com.examplatform.question.dto.QuestionDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Quiz Generation", description = "Endpoints for AI-powered quiz generation from text")
public class AiController {

    private final AiService aiService;

    @PostMapping("/generate-quiz")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Generate quiz questions from text using AI")
    public ApiResponse<List<QuestionDto>> generateQuiz(
            @Valid @RequestBody AiQuizRequest request,
            Principal principal
    ) {
        List<QuestionDto> questions = aiService.generateQuestionsFromText(request, principal.getName());
        return ApiResponse.success(questions, questions.size() + " question(s) générée(s) et ajoutée(s) à l'examen avec succès.");
    }

    @PostMapping(value = "/generate-quiz-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Generate quiz questions from PDF file using AI")
    public ApiResponse<List<QuestionDto>> generateQuizPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("examId") Long examId,
            @RequestParam("questionCount") Integer questionCount,
            @RequestParam("questionType") String questionType,
            @RequestParam("pointsPerQuestion") Integer pointsPerQuestion,
            Principal principal
    ) {
        List<QuestionDto> questions = aiService.generateQuestionsFromPdf(
                examId, file, questionCount, questionType, pointsPerQuestion, principal.getName()
        );
        return ApiResponse.success(questions, questions.size() + " question(s) générée(s) depuis le PDF avec succès.");
    }
}
