package com.examplatform.submission.repository;

import com.examplatform.submission.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByStudentEmailOrderByStartTimeDesc(String email);

    long countByStudentIdAndExamId(Long studentId, Long examId);

    @Query("SELECT s FROM Submission s LEFT JOIN FETCH s.answers a LEFT JOIN FETCH a.selectedChoices WHERE s.id = :id")
    Optional<Submission> findByIdWithAnswersAndChoices(@Param("id") Long id);

    List<Submission> findByExamId(Long examId);

    long countByExamId(Long examId);

    @Query("SELECT DISTINCT s FROM Submission s LEFT JOIN FETCH s.answers a LEFT JOIN FETCH a.selectedChoices LEFT JOIN FETCH s.result WHERE s.exam.id = :examId")
    List<Submission> findByExamIdWithAnswersAndChoices(@Param("examId") Long examId);

    @Query("SELECT COUNT(DISTINCT s.student.id) FROM Submission s WHERE s.exam.id = :examId")
    long countDistinctParticipantsByExamId(@Param("examId") Long examId);

    @Query("SELECT COUNT(DISTINCT s.student.id) FROM Submission s WHERE s.submitTime >= :since")
    long countDistinctStudentsActiveSince(@Param("since") java.time.LocalDateTime since);

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.exam.createdBy.id = :teacherId")
    long countSubmissionsByTeacherId(@Param("teacherId") Long teacherId);
}
