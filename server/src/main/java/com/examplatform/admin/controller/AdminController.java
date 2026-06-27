package com.examplatform.admin.controller;

import com.examplatform.admin.service.AdminService;
import com.examplatform.audit.entity.AuditLog;
import com.examplatform.common.dto.ApiResponse;
import com.examplatform.school.entity.Module;
import com.examplatform.school.entity.ModuleAssignment;
import com.examplatform.school.entity.StudentGroup;
import com.examplatform.user.dto.CreateUserRequest;
import com.examplatform.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administration API")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/users")
    @Operation(summary = "Create a new user (Student/Teacher)")
    public ApiResponse<User> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success(adminService.createUser(request), "User created successfully");
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update an existing user")
    public ApiResponse<User> updateUser(@PathVariable Long id, @Valid @RequestBody com.examplatform.user.dto.UpdateUserRequest request) {
        return ApiResponse.success(adminService.updateUser(id, request), "User updated successfully");
    }

    @PostMapping("/groups")
    @Operation(summary = "Create a new student group")
    public ApiResponse<StudentGroup> createGroup(@RequestParam String name, @RequestParam(required = false) String description) {
        return ApiResponse.success(adminService.createGroup(name, description), "Group created successfully");
    }

    @GetMapping("/groups")
    @Operation(summary = "Get all student groups")
    public ApiResponse<List<StudentGroup>> getGroups() {
        return ApiResponse.success(adminService.getAllGroups(), "Groups retrieved");
    }

    @PutMapping("/groups/{id}")
    @Operation(summary = "Update a student group")
    public ApiResponse<StudentGroup> updateGroup(@PathVariable Long id, @RequestParam String name, @RequestParam(required = false) String description) {
        return ApiResponse.success(adminService.updateGroup(id, name, description), "Group updated successfully");
    }

    @DeleteMapping("/groups/{id}")
    @Operation(summary = "Delete a student group")
    public ApiResponse<Void> deleteGroup(@PathVariable Long id) {
        adminService.deleteGroup(id);
        return ApiResponse.success("Group deleted successfully");
    }

    @PostMapping("/modules")
    @Operation(summary = "Create a new module")
    public ApiResponse<Module> createModule(@RequestParam String name, @RequestParam(required = false) String description) {
        return ApiResponse.success(adminService.createModule(name, description), "Module created successfully");
    }

    @GetMapping("/modules")
    @Operation(summary = "Get all modules")
    public ApiResponse<List<Module>> getModules() {
        return ApiResponse.success(adminService.getAllModules(), "Modules retrieved");
    }

    @PutMapping("/modules/{id}")
    @Operation(summary = "Update a module")
    public ApiResponse<Module> updateModule(@PathVariable Long id, @RequestParam String name, @RequestParam(required = false) String description) {
        return ApiResponse.success(adminService.updateModule(id, name, description), "Module updated successfully");
    }

    @DeleteMapping("/modules/{id}")
    @Operation(summary = "Delete a module")
    public ApiResponse<Void> deleteModule(@PathVariable Long id) {
        adminService.deleteModule(id);
        return ApiResponse.success("Module deleted successfully");
    }

    @PostMapping("/assignments")
    @Operation(summary = "Assign teacher to a module and group")
    public ApiResponse<ModuleAssignment> createAssignment(@RequestParam Long teacherId, @RequestParam Long moduleId, @RequestParam Long groupId) {
        return ApiResponse.success(adminService.createAssignment(teacherId, moduleId, groupId), "Assignment created");
    }

    @GetMapping("/assignments")
    @Operation(summary = "Get all module assignments")
    public ApiResponse<List<ModuleAssignment>> getAssignments() {
        return ApiResponse.success(adminService.getAllAssignments(), "Assignments retrieved");
    }

    @PutMapping("/assignments/{id}")
    @Operation(summary = "Update a module assignment")
    public ApiResponse<ModuleAssignment> updateAssignment(@PathVariable Long id, @RequestParam Long teacherId, @RequestParam Long moduleId, @RequestParam Long groupId) {
        return ApiResponse.success(adminService.updateAssignment(id, teacherId, moduleId, groupId), "Assignment updated successfully");
    }

    @DeleteMapping("/assignments/{id}")
    @Operation(summary = "Delete a module assignment")
    public ApiResponse<Void> deleteAssignment(@PathVariable Long id) {
        adminService.deleteAssignment(id);
        return ApiResponse.success("Assignment deleted successfully");
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs")
    public ApiResponse<List<com.examplatform.audit.dto.AuditLogDto>> getAuditLogs() {
        List<com.examplatform.audit.dto.AuditLogDto> dtos = adminService.getAuditLogs().stream()
            .map(log -> com.examplatform.audit.dto.AuditLogDto.builder()
                .id(log.getId())
                .action(log.getAction())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .performedBy(log.getUser() != null ? log.getUser().getEmail() : "System")
                .timestamp(log.getCreatedAt())
                .build()
            ).toList();
        return ApiResponse.success(dtos, "Audit logs retrieved");
    }
}
