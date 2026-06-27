package com.examplatform.ai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQuizRequest {
    private Long examId;
    private String text;
    private Integer questionCount;
    private String questionType; // SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, or MIXED
    private Integer pointsPerQuestion;
}
