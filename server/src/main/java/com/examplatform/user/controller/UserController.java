package com.examplatform.user.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.user.dto.ChangePasswordRequest;
import com.examplatform.user.dto.UpdateProfileRequest;
import com.examplatform.user.dto.UserDto;
import com.examplatform.user.entity.Role;
import com.examplatform.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User Profile and Administration Management")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ApiResponse<UserDto> getProfile(Principal principal) {
        return ApiResponse.success(userService.getProfile(principal.getName()), "Profile retrieved successfully");
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ApiResponse<UserDto> updateProfile(Principal principal, @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(userService.updateProfile(principal.getName(), request), "Profile updated successfully");
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change current user password")
    public ApiResponse<Void> changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getName(), request);
        return ApiResponse.success("Password changed successfully");
    }

    // Admin Endpoints

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users (Admin only)")
    public ApiResponse<Page<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ApiResponse.success(userService.getAllUsers(pageable), "Users list retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a user by ID (Admin only)")
    public ApiResponse<UserDto> getUserById(@PathVariable Long id) {
        return ApiResponse.success(userService.getUserById(id), "User retrieved successfully");
    }

    @PutMapping("/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Block a user (Admin only)")
    public ApiResponse<UserDto> blockUser(@PathVariable Long id) {
        return ApiResponse.success(userService.toggleBlockUser(id, true), "User blocked successfully");
    }

    @PutMapping("/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unblock a user (Admin only)")
    public ApiResponse<UserDto> unblockUser(@PathVariable Long id) {
        return ApiResponse.success(userService.toggleBlockUser(id, false), "User unblocked successfully");
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Change a user's role (Admin only)")
    public ApiResponse<UserDto> changeRole(@PathVariable Long id, @RequestParam Role role) {
        return ApiResponse.success(userService.changeUserRole(id, role), "User role updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a user (Admin only)")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success("User deleted successfully");
    }
}
