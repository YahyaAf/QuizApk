package com.examplatform.exam.repository;

import com.examplatform.exam.entity.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    Page<Exam> findByCreatedById(Long teacherId, Pageable pageable);

    @Query("SELECT e FROM Exam e WHERE e.published = true AND e.availableFrom <= :now AND e.availableUntil >= :now AND e.studentGroup.id = :groupId")
    Page<Exam> findAvailableExamsByGroupId(@Param("now") LocalDateTime now, @Param("groupId") Long groupId, Pageable pageable);

    @Query("SELECT e FROM Exam e WHERE e.published = true AND e.studentGroup.id = :groupId AND e.status != 'COMPLETED'")
    Page<Exam> findActiveExamsByGroupId(@Param("groupId") Long groupId, Pageable pageable);

    long countByCreatedById(Long teacherId);

    @Query("SELECT COUNT(DISTINCT e.module.id) FROM Exam e WHERE e.createdBy.id = :teacherId")
    long countDistinctModulesByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(DISTINCT e.studentGroup.id) FROM Exam e WHERE e.createdBy.id = :teacherId")
    long countDistinctGroupsByTeacherId(@Param("teacherId") Long teacherId);
}
