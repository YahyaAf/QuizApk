package com.examplatform.analytics.controller;

import com.examplatform.analytics.dto.QuestionStatDto;
import com.examplatform.analytics.service.AnalyticsService;
import com.examplatform.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Endpoints for performance analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/exam/{examId}/question-stats")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get per-question statistics for an exam (Teacher/Admin only)")
    public ApiResponse<List<QuestionStatDto>> getQuestionStats(@PathVariable Long examId) {
        List<QuestionStatDto> stats = analyticsService.getQuestionStatsForExam(examId);
        return ApiResponse.success(stats, "Question statistics retrieved successfully");
    }
}
