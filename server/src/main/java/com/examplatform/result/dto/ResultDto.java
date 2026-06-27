package com.examplatform.result.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultDto {
    private Long id;
    private Long submissionId;
    private Long examId;
    private String examTitle;
    private String courseName;
    private String studentName;
    private Double score;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Double percentage;
    private boolean passed;
    private LocalDateTime createdAt;
    // Manual grading status
    private boolean pendingManualGrade;
    private boolean manuallyGraded;
    private Integer textAnswerCount;
}
