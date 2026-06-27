package com.examplatform.question.repository;

import com.examplatform.question.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.choices WHERE q.exam.id = :examId ORDER BY q.id ASC")
    List<Question> findByExamIdWithChoices(@Param("examId") Long examId);

    List<Question> findByExamId(Long examId);
}
