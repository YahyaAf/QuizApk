package com.examplatform.dashboard.service;

import com.examplatform.dashboard.dto.LeaderboardDto;
import com.examplatform.result.repository.ResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class LeaderboardService {

    private final ResultRepository resultRepository;

    public List<LeaderboardDto> getLeaderboard(int limit, Integer year, Integer month) {
        if (year != null && month != null) {
            return getMonthlyLeaderboard(year, month, limit);
        }

        List<Object[]> queryResults = resultRepository.getLeaderboardData(PageRequest.of(0, limit));
        List<LeaderboardDto> leaderboard = new ArrayList<>();

        int rank = 1;
        for (Object[] row : queryResults) {
            leaderboard.add(LeaderboardDto.builder()
                    .studentId((Long) row[0])
                    .studentName((String) row[1])
                    .studentEmail((String) row[2])
                    .totalScore(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0)
                    .averagePercentage(row[4] != null ? ((Number) row[4]).doubleValue() : 0.0)
                    .averageScore(row[4] != null ? ((Number) row[4]).doubleValue() : 0.0)
                    .examsTaken(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                    .rank(rank++)
                    .build());
        }

        return leaderboard;
    }

    private List<LeaderboardDto> getMonthlyLeaderboard(int year, int month, int limit) {
        List<com.examplatform.result.entity.Result> results = resultRepository.findByYearAndMonth(year, month);
        
        // Group by student ID
        Map<Long, List<com.examplatform.result.entity.Result>> byStudent = results.stream()
                .collect(Collectors.groupingBy(r -> r.getSubmission().getStudent().getId()));

        class StudentStats {
            com.examplatform.user.entity.User student;
            double avgPercentage;
            double avgDuration;
            int examsTaken;
            double totalScore;
        }

        List<StudentStats> statsList = new ArrayList<>();
        
        for (Map.Entry<Long, List<com.examplatform.result.entity.Result>> entry : byStudent.entrySet()) {
            List<com.examplatform.result.entity.Result> studentResults = entry.getValue();
            if (studentResults.isEmpty()) continue;
            
            StudentStats stats = new StudentStats();
            stats.student = studentResults.get(0).getSubmission().getStudent();
            stats.examsTaken = studentResults.size();
            stats.totalScore = studentResults.stream().mapToDouble(com.examplatform.result.entity.Result::getScore).sum();
            stats.avgPercentage = studentResults.stream().mapToDouble(com.examplatform.result.entity.Result::getPercentage).average().orElse(0.0);
            
            stats.avgDuration = studentResults.stream()
                    .filter(r -> r.getSubmission().getStartTime() != null && r.getSubmission().getSubmitTime() != null)
                    .mapToLong(r -> Duration.between(r.getSubmission().getStartTime(), r.getSubmission().getSubmitTime()).getSeconds())
                    .average().orElse(Double.MAX_VALUE);
            
            statsList.add(stats);
        }

        // Sort: percentage DESC, then by duration ASC.
        statsList.sort((a, b) -> {
            int pctCompare = Double.compare(b.avgPercentage, a.avgPercentage);
            if (pctCompare != 0) return pctCompare;
            return Double.compare(a.avgDuration, b.avgDuration);
        });

        List<LeaderboardDto> list = new ArrayList<>();
        int rank = 1;
        for (StudentStats stats : statsList) {
            list.add(LeaderboardDto.builder()
                    .studentId(stats.student.getId())
                    .studentName(stats.student.getFirstName() + " " + stats.student.getLastName())
                    .studentEmail(stats.student.getEmail())
                    .totalScore(stats.totalScore)
                    .averagePercentage(stats.avgPercentage)
                    .averageScore(stats.avgPercentage)
                    .examsTaken((long) stats.examsTaken)
                    .rank(rank++)
                    .build());
            if (list.size() >= limit) break;
        }

        return list;
    }
}
