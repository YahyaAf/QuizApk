package com.examplatform.submission.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.submission.dto.ManualGradeRequest;
import com.examplatform.submission.dto.PendingGradingDto;
import com.examplatform.submission.dto.TextAnswerDto;
import com.examplatform.submission.service.ManualGradingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@Tag(name = "Manual Grading", description = "Teacher manual grading of TEXT (open-ended) answers")
public class ManualGradingController {

    private final ManualGradingService manualGradingService;

    @GetMapping("/pending-grading")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get all submissions with pending manual grading (Teacher only)")
    public ApiResponse<List<PendingGradingDto>> getPendingGrading(Principal principal) {
        List<PendingGradingDto> pending = manualGradingService.getPendingGradingForTeacher(principal.getName());
        return ApiResponse.success(pending, "Fetched " + pending.size() + " submission(s) awaiting manual grading");
    }

    @GetMapping("/{submissionId}/text-answers")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get all text answers for a specific submission (Teacher only)")
    public ApiResponse<List<TextAnswerDto>> getTextAnswers(
            Principal principal,
            @PathVariable Long submissionId
    ) {
        return ApiResponse.success(
                manualGradingService.getTextAnswersForSubmission(submissionId, principal.getName()),
                "Text answers fetched successfully"
        );
    }

    @PutMapping("/{submissionId}/grade-text-answer")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Grade a specific text answer and recalculate the result (Teacher only)")
    public ApiResponse<PendingGradingDto> gradeTextAnswer(
            Principal principal,
            @PathVariable Long submissionId,
            @Valid @RequestBody ManualGradeRequest request
    ) {
        PendingGradingDto result = manualGradingService.gradeTextAnswer(submissionId, request, principal.getName());
        return ApiResponse.success(result, "Answer graded successfully. Result recalculated.");
    }
}
