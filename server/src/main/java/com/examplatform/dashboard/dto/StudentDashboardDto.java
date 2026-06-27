package com.examplatform.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDashboardDto {
    private long examsTaken;
    private double averageScore;
    private long globalRank;
    private int currentStreak;
    private String dailyTip;
}
