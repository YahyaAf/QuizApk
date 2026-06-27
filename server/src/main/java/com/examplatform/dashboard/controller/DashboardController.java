package com.examplatform.dashboard.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.dashboard.dto.AdminDashboardDto;
import com.examplatform.dashboard.dto.LeaderboardDto;
import com.examplatform.dashboard.dto.StudentDashboardDto;
import com.examplatform.dashboard.dto.TeacherDashboardDto;
import com.examplatform.dashboard.service.DashboardService;
import com.examplatform.dashboard.service.LeaderboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboards", description = "KPIs, Statistics and Leaderboard Management")
public class DashboardController {

    private final DashboardService dashboardService;
    private final LeaderboardService leaderboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get administrator dashboard metrics (Admin only)")
    public ApiResponse<AdminDashboardDto> getAdminDashboard() {
        return ApiResponse.success(dashboardService.getAdminDashboard(), "Admin dashboard data retrieved");
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get teacher dashboard metrics (Teacher only)")
    public ApiResponse<TeacherDashboardDto> getTeacherDashboard(Principal principal) {
        return ApiResponse.success(dashboardService.getTeacherDashboard(principal.getName()), "Teacher dashboard data retrieved");
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student dashboard metrics (Student only)")
    public ApiResponse<StudentDashboardDto> getStudentDashboard(Principal principal) {
        return ApiResponse.success(dashboardService.getStudentDashboard(principal.getName()), "Student dashboard data retrieved");
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Get global student leaderboard rankings")
    public ApiResponse<List<LeaderboardDto>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return ApiResponse.success(leaderboardService.getLeaderboard(limit, year, month), "Global leaderboard retrieved");
    }
}
