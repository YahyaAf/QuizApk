package com.examplatform.submission.mapper;

import com.examplatform.result.entity.Result;
import com.examplatform.submission.dto.SubmissionDto;
import com.examplatform.submission.entity.Submission;
import org.springframework.stereotype.Component;

@Component
public class SubmissionMapper {

    public SubmissionDto toDto(Submission submission) {
        if (submission == null) {
            return null;
        }

        SubmissionDto.SubmissionDtoBuilder builder = SubmissionDto.builder()
                .id(submission.getId())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getFirstName() + " " + submission.getStudent().getLastName())
                .examId(submission.getExam().getId())
                .examTitle(submission.getExam().getTitle())
                .courseName(submission.getExam().getModule() != null ? submission.getExam().getModule().getName() : null)
                .startTime(submission.getStartTime())
                .submitTime(submission.getSubmitTime());

        Result result = submission.getResult();
        if (result != null) {
            builder.graded(true)
                    .score(result.getScore())
                    .totalQuestions(result.getTotalQuestions())
                    .correctAnswers(result.getCorrectAnswers())
                    .wrongAnswers(result.getWrongAnswers())
                    .percentage(result.getPercentage())
                    .passed(result.isPassed());
        } else {
            builder.graded(false);
        }

        return builder.build();
    }
}
