package com.examplatform.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Available from date is required")
    private LocalDateTime availableFrom;

    @NotNull(message = "Available until date is required")
    private LocalDateTime availableUntil;

    @NotNull(message = "Max attempts is required")
    @Min(value = 1, message = "Max attempts must be at least 1")
    private Integer maxAttempts;

    @NotNull(message = "Module is required")
    private Long moduleId;

    @NotNull(message = "Group is required")
    private Long groupId;

    @NotNull(message = "Scheduled start time is required")
    private LocalDateTime scheduledStartTime;
}
