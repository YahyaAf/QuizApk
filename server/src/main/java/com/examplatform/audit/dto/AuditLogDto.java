package com.examplatform.audit.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private String action;
    private String details;
    private String ipAddress;
    private String performedBy;
    private LocalDateTime timestamp;
}
