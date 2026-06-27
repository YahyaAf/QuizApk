package com.examplatform.exam.mapper;

import com.examplatform.exam.dto.ExamDto;
import com.examplatform.exam.entity.Exam;
import org.springframework.stereotype.Component;

@Component
public class ExamMapper {

    public ExamDto toDto(Exam exam) {
        if (exam == null) {
            return null;
        }

        return ExamDto.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .durationMinutes(exam.getDurationMinutes())
                .availableFrom(exam.getAvailableFrom())
                .availableUntil(exam.getAvailableUntil())
                .maxAttempts(exam.getMaxAttempts())
                .moduleId(exam.getModule() != null ? exam.getModule().getId() : null)
                .moduleName(exam.getModule() != null ? exam.getModule().getName() : null)
                .groupId(exam.getStudentGroup() != null ? exam.getStudentGroup().getId() : null)
                .groupName(exam.getStudentGroup() != null ? exam.getStudentGroup().getName() : null)
                .status(exam.getStatus() != null ? exam.getStatus().name() : null)
                .scheduledStartTime(exam.getScheduledStartTime())
                .totalMarks(exam.getTotalMarks())
                .published(exam.isPublished())
                .createdByTeacherId(exam.getCreatedBy().getId())
                .createdByTeacherName(exam.getCreatedBy().getFirstName() + " " + exam.getCreatedBy().getLastName())
                .createdAt(exam.getCreatedAt())
                .build();
    }
}
