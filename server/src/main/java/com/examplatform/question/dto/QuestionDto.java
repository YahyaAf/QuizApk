package com.examplatform.question.dto;

import com.examplatform.question.entity.QuestionType;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionDto {
    private Long id;

    @NotBlank(message = "Question statement cannot be blank")
    private String statement;

    @NotNull(message = "Question type is required")
    private QuestionType type;

    @NotNull(message = "Question points weight is required")
    @Min(value = 1, message = "Points must be at least 1")
    private Integer points;

    private String explanation; // Hide from students during exam

    @Valid
    private List<ChoiceDto> choices;
}
