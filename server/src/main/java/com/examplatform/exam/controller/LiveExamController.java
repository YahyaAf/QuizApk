package com.examplatform.exam.controller;

import com.examplatform.exam.entity.Exam;
import com.examplatform.exam.entity.ExamStatus;
import com.examplatform.exam.repository.ExamRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

@Controller
@RequiredArgsConstructor
@SuppressWarnings("null")
public class LiveExamController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ExamRepository examRepository;

    @Data
    public static class JoinMessage {
        private String studentEmail;
        private String studentName;
    }

    @MessageMapping("/exam/{examId}/join")
    public void joinRoom(@DestinationVariable Long examId, @Payload JoinMessage message) {
        // Broadcast that a student joined
        messagingTemplate.convertAndSend("/topic/exam/" + examId, 
            new LiveMessage("STUDENT_JOINED", message.getStudentName() + " joined the waiting room."));
    }

    @MessageMapping("/exam/{examId}/start")
    @Transactional
    public void startExam(@DestinationVariable Long examId) {
        Exam exam = examRepository.findById(examId).orElse(null);
        if (exam != null && (exam.getStatus() == ExamStatus.WAITING_ROOM_OPEN || exam.getStatus() == ExamStatus.SCHEDULED)) {
            exam.setStatus(ExamStatus.IN_PROGRESS);
            examRepository.save(exam);
            
            // Broadcast START to all students in waiting room
            messagingTemplate.convertAndSend("/topic/exam/" + examId, 
                new LiveMessage("EXAM_STARTED", "The exam has started!"));
        }
    }

    @MessageMapping("/exam/{examId}/lock")
    @Transactional
    public void lockRoom(@DestinationVariable Long examId) {
        // Similar to start but maybe just prevents new joins without starting the timer
        messagingTemplate.convertAndSend("/topic/exam/" + examId, 
            new LiveMessage("ROOM_LOCKED", "Waiting room is now locked."));
    }

    @Data
    @RequiredArgsConstructor
    public static class LiveMessage {
        private final String type;
        private final String content;
    }
}
