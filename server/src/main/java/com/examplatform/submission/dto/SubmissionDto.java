package com.examplatform.submission.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long examId;
    private String examTitle;
    private String courseName;
    private LocalDateTime startTime;
    private LocalDateTime submitTime;
    private boolean graded;
    private Double score;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Double percentage;
    private Boolean passed;
}
