package com.examplatform.submission.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManualGradeRequest {

    @NotNull(message = "Answer ID is required")
    private Long answerId;

    @NotNull(message = "Score is required")
    private Double score;

    private String feedback;
}
