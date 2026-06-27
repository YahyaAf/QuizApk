package com.examplatform.dashboard.service;

import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.dashboard.dto.AdminDashboardDto;
import com.examplatform.dashboard.dto.ExamAverageDto;
import com.examplatform.dashboard.dto.StudentDashboardDto;
import com.examplatform.dashboard.dto.TeacherDashboardDto;
import com.examplatform.exam.entity.Exam;
import com.examplatform.exam.repository.ExamRepository;
import com.examplatform.result.repository.ResultRepository;
import com.examplatform.submission.repository.SubmissionRepository;
import com.examplatform.user.entity.Role;
import com.examplatform.user.entity.User;
import com.examplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final SubmissionRepository submissionRepository;
    private final ResultRepository resultRepository;
    private final LeaderboardService leaderboardService;

    public AdminDashboardDto getAdminDashboard() {
        long activeStudents = submissionRepository.countDistinctStudentsActiveSince(java.time.LocalDateTime.now().minusDays(30));
        return AdminDashboardDto.builder()
                .totalUsers(userRepository.count())
                .totalStudents(userRepository.countByRole(Role.ROLE_STUDENT))
                .totalTeachers(userRepository.countByRole(Role.ROLE_TEACHER))
                .totalExams(examRepository.count())
                .totalSubmissions(submissionRepository.count())
                .activeStudents(activeStudents)
                .build();
    }

    public TeacherDashboardDto getTeacherDashboard(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long teacherId = teacher.getId();
        long examsCreated = examRepository.countByCreatedById(teacherId);

        // Get total participants (distinct students across all teacher's exams)
        List<Exam> teacherExams = examRepository.findAll().stream()
                .filter(e -> e.getCreatedBy().getId().equals(teacherId))
                .toList();

        long totalParticipants = 0;
        List<ExamAverageDto> averages = new ArrayList<>();

        for (Exam exam : teacherExams) {
            long participants = submissionRepository.countDistinctParticipantsByExamId(exam.getId());
            totalParticipants += participants;

            Double avg = resultRepository.getAveragePercentageByExamId(exam.getId());
            averages.add(ExamAverageDto.builder()
                    .examId(exam.getId())
                    .examTitle(exam.getTitle())
                    .averagePercentage(avg != null ? avg : 0.0)
                    .build());
        }

        long totalSubmissions = submissionRepository.countSubmissionsByTeacherId(teacherId);
        Double globalAvg = resultRepository.getAveragePercentageByTeacherId(teacherId);
        long pendingGrading = resultRepository.countPendingManualGradeByTeacherId(teacherId);
        long moduleCount = examRepository.countDistinctModulesByTeacherId(teacherId);
        long groupCount = examRepository.countDistinctGroupsByTeacherId(teacherId);

        List<TeacherDashboardDto.RecentExamDto> recentExams = examRepository.findByCreatedById(
                teacherId,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id"))
        ).getContent().stream()
                .map(e -> TeacherDashboardDto.RecentExamDto.builder()
                        .id(e.getId())
                        .title(e.getTitle())
                        .status(e.getStatus().name())
                        .submissionCount(submissionRepository.countByExamId(e.getId()))
                        .build())
                .toList();

        return TeacherDashboardDto.builder()
                .examsCreated(examsCreated)
                .totalParticipants(totalParticipants)
                .averageScoreByExam(averages)
                .totalExams(examsCreated)
                .totalSubmissions(totalSubmissions)
                .averageScore(globalAvg != null ? globalAvg : 0.0)
                .pendingGrading(pendingGrading)
                .moduleCount(moduleCount)
                .groupCount(groupCount)
                .recentExams(recentExams)
                .build();
    }

    public StudentDashboardDto getStudentDashboard(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long examsTaken = submissionRepository.findByStudentEmailOrderByStartTimeDesc(studentEmail).stream()
                .filter(s -> s.getSubmitTime() != null)
                .count();

        Double avgScore = resultRepository.getAveragePercentageByStudentId(student.getId());

        // Dynamic rank calculation: find student in the leaderboard
        long rank = 0;
        var fullLeaderboard = leaderboardService.getLeaderboard(100000); // Get large range to find student rank
        for (var entry : fullLeaderboard) {
            if (entry.getStudentId().equals(student.getId())) {
                rank = entry.getRank();
                break;
            }
        }

        // Calculate streak (consecutive days of submissions)
        int streak = 0;
        java.time.LocalDate today = java.time.LocalDate.now();
        java.util.Set<java.time.LocalDate> submissionDates = submissionRepository.findByStudentEmailOrderByStartTimeDesc(studentEmail).stream()
                .filter(s -> s.getSubmitTime() != null)
                .map(s -> s.getSubmitTime().toLocalDate())
                .collect(java.util.stream.Collectors.toSet());
        
        java.time.LocalDate checkDate = today;
        while (submissionDates.contains(checkDate) || (streak == 0 && submissionDates.contains(today.minusDays(1)))) {
            // Allow starting the streak from yesterday if no submission today yet
            if (streak == 0 && !submissionDates.contains(today) && submissionDates.contains(today.minusDays(1))) {
                checkDate = today.minusDays(1);
            }
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        // Random daily tip
        String[] TIPS = {
            "Pratiquez régulièrement avec de petits tests pour améliorer votre rétention d'information !",
            "Relisez vos notes avant de commencer un examen pour vous rafraîchir la mémoire.",
            "Prenez des pauses régulières pendant vos révisions pour garder l'esprit clair.",
            "Ne vous précipitez pas : lisez attentivement chaque question avant d'y répondre.",
            "L'erreur est formatrice : revoyez vos anciens examens pour comprendre vos fautes."
        };
        String dailyTip = TIPS[(int)(Math.random() * TIPS.length)];

        return StudentDashboardDto.builder()
                .examsTaken(examsTaken)
                .averageScore(avgScore != null ? avgScore : 0.0)
                .globalRank(rank)
                .currentStreak(streak)
                .dailyTip(dailyTip)
                .build();
    }
}
