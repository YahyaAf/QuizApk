package com.examplatform.exam.entity;

import com.examplatform.common.entity.BaseEntity;
import com.examplatform.question.entity.Question;
import com.examplatform.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams", indexes = {
    @Index(name = "idx_exams_created_by", columnList = "created_by_id"),
    @Index(name = "idx_exams_published", columnList = "published")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "available_from", nullable = false)
    private LocalDateTime availableFrom;

    @Column(name = "available_until", nullable = false)
    private LocalDateTime availableUntil;

    @Builder.Default
    @Column(name = "max_attempts", nullable = false)
    private Integer maxAttempts = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private com.examplatform.school.entity.Module module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private com.examplatform.school.entity.StudentGroup studentGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ExamStatus status = ExamStatus.DRAFT;

    @Column(name = "scheduled_start_time")
    private LocalDateTime scheduledStartTime;

    @Builder.Default
    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean published = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Question> questions = new ArrayList<>();
}
