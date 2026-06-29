package com.examplatform.user.service;

import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.result.repository.ResultRepository;
import com.examplatform.user.dto.UserDto;
import com.examplatform.user.entity.Badge;
import com.examplatform.user.entity.Role;
import com.examplatform.user.entity.User;
import com.examplatform.user.mapper.UserMapper;
import com.examplatform.user.repository.BadgeRepository;
import com.examplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final ResultRepository resultRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<UserDto> getAllStudents() {
        return userRepository.findByRole(Role.ROLE_STUDENT)
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void assignManualBadge(Long studentId, String name, String iconUrl, String description, String color) {
        if (studentId == null) throw new IllegalArgumentException("Student ID cannot be null");
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Badge badge = getOrCreateBadge(name, description, iconUrl, color);
        student.getBadges().add(badge);
        userRepository.save(student);
        log.info("Assigned manual badge '{}' to student {}", name, student.getEmail());
    }

    @Transactional
    public void calculateAndAssignAutomaticBadges() {
        log.info("Starting automatic badge calculation...");

        // 1. Top 1, 2, 3 Badges
        List<Object[]> leaderboard = resultRepository.getLeaderboardData(PageRequest.of(0, 100)); // Get top 100
        
        for (int i = 0; i < leaderboard.size(); i++) {
            Long studentId = (Long) leaderboard.get(i)[0];
            if (studentId == null) continue;
            User student = userRepository.findById(studentId).orElse(null);
            if (student == null) continue;

            // Assign Top 1/2/3
            if (i == 0) {
                student.getBadges().add(getOrCreateBadge("Top 1", "Premier(e) du classement général", "Trophy", "#F7AD19"));
            } else if (i == 1) {
                student.getBadges().add(getOrCreateBadge("Top 2", "Deuxième du classement général", "Medal", "#9CA3AF"));
            } else if (i == 2) {
                student.getBadges().add(getOrCreateBadge("Top 3", "Troisième du classement général", "Medal", "#D97706"));
            }

            // Assign Top 10/30/100
            if (i < 10) {
                student.getBadges().add(getOrCreateBadge("Top 10", "Parmi les 10 meilleurs étudiants", "Star", "#429EBD"));
            }
            if (i < 30) {
                student.getBadges().add(getOrCreateBadge("Top 30", "Parmi les 30 meilleurs étudiants", "Award", "#053F5C"));
            }
            if (i < 100) {
                student.getBadges().add(getOrCreateBadge("Top 100", "Parmi les 100 meilleurs étudiants", "Shield", "#6B9AB8"));
            }
            
            userRepository.save(student);
        }

        List<Long> perfectStudents = resultRepository.findStudentsWithPerfectScoreInAllExams();
        for (Long studentId : perfectStudents) {
            if (studentId == null) continue;
            userRepository.findById(studentId).ifPresent(student -> {
                student.getBadges().add(getOrCreateBadge("Score Parfait", "Score de 100% à tous les examens passés", "Crown", "#16A34A"));
                userRepository.save(student);
            });
        }

        List<Long> goodAverageStudents = resultRepository.findStudentsWithAverageOver60();
        for (Long studentId : goodAverageStudents) {
            if (studentId == null) continue;
            userRepository.findById(studentId).ifPresent(student -> {
                student.getBadges().add(getOrCreateBadge("Bonne Moyenne", "Moyenne générale supérieure à 60%", "TrendingUp", "#92400E"));
                userRepository.save(student);
            });
        }

        log.info("Finished automatic badge calculation.");
    }

    private Badge getOrCreateBadge(String name, String description, String iconUrl, String color) {
        return badgeRepository.findByName(name).orElseGet(() -> {
            Badge badge = new Badge();
            badge.setName(name);
            badge.setDescription(description);
            badge.setIconUrl(iconUrl);
            badge.setColor(color);
            return badgeRepository.save(badge);
        });
    }
}
