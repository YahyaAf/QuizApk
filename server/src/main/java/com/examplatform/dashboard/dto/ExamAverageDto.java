package com.examplatform.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAverageDto {
    private Long examId;
    private String examTitle;
    private Double averagePercentage;
}
