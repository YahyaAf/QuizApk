package com.examplatform.exam.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamDto {
    private Long id;
    private String title;
    private String description;
    private Integer durationMinutes;
    private LocalDateTime availableFrom;
    private LocalDateTime availableUntil;
    private Integer maxAttempts;
    private Long moduleId;
    private String moduleName;
    private Long groupId;
    private String groupName;
    private String status;
    private LocalDateTime scheduledStartTime;
    private Integer totalMarks;
    private boolean published;
    private Long createdByTeacherId;
    private String createdByTeacherName;
    private LocalDateTime createdAt;
}
