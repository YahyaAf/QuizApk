package com.examplatform.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardDto {
    private long totalUsers;
    private long totalStudents;
    private long totalTeachers;
    private long totalExams;
    private long totalSubmissions;
    private long activeStudents;
}
