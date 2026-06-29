package com.examplatform.result.repository;

import com.examplatform.result.entity.Result;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findBySubmissionStudentEmailOrderByCreatedAtDesc(String email);

    List<Result> findBySubmissionExamCreatedByIdOrderByCreatedAtDesc(Long teacherId);

    List<Result> findBySubmissionExamIdOrderByCreatedAtDesc(Long examId);

    @Query("SELECT AVG(r.percentage) FROM Result r WHERE r.submission.exam.id = :examId")
    Double getAveragePercentageByExamId(@Param("examId") Long examId);

    @Query("SELECT AVG(r.percentage) FROM Result r WHERE r.submission.student.id = :studentId")
    Double getAveragePercentageByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT SUM(r.score) FROM Result r WHERE r.submission.student.id = :studentId")
    Double getTotalScoreByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT r.submission.student.id FROM Result r GROUP BY r.submission.student.id HAVING MIN(r.percentage) = 100")
    List<Long> findStudentsWithPerfectScoreInAllExams();

    @Query("SELECT r.submission.student.id FROM Result r GROUP BY r.submission.student.id HAVING AVG(r.percentage) > 60.0")
    List<Long> findStudentsWithAverageOver60();

    @Query("SELECT r.submission.student.id as studentId, " +
           "CONCAT(r.submission.student.firstName, ' ', r.submission.student.lastName) as studentName, " +
           "r.submission.student.email as studentEmail, " +
           "SUM(r.score) as totalScore, " +
           "AVG(r.percentage) as avgPercentage, " +
           "COUNT(r) as examsTaken " +
           "FROM Result r " +
           "GROUP BY r.submission.student.id, r.submission.student.firstName, r.submission.student.lastName, r.submission.student.email " +
           "ORDER BY AVG(r.percentage) DESC, COUNT(r) DESC")
    List<Object[]> getLeaderboardData(Pageable pageable);

    @Query("SELECT COUNT(r) FROM Result r WHERE r.pendingManualGrade = true AND r.submission.exam.createdBy.id = :teacherId")
    long countPendingManualGradeByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT AVG(r.percentage) FROM Result r WHERE r.submission.exam.createdBy.id = :teacherId")
    Double getAveragePercentageByTeacherId(@Param("teacherId") Long teacherId);

    Optional<Result> findBySubmissionId(Long submissionId);

    List<Result> findByPendingManualGradeTrueOrderByCreatedAtAsc();

    @Query("SELECT r FROM Result r WHERE r.pendingManualGrade = true AND r.submission.exam.createdBy.id = :teacherId ORDER BY r.createdAt ASC")
    List<Result> findPendingManualGradeByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT r FROM Result r WHERE EXTRACT(YEAR FROM r.createdAt) = :year AND EXTRACT(MONTH FROM r.createdAt) = :month")
    List<Result> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
}
