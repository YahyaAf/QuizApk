package com.examplatform.result.entity;

import com.examplatform.common.entity.BaseEntity;
import com.examplatform.submission.entity.Submission;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "results", indexes = {
    @Index(name = "idx_results_submission", columnList = "submission_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    @JsonIgnore
    private Submission submission;

    @Builder.Default
    @Column(nullable = false)
    private Double score = 0.0;

    @Builder.Default
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions = 0;

    @Builder.Default
    @Column(name = "correct_answers", nullable = false)
    private Integer correctAnswers = 0;

    @Builder.Default
    @Column(name = "wrong_answers", nullable = false)
    private Integer wrongAnswers = 0;

    @Builder.Default
    @Column(nullable = false)
    private Double percentage = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private boolean passed = false;

    // Manual grading flags (for exams containing TEXT questions)
    @Builder.Default
    @Column(name = "pending_manual_grade", nullable = false)
    private boolean pendingManualGrade = false;

    @Builder.Default
    @Column(name = "manually_graded", nullable = false)
    private boolean manuallyGraded = false;
}
