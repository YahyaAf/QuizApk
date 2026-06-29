package com.examplatform.submission.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.submission.dto.CheatEventRequest;
import com.examplatform.submission.dto.SubmissionDto;
import com.examplatform.submission.dto.SubmitExamRequest;
import com.examplatform.submission.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@Tag(name = "Submissions", description = "Student Exam Taking and Submission Management")
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/start/{examId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start a new exam session (Student only)")
    public ApiResponse<SubmissionDto> startExam(Principal principal, @PathVariable Long examId) {
        synchronized (principal.getName().intern()) {
            return ApiResponse.success(submissionService.startExam(examId, principal.getName()), "Exam session started. Good luck!");
        }
    }

    @PutMapping("/{submissionId}/save")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save/update answers during an active exam session (Student only)")
    public ApiResponse<SubmissionDto> saveAnswers(
            Principal principal,
            @PathVariable Long submissionId,
            @Valid @RequestBody SubmitExamRequest request
    ) {
        synchronized (principal.getName().intern()) {
            return ApiResponse.success(submissionService.saveAnswers(submissionId, request, principal.getName()), "Answers saved successfully");
        }
    }

    @PutMapping("/{submissionId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit and auto-correct the exam session (Student only)")
    public ApiResponse<SubmissionDto> submitExam(
            Principal principal,
            @PathVariable Long submissionId,
            @Valid @RequestBody SubmitExamRequest request
    ) {
        synchronized (principal.getName().intern()) {
            return ApiResponse.success(submissionService.submitExam(submissionId, request, principal.getName()), "Exam submitted and corrected successfully");
        }
    }

    @PostMapping("/{submissionId}/events")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Log an anti-cheat event (tab-switch, paste, etc.) during an exam session")
    public ApiResponse<Void> logCheatEvent(
            Principal principal,
            @PathVariable Long submissionId,
            @Valid @RequestBody CheatEventRequest request
    ) {
        submissionService.logCheatEvent(submissionId, request, principal.getName());
        return ApiResponse.success("Event logged");
    }
}
