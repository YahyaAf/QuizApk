package com.examplatform.submission.entity;

import com.examplatform.question.entity.Choice;
import com.examplatform.question.entity.Question;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "answers", indexes = {
    @Index(name = "idx_answers_submission", columnList = "submission_id"),
    @Index(name = "idx_answers_question", columnList = "question_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @JsonIgnore
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "answer_choices",
        joinColumns = @JoinColumn(name = "answer_id"),
        inverseJoinColumns = @JoinColumn(name = "choice_id")
    )
    @Builder.Default
    private Set<Choice> selectedChoices = new HashSet<>();

    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer;

    // Manual grading fields (for TEXT type questions)
    @Column(name = "teacher_score")
    private Double teacherScore;

    @Column(name = "teacher_feedback", columnDefinition = "TEXT")
    private String teacherFeedback;
}
