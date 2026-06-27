package com.examplatform.exam.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.exam.dto.ExamCreateRequest;
import com.examplatform.exam.dto.ExamDto;
import com.examplatform.exam.service.ExamService;
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
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Exams", description = "Exam Management")
public class ExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Create a new exam (Teacher/Admin)")
    public ApiResponse<ExamDto> createExam(Principal principal, @Valid @RequestBody ExamCreateRequest request) {
        return ApiResponse.success(examService.createExam(request, principal.getName()), "Exam created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update an exam (Teacher/Admin)")
    public ApiResponse<ExamDto> updateExam(
            Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody ExamCreateRequest request
    ) {
        return ApiResponse.success(examService.updateExam(id, request, principal.getName()), "Exam updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete an exam (Teacher/Admin)")
    public ApiResponse<Void> deleteExam(Principal principal, @PathVariable Long id) {
        examService.deleteExam(id, principal.getName());
        return ApiResponse.success("Exam deleted successfully");
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Publish or unpublish an exam (Teacher/Admin)")
    public ApiResponse<ExamDto> publishExam(
            Principal principal,
            @PathVariable Long id,
            @RequestParam boolean publish
    ) {
        String msg = publish ? "Exam published successfully" : "Exam unpublished successfully";
        return ApiResponse.success(examService.publishExam(id, publish, principal.getName()), msg);
    }

    @GetMapping("/my-exams")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get list of exams created by the current Teacher")
    public ApiResponse<Page<ExamDto>> getMyExams(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ApiResponse.success(examService.getTeacherExams(principal.getName(), pageable), "Teacher exams retrieved");
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all exams on the platform (Admin only)")
    public ApiResponse<Page<ExamDto>> getAllExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ApiResponse.success(examService.getAllExams(pageable), "All exams retrieved");
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get list of available exams for the current Student")
    public ApiResponse<Page<ExamDto>> getAvailableExams(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "availableFrom") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ApiResponse.success(examService.getAvailableExamsForStudent(principal.getName(), pageable), "Available exams retrieved");
    }

    @GetMapping("/fix-dates")
    @Operation(summary = "Fix exam dates (developer utility)")
    public ApiResponse<String> fixExamDates() {
        examService.fixExamDates();
        return ApiResponse.success("Exam dates updated successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exam details by ID")
    public ApiResponse<ExamDto> getExamById(Principal principal, @PathVariable Long id) {
        return ApiResponse.success(examService.getExamById(id, principal.getName()), "Exam retrieved successfully");
    }
}
