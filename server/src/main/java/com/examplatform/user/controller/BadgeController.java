package com.examplatform.user.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.user.dto.UserDto;
import com.examplatform.user.service.BadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@Tag(name = "Badges", description = "Badge Management for Teachers")
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get all students for badge assignment")
    public ApiResponse<List<UserDto>> getAllStudents() {
        return ApiResponse.success(badgeService.getAllStudents(), "Students retrieved successfully");
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Assign a manual badge to a student")
    public ApiResponse<Void> assignManualBadge(
            @RequestParam Long studentId,
            @RequestParam String name,
            @RequestParam String iconUrl,
            @RequestParam String color,
            @RequestParam(required = false, defaultValue = "Badge attribué par un professeur") String description) {
        badgeService.assignManualBadge(studentId, name, iconUrl, description, color);
        return ApiResponse.success("Badge assigned successfully");
    }

    @PostMapping("/trigger-rules")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Trigger calculation of automatic ranking badges")
    public ApiResponse<Void> triggerAutomaticBadges() {
        badgeService.calculateAndAssignAutomaticBadges();
        return ApiResponse.success("Automatic badges calculated and assigned successfully");
    }
}
