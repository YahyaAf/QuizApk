package com.examplatform.submission.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TextAnswerDto {
    private Long answerId;
    private Long questionId;
    private String questionStatement;
    private Integer questionPoints;
    private String textAnswer;
    private Double teacherScore;
    private String teacherFeedback;
    private boolean graded;
}
