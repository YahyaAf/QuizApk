package com.examplatform.question.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChoiceDto {
    private Long id;

    @NotBlank(message = "Choice label cannot be blank")
    private String label;

    private Boolean isCorrect; // Nullable to hide correctness from students
}
