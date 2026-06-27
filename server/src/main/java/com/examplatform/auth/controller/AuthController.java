package com.examplatform.auth.controller;

import com.examplatform.auth.dto.*;
import com.examplatform.auth.service.AuthService;
import com.examplatform.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and Security Management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new Student or Teacher account")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "Account created successfully. Welcome!");
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT tokens")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Login successful");
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Generate new access token using a valid refresh token")
    public ApiResponse<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success(authService.refreshToken(request), "Access token refreshed successfully");
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset (simulates sending email to console logs)")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success("Password reset token generated and logged to console.");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token from forgot-password request")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Password reset successful");
    }
}
