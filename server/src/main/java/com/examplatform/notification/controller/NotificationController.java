package com.examplatform.notification.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.notification.entity.Notification;
import com.examplatform.notification.service.NotificationService;
import com.examplatform.user.entity.User;
import com.examplatform.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification Management")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @GetMapping
    @Operation(summary = "Get all notifications for the current user")
    public ApiResponse<List<Notification>> getNotifications() {
        User user = getCurrentUser();
        if (user == null) {
            return ApiResponse.error("User not found");
        }
        return ApiResponse.success(notificationService.getUserNotifications(user.getId()), "Notifications retrieved");
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ApiResponse.success("Notification marked as read");
    }
}
