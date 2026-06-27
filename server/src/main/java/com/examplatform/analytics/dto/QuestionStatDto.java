package com.examplatform.analytics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionStatDto {
    private Long questionId;
    private String statement;
    private String questionType;
    private int totalAttempts;
    private int correctAttempts;
    private double successRate; // percentage
    private int points;
}
