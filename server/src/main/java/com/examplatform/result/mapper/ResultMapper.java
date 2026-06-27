package com.examplatform.result.mapper;

import com.examplatform.question.entity.QuestionType;
import com.examplatform.result.dto.ResultDto;
import com.examplatform.result.entity.Result;
import org.springframework.stereotype.Component;

@Component
public class ResultMapper {

    public ResultDto toDto(Result result) {
        if (result == null) {
            return null;
        }

        // Count text answers in this submission
        int textAnswerCount = (int) result.getSubmission().getExam().getQuestions().stream()
                .filter(q -> q.getType() == QuestionType.TEXT)
                .count();

        Long durationSeconds = null;
        if (result.getSubmission().getStartTime() != null && result.getSubmission().getSubmitTime() != null) {
            durationSeconds = java.time.Duration.between(result.getSubmission().getStartTime(), result.getSubmission().getSubmitTime()).getSeconds();
        }

        return ResultDto.builder()
                .id(result.getId())
                .submissionId(result.getSubmission().getId())
                .examId(result.getSubmission().getExam().getId())
                .examTitle(result.getSubmission().getExam().getTitle())
                .courseName(result.getSubmission().getExam().getModule() != null ? result.getSubmission().getExam().getModule().getName() : null)
                .studentName(result.getSubmission().getStudent().getFirstName() + " " + result.getSubmission().getStudent().getLastName())
                .score(result.getScore())
                .totalQuestions(result.getTotalQuestions())
                .correctAnswers(result.getCorrectAnswers())
                .wrongAnswers(result.getWrongAnswers())
                .percentage(result.getPercentage())
                .passed(result.isPassed())
                .createdAt(result.getCreatedAt())
                .pendingManualGrade(result.isPendingManualGrade())
                .manuallyGraded(result.isManuallyGraded())
                .textAnswerCount(textAnswerCount)
                .durationSeconds(durationSeconds)
                .build();
    }
}
