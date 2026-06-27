package com.examplatform.exam.service;

import com.examplatform.common.exception.BadRequestException;
import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.exam.dto.ExamCreateRequest;
import com.examplatform.exam.dto.ExamDto;
import com.examplatform.exam.entity.Exam;
import com.examplatform.exam.mapper.ExamMapper;
import com.examplatform.exam.repository.ExamRepository;
import com.examplatform.user.entity.Role;
import com.examplatform.user.entity.User;
import com.examplatform.user.repository.UserRepository;
import com.examplatform.school.entity.Module;
import com.examplatform.school.entity.StudentGroup;
import com.examplatform.school.repository.ModuleRepository;
import com.examplatform.school.repository.StudentGroupRepository;
import com.examplatform.exam.entity.ExamStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class ExamService {

    private final ExamRepository examRepository;
    private final UserRepository userRepository;
    private final ExamMapper examMapper;
    private final ModuleRepository moduleRepository;
    private final StudentGroupRepository studentGroupRepository;

    @Transactional
    public ExamDto createExam(ExamCreateRequest request, String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateExamDates(request.getAvailableFrom(), request.getAvailableUntil());

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        StudentGroup group = studentGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        Exam exam = Exam.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .availableFrom(request.getAvailableFrom())
                .availableUntil(request.getAvailableUntil())
                .maxAttempts(request.getMaxAttempts())
                .module(module)
                .studentGroup(group)
                .scheduledStartTime(request.getScheduledStartTime())
                .status(ExamStatus.DRAFT)
                .totalMarks(0) // Will increase when questions are added
                .published(false)
                .createdBy(teacher)
                .build();

        return examMapper.toDto(examRepository.save(exam));
    }

    @Transactional
    public ExamDto updateExam(Long id, ExamCreateRequest request, String email) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        validateOwnershipOrAdmin(exam, email);
        validateExamDates(request.getAvailableFrom(), request.getAvailableUntil());

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        StudentGroup group = studentGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setAvailableFrom(request.getAvailableFrom());
        exam.setAvailableUntil(request.getAvailableUntil());
        exam.setMaxAttempts(request.getMaxAttempts());
        exam.setModule(module);
        exam.setStudentGroup(group);
        exam.setScheduledStartTime(request.getScheduledStartTime());

        return examMapper.toDto(examRepository.save(exam));
    }

    @Transactional
    public void deleteExam(Long id, String email) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        validateOwnershipOrAdmin(exam, email);
        examRepository.delete(exam);
    }

    @Transactional
    public ExamDto publishExam(Long id, boolean publish, String email) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        validateOwnershipOrAdmin(exam, email);

        if (publish) {
            if (exam.getQuestions().isEmpty()) {
                throw new BadRequestException("Cannot publish an exam that has no questions");
            }
        }

        exam.setPublished(publish);
        return examMapper.toDto(examRepository.save(exam));
    }

    public Page<ExamDto> getTeacherExams(String teacherEmail, Pageable pageable) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return examRepository.findByCreatedById(teacher.getId(), pageable).map(examMapper::toDto);
    }

    public Page<ExamDto> getAllExams(Pageable pageable) {
        return examRepository.findAll(pageable).map(examMapper::toDto);
    }

    public Page<ExamDto> getAvailableExamsForStudent(String email, Pageable pageable) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (student.getStudentGroup() == null) {
            return Page.empty(pageable);
        }

        // Return exams that are published, assigned to the student's group, and not COMPLETED
        return examRepository.findActiveExamsByGroupId(student.getStudentGroup().getId(), pageable)
                .map(examMapper::toDto);
    }

    public ExamDto getExamById(Long id, String email) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Students can only access published exams
        if (user.getRole() == Role.ROLE_STUDENT && !exam.isPublished()) {
            throw new AccessDeniedException("You do not have permission to view this exam");
        }

        return examMapper.toDto(exam);
    }

    // Helpers

    private void validateExamDates(LocalDateTime from, LocalDateTime until) {
        if (from.isAfter(until)) {
            throw new BadRequestException("Available from date must be before available until date");
        }
    }

    private void validateOwnershipOrAdmin(Exam exam, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ROLE_ADMIN && !exam.getCreatedBy().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not have permission to modify this exam");
        }
    }

    @Transactional
    public void fixExamDates() {
        Exam exam = examRepository.findById(4L).orElse(null);
        if (exam != null) {
            exam.setAvailableUntil(LocalDateTime.now().plusDays(10));
            examRepository.save(exam);
        }
    }
}
