package com.examplatform.submission.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerDto {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private Set<Long> selectedChoiceIds; // For SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE

    private String textAnswer; // For TEXT questions
}
