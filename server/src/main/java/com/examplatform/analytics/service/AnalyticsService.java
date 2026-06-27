package com.examplatform.analytics.service;

import com.examplatform.analytics.dto.QuestionStatDto;
import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.exam.repository.ExamRepository;
import com.examplatform.question.entity.Choice;
import com.examplatform.question.entity.Question;
import com.examplatform.question.entity.QuestionType;
import com.examplatform.question.repository.QuestionRepository;
import com.examplatform.submission.entity.Answer;
import com.examplatform.submission.entity.Submission;
import com.examplatform.submission.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;

    /**
     * Computes per-question success statistics for a given exam.
     * For each question, calculates how many submissions answered it correctly.
     */
    public List<QuestionStatDto> getQuestionStatsForExam(Long examId) {
        examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        List<Question> questions = questionRepository.findByExamIdWithChoices(examId);
        List<Submission> submissions = submissionRepository.findByExamIdWithAnswersAndChoices(examId);

        // Only grade completed (submitted) submissions
        List<Submission> gradedSubmissions = submissions.stream()
                .filter(s -> s.getResult() != null)
                .collect(Collectors.toList());

        List<QuestionStatDto> stats = new ArrayList<>();

        for (Question question : questions) {
            int totalAttempts = 0;
            int correctAttempts = 0;

            for (Submission submission : gradedSubmissions) {
                // Find the answer for this question in this submission
                Optional<Answer> answerOpt = submission.getAnswers().stream()
                        .filter(a -> a.getQuestion().getId().equals(question.getId()))
                        .findFirst();

                if (answerOpt.isEmpty()) continue;
                totalAttempts++;

                Answer answer = answerOpt.get();
                boolean isCorrect = evaluateAnswer(question, answer);
                if (isCorrect) correctAttempts++;
            }

            double successRate = totalAttempts > 0
                    ? ((double) correctAttempts / totalAttempts) * 100.0
                    : 0.0;

            stats.add(QuestionStatDto.builder()
                    .questionId(question.getId())
                    .statement(question.getStatement())
                    .questionType(question.getType().name())
                    .totalAttempts(totalAttempts)
                    .correctAttempts(correctAttempts)
                    .successRate(Math.round(successRate * 10.0) / 10.0)
                    .points(question.getPoints())
                    .build());
        }

        // Sort by success rate ascending (hardest first)
        stats.sort(Comparator.comparingDouble(QuestionStatDto::getSuccessRate));
        return stats;
    }

    private boolean evaluateAnswer(Question question, Answer answer) {
        if (question.getType() == QuestionType.SINGLE_CHOICE || question.getType() == QuestionType.TRUE_FALSE) {
            if (answer.getSelectedChoices() == null || answer.getSelectedChoices().size() != 1) return false;
            return answer.getSelectedChoices().iterator().next().isCorrect();
        } else if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
            Set<Long> correctIds = question.getChoices().stream()
                    .filter(Choice::isCorrect)
                    .map(Choice::getId)
                    .collect(Collectors.toSet());
            Set<Long> selectedIds = answer.getSelectedChoices().stream()
                    .map(Choice::getId)
                    .collect(Collectors.toSet());
            return !correctIds.isEmpty() && correctIds.equals(selectedIds);
        }
        return false;
    }
}
