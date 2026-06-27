package com.examplatform.question.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.question.dto.QuestionDto;
import com.examplatform.question.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Tag(name = "Questions", description = "Question and Choices Management")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Add a question to an exam (Teacher/Admin)")
    public ApiResponse<QuestionDto> addQuestion(
            Principal principal,
            @PathVariable Long examId,
            @Valid @RequestBody QuestionDto dto
    ) {
        return ApiResponse.success(questionService.addQuestion(examId, dto, principal.getName()), "Question added successfully");
    }

    @PutMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update a question (Teacher/Admin)")
    public ApiResponse<QuestionDto> updateQuestion(
            Principal principal,
            @PathVariable Long questionId,
            @Valid @RequestBody QuestionDto dto
    ) {
        return ApiResponse.success(questionService.updateQuestion(questionId, dto, principal.getName()), "Question updated successfully");
    }

    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete a question (Teacher/Admin)")
    public ApiResponse<Void> deleteQuestion(Principal principal, @PathVariable Long questionId) {
        questionService.deleteQuestion(questionId, principal.getName());
        return ApiResponse.success("Question deleted successfully");
    }

    @GetMapping("/exam/{examId}")
    @Operation(summary = "Get list of questions for an exam (Students get secure stripped view)")
    public ApiResponse<List<QuestionDto>> getQuestions(Principal principal, @PathVariable Long examId) {
        return ApiResponse.success(questionService.getQuestionsForExam(examId, principal.getName()), "Questions list retrieved");
    }
}
