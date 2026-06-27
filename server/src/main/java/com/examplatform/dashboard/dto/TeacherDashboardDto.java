package com.examplatform.dashboard.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherDashboardDto {
    private long examsCreated;
    private long totalParticipants;
    private List<ExamAverageDto> averageScoreByExam;
    
    private long totalExams;
    private long totalSubmissions;
    private double averageScore;
    private long pendingGrading;
    private List<RecentExamDto> recentExams;
    private long moduleCount;
    private long groupCount;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentExamDto {
        private Long id;
        private String title;
        private String status;
        private long submissionCount;
    }
}
