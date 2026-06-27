package com.examplatform.dashboard.service;

import com.examplatform.dashboard.dto.LeaderboardDto;
import com.examplatform.result.repository.ResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaderboardService {

    private final ResultRepository resultRepository;

    public List<LeaderboardDto> getLeaderboard(int limit) {
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
}
