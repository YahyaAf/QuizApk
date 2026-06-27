package com.examplatform.result.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.result.dto.ResultDto;
import com.examplatform.result.service.PdfExportService;
import com.examplatform.result.service.ResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
@Tag(name = "Results", description = "Exam Scoring and PDF Reports Management")
public class ResultController {

    private final ResultService resultService;
    private final PdfExportService pdfExportService;

    @GetMapping("/my-results")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get current student's exam results history")
    public ApiResponse<List<ResultDto>> getMyResults(Principal principal) {
        return ApiResponse.success(resultService.getMyResults(principal.getName()), "Results history retrieved");
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get list of results for exams created by the current Teacher")
    public ApiResponse<List<ResultDto>> getTeacherResults(Principal principal) {
        return ApiResponse.success(resultService.getTeacherResults(principal.getName()), "Teacher exam results retrieved");
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all exam results (Admin only)")
    public ApiResponse<Page<ResultDto>> getAllResults(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ApiResponse.success(resultService.getAllResults(pageable), "All results retrieved successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details of a specific result")
    public ApiResponse<ResultDto> getResultById(Principal principal, @PathVariable Long id) {
        return ApiResponse.success(resultService.getResultById(id, principal.getName()), "Result retrieved successfully");
    }

    @GetMapping("/{id}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get all answers and teacher feedback for a specific result (Student review)")
    public ApiResponse<List<com.examplatform.submission.dto.TextAnswerDto>> getResultAnswers(Principal principal, @PathVariable Long id) {
        return ApiResponse.success(resultService.getResultAnswers(id, principal.getName()), "Answers retrieved");
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Download a PDF report of a specific exam result")
    public ResponseEntity<byte[]> downloadResultPdf(Principal principal, @PathVariable Long id) {
        byte[] pdfBytes = pdfExportService.generateResultPdf(id, principal.getName());

        String filename = "resultat-examen-" + id + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/{id}/certificate")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<byte[]> getCertificatePdf(
            @PathVariable Long id,
            Principal principal) {
        byte[] pdfBytes = pdfExportService.generateCertificatePdf(id, principal.getName());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "certificat_" + id + ".pdf");
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/exam/{examId}/export/pdf")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<byte[]> exportExamResultsPdf(
            @PathVariable Long examId,
            Principal principal) {
        byte[] pdfBytes = pdfExportService.generateExamResultsPdf(examId, principal.getName());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "resultats_examen_" + examId + ".pdf");
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
