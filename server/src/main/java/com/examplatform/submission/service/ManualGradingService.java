package com.examplatform.submission.service;

import com.examplatform.common.exception.BadRequestException;
import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.question.entity.QuestionType;
import com.examplatform.result.entity.Result;
import com.examplatform.result.repository.ResultRepository;
import com.examplatform.result.service.ResultService;
import com.examplatform.submission.dto.ManualGradeRequest;
import com.examplatform.submission.dto.PendingGradingDto;
import com.examplatform.submission.dto.TextAnswerDto;
import com.examplatform.submission.entity.Answer;
import com.examplatform.submission.entity.Submission;
import com.examplatform.submission.repository.AnswerRepository;
import com.examplatform.submission.repository.SubmissionRepository;
import com.examplatform.user.entity.User;
import com.examplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ManualGradingService {

    private final ResultRepository resultRepository;
    private final SubmissionRepository submissionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final ResultService resultService;

    /**
     * Returns all submissions awaiting manual grading for the given teacher.
     */
    public List<PendingGradingDto> getPendingGradingForTeacher(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherEmail));

        List<Result> pendingResults = resultRepository.findPendingManualGradeByTeacherId(teacher.getId());

        return pendingResults.stream().map(result -> buildPendingGradingDto(result.getSubmission(), result))
                .collect(Collectors.toList());
    }

    /**
     * Returns the text answers of a given submission (for teacher review).
     */
    public List<TextAnswerDto> getTextAnswersForSubmission(Long submissionId, String teacherEmail) {
        Submission submission = submissionRepository.findByIdWithAnswersAndChoices(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (!submission.getExam().getCreatedBy().getEmail().equals(teacherEmail)) {
            throw new AccessDeniedException("You do not have access to this submission");
        }

        return mapToTextAnswerDtos(submission);
    }

    /**
     * Grades a specific text answer and recalculates the result.
     */
    @Transactional
    public PendingGradingDto gradeTextAnswer(Long submissionId, ManualGradeRequest request, String teacherEmail) {
        Submission submission = submissionRepository.findByIdWithAnswersAndChoices(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (!submission.getExam().getCreatedBy().getEmail().equals(teacherEmail)) {
            throw new AccessDeniedException("You do not have access to this submission");
        }

        Answer answer = submission.getAnswers().stream()
                .filter(a -> a.getId().equals(request.getAnswerId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found: " + request.getAnswerId()));

        if (answer.getQuestion().getType() != QuestionType.TEXT) {
            throw new BadRequestException("Only TEXT type answers can be manually graded");
        }

        double maxScore = answer.getQuestion().getPoints();
        if (request.getScore() < 0 || request.getScore() > maxScore) {
            throw new BadRequestException("Score must be between 0 and " + maxScore);
        }

        answer.setTeacherScore(request.getScore());
        answer.setTeacherFeedback(request.getFeedback());
        answerRepository.save(answer);

        Result result = submission.getResult();
        resultService.recalculateResultAfterManualGrading(result.getId());

        log.info("Teacher {} graded answer {} for submission {} with score {}/{}",
                teacherEmail, answer.getId(), submissionId, request.getScore(), maxScore);

        Result updatedResult = resultRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found for submission: " + submissionId));

        return buildPendingGradingDto(submission, updatedResult);
    }

    private List<TextAnswerDto> mapToTextAnswerDtos(Submission submission) {
        return submission.getAnswers().stream()
                .filter(a -> a.getQuestion().getType() == QuestionType.TEXT)
                .map(a -> TextAnswerDto.builder()
                        .answerId(a.getId())
                        .questionId(a.getQuestion().getId())
                        .questionStatement(a.getQuestion().getStatement())
                        .questionPoints(a.getQuestion().getPoints())
                        .textAnswer(a.getTextAnswer())
                        .teacherScore(a.getTeacherScore())
                        .teacherFeedback(a.getTeacherFeedback())
                        .graded(a.getTeacherScore() != null)
                        .build())
                .collect(Collectors.toList());
    }

    private PendingGradingDto buildPendingGradingDto(Submission submission, Result result) {
        List<TextAnswerDto> textAnswers = mapToTextAnswerDtos(submission);
        long pendingCount = textAnswers.stream().filter(t -> !t.isGraded()).count();

        return PendingGradingDto.builder()
                .submissionId(submission.getId())
                .resultId(result.getId())
                .examId(submission.getExam().getId())
                .examTitle(submission.getExam().getTitle())
                .courseName(submission.getExam().getModule() != null ? submission.getExam().getModule().getName() : null)
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getFirstName() + " " + submission.getStudent().getLastName())
                .submitTime(submission.getSubmitTime())
                .pendingTextAnswers((int) pendingCount)
                .totalTextAnswers(textAnswers.size())
                .textAnswers(textAnswers)
                .build();
    }
}
