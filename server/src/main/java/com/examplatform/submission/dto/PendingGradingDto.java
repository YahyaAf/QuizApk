package com.examplatform.submission.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingGradingDto {
    private Long submissionId;
    private Long resultId;
    private Long examId;
    private String examTitle;
    private String courseName;
    private Long studentId;
    private String studentName;
    private LocalDateTime submitTime;
    private int pendingTextAnswers;
    private int totalTextAnswers;
    private List<TextAnswerDto> textAnswers;
}
