package com.examplatform.result.service;

import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.exam.entity.Exam;
import com.examplatform.question.entity.Choice;
import com.examplatform.question.entity.Question;
import com.examplatform.question.entity.QuestionType;
import com.examplatform.result.entity.Result;
import com.examplatform.result.repository.ResultRepository;
import com.examplatform.submission.entity.Answer;
import com.examplatform.submission.entity.Submission;
import com.examplatform.submission.repository.SubmissionRepository;
import com.examplatform.result.dto.ResultDto;
import com.examplatform.result.mapper.ResultMapper;
import com.examplatform.user.entity.Badge;
import com.examplatform.user.entity.Role;
import com.examplatform.user.entity.User;
import com.examplatform.user.repository.UserRepository;
import com.examplatform.submission.dto.TextAnswerDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ResultService {

    private final ResultRepository resultRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final ResultMapper resultMapper;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Transactional
    public Result gradeSubmission(Long submissionId) {
        Submission submission = submissionRepository.findByIdWithAnswersAndChoices(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));

        if (submission.getResult() != null) {
            return submission.getResult(); // Already graded
        }

        Exam exam = submission.getExam();
        double totalScore = 0.0;
        int correctCount = 0;
        int wrongCount = 0;
        int totalQuestions = exam.getQuestions().size();
        boolean hasTextQuestions = false;

        for (Answer answer : submission.getAnswers()) {
            Question question = answer.getQuestion();
            boolean isCorrect = false;

            if (question.getType() == QuestionType.SINGLE_CHOICE || question.getType() == QuestionType.TRUE_FALSE) {
                if (answer.getSelectedChoices() != null && answer.getSelectedChoices().size() == 1) {
                    Choice selectedChoice = answer.getSelectedChoices().iterator().next();
                    if (selectedChoice.isCorrect()) {
                        isCorrect = true;
                    }
                }
            } else if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                Set<Long> correctChoiceIds = question.getChoices().stream()
                        .filter(Choice::isCorrect)
                        .map(Choice::getId)
                        .collect(Collectors.toSet());

                Set<Long> selectedChoiceIds = answer.getSelectedChoices().stream()
                        .map(Choice::getId)
                        .collect(Collectors.toSet());

                if (!correctChoiceIds.isEmpty() && correctChoiceIds.equals(selectedChoiceIds)) {
                    isCorrect = true;
                }
            } else if (question.getType() == QuestionType.TEXT) {
                // TEXT questions require manual grading — flag result as pending
                hasTextQuestions = true;
                isCorrect = false;
            }

            if (isCorrect) {
                totalScore += question.getPoints();
                correctCount++;
            } else {
                wrongCount++;
            }
        }

        double totalMarks = exam.getTotalMarks() > 0 ? exam.getTotalMarks() : 1.0;
        double percentage = (totalScore / totalMarks) * 100.0;
        boolean passed = percentage >= 50.0;

        // If there are TEXT questions, don't mark as passed yet — pending manual grading
        if (hasTextQuestions) {
            passed = false;
        }

        Result result = Result.builder()
                .submission(submission)
                .score(totalScore)
                .totalQuestions(totalQuestions)
                .correctAnswers(correctCount)
                .wrongAnswers(wrongCount)
                .percentage(percentage)
                .passed(passed)
                .pendingManualGrade(hasTextQuestions)
                .manuallyGraded(!hasTextQuestions)
                .build();

        Result savedResult = resultRepository.save(result);

        // Award Badges only when no pending manual grading
        if (!hasTextQuestions) {
            awardBadges(submission.getStudent(), percentage, submission);
        }

        return savedResult;
    }

    /**
     * Recalculates and updates a result after a teacher manually grades a TEXT answer.
     */
    @Transactional
    public Result recalculateResultAfterManualGrading(Long resultId) {
        Result result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + resultId));

        Submission submission = result.getSubmission();
        Exam exam = submission.getExam();

        double totalScore = 0.0;
        int correctCount = 0;
        int wrongCount = 0;
        boolean allTextAnswersGraded = true;

        for (Answer answer : submission.getAnswers()) {
            Question question = answer.getQuestion();

            if (question.getType() == QuestionType.TEXT) {
                if (answer.getTeacherScore() != null) {
                    double teacherScore = Math.min(answer.getTeacherScore(), question.getPoints());
                    totalScore += teacherScore;
                    if (teacherScore >= question.getPoints() * 0.5) {
                        correctCount++;
                    } else {
                        wrongCount++;
                    }
                } else {
                    allTextAnswersGraded = false;
                    wrongCount++;
                }
            } else {
                boolean isCorrect = false;
                if (question.getType() == QuestionType.SINGLE_CHOICE || question.getType() == QuestionType.TRUE_FALSE) {
                    if (answer.getSelectedChoices() != null && answer.getSelectedChoices().size() == 1) {
                        isCorrect = answer.getSelectedChoices().iterator().next().isCorrect();
                    }
                } else if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                    Set<Long> correctIds = question.getChoices().stream()
                            .filter(Choice::isCorrect).map(Choice::getId).collect(Collectors.toSet());
                    Set<Long> selectedIds = answer.getSelectedChoices().stream()
                            .map(Choice::getId).collect(Collectors.toSet());
                    isCorrect = !correctIds.isEmpty() && correctIds.equals(selectedIds);
                }
                if (isCorrect) {
                    totalScore += question.getPoints();
                    correctCount++;
                } else {
                    wrongCount++;
                }
            }
        }

        double totalMarks = exam.getTotalMarks() > 0 ? exam.getTotalMarks() : 1.0;
        double percentage = (totalScore / totalMarks) * 100.0;
        boolean passed = percentage >= 50.0;

        result.setScore(totalScore);
        result.setCorrectAnswers(correctCount);
        result.setWrongAnswers(wrongCount);
        result.setPercentage(percentage);
        result.setPendingManualGrade(!allTextAnswersGraded);
        result.setManuallyGraded(allTextAnswersGraded);

        if (allTextAnswersGraded) {
            result.setPassed(passed);
            awardBadges(submission.getStudent(), percentage, submission);
        }

        return resultRepository.save(result);
    }

    public List<TextAnswerDto> getResultAnswers(Long resultId, String email) {
        Result result = getResultEntity(resultId, email);
        Submission submission = result.getSubmission();

        return submission.getAnswers().stream()
                .map(a -> {
                    TextAnswerDto dto = TextAnswerDto.builder()
                            .answerId(a.getId())
                            .questionId(a.getQuestion().getId())
                            .questionStatement(a.getQuestion().getStatement())
                            .questionPoints(a.getQuestion().getPoints())
                            .textAnswer(a.getQuestion().getType() == QuestionType.TEXT ? a.getTextAnswer() : null)
                            .teacherScore(a.getTeacherScore())
                            .teacherFeedback(a.getTeacherFeedback())
                            .graded(a.getTeacherScore() != null)
                            .build();

                    if (a.getQuestion().getType() != QuestionType.TEXT) {
                        boolean isCorrect = evaluateChoiceAnswer(a);
                        dto.setTeacherScore(isCorrect ? a.getQuestion().getPoints() : 0.0);
                        dto.setGraded(true);
                        String selectedText = a.getSelectedChoices().stream()
                                .map(Choice::getLabel)
                                .collect(Collectors.joining(", "));
                        dto.setTextAnswer(selectedText);
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    private boolean evaluateChoiceAnswer(Answer answer) {
        Question q = answer.getQuestion();
        if (q.getType() == QuestionType.SINGLE_CHOICE || q.getType() == QuestionType.TRUE_FALSE) {
            return answer.getSelectedChoices().stream().anyMatch(Choice::isCorrect);
        } else if (q.getType() == QuestionType.MULTIPLE_CHOICE) {
            Set<Long> correctIds = q.getChoices().stream().filter(Choice::isCorrect).map(Choice::getId).collect(Collectors.toSet());
            Set<Long> selectedIds = answer.getSelectedChoices().stream().map(Choice::getId).collect(Collectors.toSet());
            return !correctIds.isEmpty() && correctIds.equals(selectedIds);
        }
        return false;
    }

    private void awardBadges(User student, double percentage, Submission submission) {
        try {
            boolean badgesUpdated = false;

            // 1. Perfect Score Badge
            if (percentage == 100.0) {
                boolean hasPerfectScoreBadge = student.getBadges().stream()
                        .anyMatch(b -> b.getName().equals("PERFECT_SCORE"));
                if (!hasPerfectScoreBadge) {
                    Badge perfectBadge = getOrCreateBadge("PERFECT_SCORE", "Obtenu un score parfait de 100% sur un examen");
                    student.getBadges().add(perfectBadge);
                    badgesUpdated = true;
                    log.info("Student {} earned the PERFECT_SCORE badge!", student.getEmail());
                }
            }

            // 2. Veteran Badge (completed 5 or more exams)
            long completedExams = submissionRepository.findByStudentEmailOrderByStartTimeDesc(student.getEmail()).stream()
                    .filter(s -> s.getResult() != null)
                    .count();

            if (completedExams >= 5) {
                boolean hasVeteranBadge = student.getBadges().stream()
                        .anyMatch(b -> b.getName().equals("EXAM_VETERAN"));
                if (!hasVeteranBadge) {
                    Badge veteranBadge = getOrCreateBadge("EXAM_VETERAN", "Complété au moins 5 examens sur la plateforme");
                    student.getBadges().add(veteranBadge);
                    badgesUpdated = true;
                    log.info("Student {} earned the EXAM_VETERAN badge!", student.getEmail());
                }
            }

            // 3. Speed Runner Badge (finished exam in less than 50% of allowed time with passing grade)
            if (submission.getSubmitTime() != null && submission.getStartTime() != null) {
                long durationSeconds = Duration.between(submission.getStartTime(), submission.getSubmitTime()).getSeconds();
                long allowedSeconds = submission.getExam().getDurationMinutes() * 60L;
                if (durationSeconds < (allowedSeconds / 2) && percentage >= 50.0) {
                    boolean hasSpeedBadge = student.getBadges().stream()
                            .anyMatch(b -> b.getName().equals("SPEED_RUNNER"));
                    if (!hasSpeedBadge) {
                        Badge speedBadge = getOrCreateBadge("SPEED_RUNNER", "Terminé un examen avec succès en moins de la moitié du temps alloué");
                        student.getBadges().add(speedBadge);
                        badgesUpdated = true;
                        log.info("Student {} earned the SPEED_RUNNER badge!", student.getEmail());
                    }
                }
            }

            if (badgesUpdated) {
                userRepository.save(student);
            }
        } catch (Exception e) {
            log.error("Error awarding badges to user {}: {}", student.getEmail(), e.getMessage());
        }
    }

    private Badge getOrCreateBadge(String name, String description) {
        try {
            return entityManager.createQuery("SELECT b FROM Badge b WHERE b.name = :name", Badge.class)
                    .setParameter("name", name)
                    .getSingleResult();
        } catch (jakarta.persistence.NoResultException e) {
            Badge badge = Badge.builder()
                    .name(name)
                    .description(description)
                    .iconUrl(name.toLowerCase() + ".png")
                    .build();
            entityManager.persist(badge);
            return badge;
        }
    }

    public ResultDto getResultById(Long resultId, String email) {
        Result result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + resultId));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ROLE_STUDENT && !result.getSubmission().getStudent().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not have permission to view this result");
        } else if (user.getRole() == Role.ROLE_TEACHER && !result.getSubmission().getExam().getCreatedBy().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not have permission to view results for this exam");
        }

        return resultMapper.toDto(result);
    }

    public Result getResultEntity(Long resultId, String email) {
        Result result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + resultId));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ROLE_STUDENT && !result.getSubmission().getStudent().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not have permission to view this result");
        } else if (user.getRole() == Role.ROLE_TEACHER && !result.getSubmission().getExam().getCreatedBy().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not have permission to view results for this exam");
        }

        return result;
    }

    public List<ResultDto> getMyResults(String email) {
        return resultRepository.findBySubmissionStudentEmailOrderByCreatedAtDesc(email).stream()
                .map(resultMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ResultDto> getTeacherResults(String email) {
        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return resultRepository.findBySubmissionExamCreatedByIdOrderByCreatedAtDesc(teacher.getId()).stream()
                .map(resultMapper::toDto)
                .collect(Collectors.toList());
    }

    public Page<ResultDto> getAllResults(Pageable pageable) {
        return resultRepository.findAll(pageable).map(resultMapper::toDto);
    }

    public List<Result> getResultsByExamId(Long examId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Result> results = resultRepository.findBySubmissionExamIdOrderByCreatedAtDesc(examId);
        
        if (!results.isEmpty()) {
            Result firstResult = results.get(0);
            if (user.getRole() == Role.ROLE_TEACHER && !firstResult.getSubmission().getExam().getCreatedBy().getEmail().equals(email)) {
                throw new AccessDeniedException("You do not have permission to view results for this exam");
            }
        }
        
        return results;
    }
}
