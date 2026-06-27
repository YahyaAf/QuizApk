package com.examplatform.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardDto {
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Double totalScore;
    private Double averagePercentage;
    private Double averageScore;
    private Long examsTaken;
    private int rank;
}
