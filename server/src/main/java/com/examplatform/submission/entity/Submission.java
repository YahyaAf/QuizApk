package com.examplatform.submission.entity;

import com.examplatform.common.entity.BaseEntity;
import com.examplatform.exam.entity.Exam;
import com.examplatform.result.entity.Result;
import com.examplatform.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "submissions", indexes = {
    @Index(name = "idx_submissions_student", columnList = "student_id"),
    @Index(name = "idx_submissions_exam", columnList = "exam_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "submit_time")
    private LocalDateTime submitTime;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Answer> answers = new ArrayList<>();

    @OneToOne(mappedBy = "submission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Result result;
}
