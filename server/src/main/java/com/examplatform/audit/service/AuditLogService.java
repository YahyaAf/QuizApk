package com.examplatform.audit.service;

import com.examplatform.audit.entity.AuditLog;
import com.examplatform.audit.repository.AuditLogRepository;
import com.examplatform.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(User user, String action, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
