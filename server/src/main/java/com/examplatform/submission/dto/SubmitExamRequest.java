package com.examplatform.submission.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitExamRequest {

    @NotNull(message = "Answers list cannot be null")
    @Valid
    private List<AnswerDto> answers;
}
