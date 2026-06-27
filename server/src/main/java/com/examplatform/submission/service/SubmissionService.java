package com.examplatform.submission.service;

import com.examplatform.common.exception.BadRequestException;
import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.exam.entity.Exam;
import com.examplatform.exam.repository.ExamRepository;
import com.examplatform.question.entity.Choice;
import com.examplatform.question.entity.Question;
import com.examplatform.question.entity.QuestionType;
import com.examplatform.question.repository.ChoiceRepository;
import com.examplatform.question.repository.QuestionRepository;
import com.examplatform.result.entity.Result;
import com.examplatform.result.service.ResultService;
import com.examplatform.submission.dto.AnswerDto;
import com.examplatform.submission.dto.SubmissionDto;
import com.examplatform.submission.dto.SubmitExamRequest;
import com.examplatform.submission.entity.Answer;
import com.examplatform.submission.entity.Submission;
import com.examplatform.submission.mapper.SubmissionMapper;
import com.examplatform.submission.repository.SubmissionRepository;
import com.examplatform.user.entity.User;
import com.examplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ExamRepository examRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final ChoiceRepository choiceRepository;
    private final ResultService resultService;
    private final SubmissionMapper submissionMapper;

    @Transactional
    public SubmissionDto startExam(Long examId, String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        if (!exam.isPublished()) {
            throw new BadRequestException("Exam is not active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getAvailableFrom()) || now.isAfter(exam.getAvailableUntil())) {
            throw new BadRequestException("This exam is not available at the moment");
        }

        // Check if there is an ongoing unsubmitted attempt
        java.util.List<Submission> existingSubmissions = submissionRepository.findByStudentEmailOrderByStartTimeDesc(email);
        java.util.Optional<Submission> activeSubmission = existingSubmissions.stream()
                .filter(s -> s.getExam().getId().equals(examId) && s.getSubmitTime() == null)
                .findFirst();

        if (activeSubmission.isPresent()) {
            Submission abandoned = activeSubmission.get();
            // Grace period of 10 seconds to allow React StrictMode double-fetches
            if (abandoned.getStartTime().plusSeconds(10).isAfter(now)) {
                return submissionMapper.toDto(abandoned);
            }
            
            log.info("Student {} abandoned submission {}. Auto-submitting to consume the attempt.", email, abandoned.getId());
            autoSubmit(abandoned);
        }

        long attempts = submissionRepository.countByStudentIdAndExamId(student.getId(), exam.getId());
        if (attempts >= exam.getMaxAttempts()) {
            throw new BadRequestException("You have reached the maximum number of attempts (" + exam.getMaxAttempts() + ") for this exam");
        }

        Submission submission = Submission.builder()
                .student(student)
                .exam(exam)
                .startTime(now)
                .build();

        return submissionMapper.toDto(submissionRepository.save(submission));
    }

    @Transactional
    public SubmissionDto saveAnswers(Long submissionId, SubmitExamRequest request, String email) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        validateOwnership(submission, email);

        if (submission.getSubmitTime() != null) {
            throw new BadRequestException("This exam session has already been submitted");
        }

        Exam exam = submission.getExam();
        LocalDateTime now = LocalDateTime.now();
        
        // Auto-submit condition: check if duration limit has expired
        if (submission.getStartTime().plusMinutes(exam.getDurationMinutes()).isBefore(now)) {
            log.info("Submission {} time limit exceeded. Auto-submitting.", submissionId);
            return autoSubmit(submission);
        }

        persistAnswers(submission, request.getAnswers());
        return submissionMapper.toDto(submissionRepository.save(submission));
    }

    @Transactional
    public SubmissionDto submitExam(Long submissionId, SubmitExamRequest request, String email) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        validateOwnership(submission, email);

        if (submission.getSubmitTime() != null) {
            throw new BadRequestException("This exam has already been submitted");
        }

        Exam exam = submission.getExam();
        LocalDateTime now = LocalDateTime.now();

        if (submission.getStartTime().plusMinutes(exam.getDurationMinutes()).isBefore(now)) {
            // Auto-submit whatever was saved
            log.info("Submission {} time limit exceeded during submission. Auto-submitting.", submissionId);
            return autoSubmit(submission);
        }

        persistAnswers(submission, request.getAnswers());
        submission.setSubmitTime(now);
        Submission savedSubmission = submissionRepository.saveAndFlush(submission);

        // Grade immediately
        Result result = resultService.gradeSubmission(savedSubmission.getId());
        savedSubmission.setResult(result);

        return submissionMapper.toDto(savedSubmission);
    }

    @Transactional
    public SubmissionDto autoSubmit(Submission submission) {
        LocalDateTime maxSubmitTime = submission.getStartTime().plusMinutes(submission.getExam().getDurationMinutes());
        submission.setSubmitTime(maxSubmitTime);
        Submission savedSubmission = submissionRepository.saveAndFlush(submission);

        // Grade with whatever answers were saved
        Result result = resultService.gradeSubmission(savedSubmission.getId());
        savedSubmission.setResult(result);

        return submissionMapper.toDto(savedSubmission);
    }

    // Helpers

    private void validateOwnership(Submission submission, String email) {
        if (!submission.getStudent().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not have permission to access this exam session");
        }
    }

    private void persistAnswers(Submission submission, List<AnswerDto> answerDtos) {
        if (answerDtos == null) return;

        for (AnswerDto answerDto : answerDtos) {
            Question question = questionRepository.findById(answerDto.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + answerDto.getQuestionId()));

            if (!question.getExam().getId().equals(submission.getExam().getId())) {
                throw new BadRequestException("Question does not belong to this exam");
            }

            // Find existing answer or create new
            Optional<Answer> existingAnswerOpt = submission.getAnswers().stream()
                    .filter(a -> a.getQuestion().getId().equals(question.getId()))
                    .findFirst();

            Answer answer;
            if (existingAnswerOpt.isPresent()) {
                answer = existingAnswerOpt.get();
            } else {
                answer = Answer.builder()
                        .submission(submission)
                        .question(question)
                        .build();
                submission.getAnswers().add(answer);
            }

            if (question.getType() == QuestionType.TEXT) {
                answer.setTextAnswer(answerDto.getTextAnswer());
                answer.setSelectedChoices(new HashSet<>());
            } else {
                answer.setTextAnswer(null);
                answer.getSelectedChoices().clear();

                if (answerDto.getSelectedChoiceIds() != null && !answerDto.getSelectedChoiceIds().isEmpty()) {
                    List<Choice> choices = choiceRepository.findAllById(answerDto.getSelectedChoiceIds());
                    // Verify choices belong to the question
                    for (Choice choice : choices) {
                        if (!choice.getQuestion().getId().equals(question.getId())) {
                            throw new BadRequestException("Choice " + choice.getId() + " does not belong to question " + question.getId());
                        }
                    }
                    answer.getSelectedChoices().addAll(choices);
                }
            }
        }
    }

    @Transactional
    public void logCheatEvent(Long submissionId, com.examplatform.submission.dto.CheatEventRequest request, String email) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));
        if (!submission.getStudent().getEmail().equals(email)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        log.warn("[ANTI-CHEAT] SubmissionId={} | Student={} | Event={} | Details={}",
                submissionId, email, request.getEventType(), request.getDetails());
    }
}
