package com.examplatform.submission.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheatEventRequest {

    @NotBlank(message = "Event type is required")
    private String eventType; // TAB_SWITCH, PASTE, CONTEXT_MENU, VISIBILITY_HIDDEN

    private String details; // Optional extra info
}
