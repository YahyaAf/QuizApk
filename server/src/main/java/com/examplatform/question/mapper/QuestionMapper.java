package com.examplatform.question.mapper;

import com.examplatform.question.dto.ChoiceDto;
import com.examplatform.question.dto.QuestionDto;
import com.examplatform.question.entity.Choice;
import com.examplatform.question.entity.Question;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class QuestionMapper {

    public QuestionDto toDto(Question question) {
        if (question == null) {
            return null;
        }

        return QuestionDto.builder()
                .id(question.getId())
                .statement(question.getStatement())
                .type(question.getType())
                .points(question.getPoints())
                .explanation(question.getExplanation())
                .choices(question.getChoices() == null ? Collections.emptyList() :
                        question.getChoices().stream()
                                .map(this::toChoiceDto)
                                .collect(Collectors.toList()))
                .build();
    }

    public ChoiceDto toChoiceDto(Choice choice) {
        if (choice == null) {
            return null;
        }

        return ChoiceDto.builder()
                .id(choice.getId())
                .label(choice.getLabel())
                .isCorrect(choice.isCorrect())
                .build();
    }

    // Secure mappings for students taking the exam

    public QuestionDto toDtoForStudent(Question question) {
        if (question == null) {
            return null;
        }

        return QuestionDto.builder()
                .id(question.getId())
                .statement(question.getStatement())
                .type(question.getType())
                .points(question.getPoints())
                .explanation(null) // Strip explanation during exam
                .choices(question.getChoices() == null ? Collections.emptyList() :
                        question.getChoices().stream()
                                .map(this::toChoiceDtoForStudent)
                                .collect(Collectors.toList()))
                .build();
    }

    public ChoiceDto toChoiceDtoForStudent(Choice choice) {
        if (choice == null) {
            return null;
        }

        return ChoiceDto.builder()
                .id(choice.getId())
                .label(choice.getLabel())
                .isCorrect(null) // Strip correction flag during exam
                .build();
    }
}
