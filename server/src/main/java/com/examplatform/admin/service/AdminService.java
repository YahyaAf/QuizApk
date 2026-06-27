package com.examplatform.admin.service;

import com.examplatform.audit.entity.AuditLog;
import com.examplatform.audit.service.AuditLogService;
import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.school.entity.Module;
import com.examplatform.school.entity.ModuleAssignment;
import com.examplatform.school.entity.StudentGroup;
import com.examplatform.school.repository.ModuleAssignmentRepository;
import com.examplatform.school.repository.ModuleRepository;
import com.examplatform.school.repository.StudentGroupRepository;
import com.examplatform.user.dto.CreateUserRequest;
import com.examplatform.user.entity.Role;
import com.examplatform.user.entity.User;
import com.examplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminService {

    private final UserRepository userRepository;
    private final StudentGroupRepository studentGroupRepository;
    private final ModuleRepository moduleRepository;
    private final ModuleAssignmentRepository moduleAssignmentRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @Transactional
    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        if (request.getRole() == Role.ROLE_STUDENT && request.getGroupId() != null) {
            StudentGroup group = studentGroupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
            user.setStudentGroup(group);
        }

        user = userRepository.save(user);

        auditLogService.logAction(getCurrentAdmin(), "CREATE_USER", "Created user " + user.getEmail(), null);

        return user;
    }

    @Transactional
    public User updateUser(Long id, com.examplatform.user.dto.UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() == Role.ROLE_STUDENT && request.getGroupId() != null) {
            StudentGroup group = studentGroupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
            user.setStudentGroup(group);
        } else {
            user.setStudentGroup(null);
        }

        user = userRepository.save(user);
        auditLogService.logAction(getCurrentAdmin(), "UPDATE_USER", "Updated user " + user.getEmail(), null);

        return user;
    }

    @Transactional
    public StudentGroup createGroup(String name, String description) {
        StudentGroup group = StudentGroup.builder()
                .name(name)
                .description(description)
                .build();
        group = studentGroupRepository.save(group);
        auditLogService.logAction(getCurrentAdmin(), "CREATE_GROUP", "Created group " + name, null);
        return group;
    }

    @Transactional(readOnly = true)
    public List<StudentGroup> getAllGroups() {
        return studentGroupRepository.findAll();
    }

    @Transactional
    public StudentGroup updateGroup(Long id, String name, String description) {
        StudentGroup group = studentGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        group.setName(name);
        group.setDescription(description);
        group = studentGroupRepository.save(group);
        auditLogService.logAction(getCurrentAdmin(), "UPDATE_GROUP", "Updated group " + name, null);
        return group;
    }

    @Transactional
    public void deleteGroup(Long id) {
        StudentGroup group = studentGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        studentGroupRepository.delete(group);
        auditLogService.logAction(getCurrentAdmin(), "DELETE_GROUP", "Deleted group " + group.getName(), null);
    }

    @Transactional
    public Module createModule(String name, String description) {
        Module module = Module.builder()
                .name(name)
                .description(description)
                .build();
        module = moduleRepository.save(module);
        auditLogService.logAction(getCurrentAdmin(), "CREATE_MODULE", "Created module " + name, null);
        return module;
    }

    @Transactional(readOnly = true)
    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    @Transactional
    public Module updateModule(Long id, String name, String description) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        module.setName(name);
        module.setDescription(description);
        module = moduleRepository.save(module);
        auditLogService.logAction(getCurrentAdmin(), "UPDATE_MODULE", "Updated module " + name, null);
        return module;
    }

    @Transactional
    public void deleteModule(Long id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        moduleRepository.delete(module);
        auditLogService.logAction(getCurrentAdmin(), "DELETE_MODULE", "Deleted module " + module.getName(), null);
    }

    @Transactional
    public ModuleAssignment createAssignment(Long teacherId, Long moduleId, Long groupId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        if (teacher.getRole() != Role.ROLE_TEACHER) {
            throw new IllegalArgumentException("User is not a teacher");
        }

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        StudentGroup group = studentGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        ModuleAssignment assignment = ModuleAssignment.builder()
                .teacher(teacher)
                .module(module)
                .studentGroup(group)
                .build();

        assignment = moduleAssignmentRepository.save(assignment);
        auditLogService.logAction(getCurrentAdmin(), "CREATE_ASSIGNMENT", "Assigned " + teacher.getEmail() + " to module " + module.getName(), null);
        return assignment;
    }

    @Transactional(readOnly = true)
    public List<ModuleAssignment> getAllAssignments() {
        return moduleAssignmentRepository.findAll();
    }

    @Transactional
    public ModuleAssignment updateAssignment(Long id, Long teacherId, Long moduleId, Long groupId) {
        ModuleAssignment assignment = moduleAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        if (teacher.getRole() != Role.ROLE_TEACHER) {
            throw new IllegalArgumentException("User is not a teacher");
        }

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        StudentGroup group = studentGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        assignment.setTeacher(teacher);
        assignment.setModule(module);
        assignment.setStudentGroup(group);

        assignment = moduleAssignmentRepository.save(assignment);
        auditLogService.logAction(getCurrentAdmin(), "UPDATE_ASSIGNMENT", "Updated assignment for module " + module.getName(), null);
        return assignment;
    }

    @Transactional
    public void deleteAssignment(Long id) {
        ModuleAssignment assignment = moduleAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        moduleAssignmentRepository.delete(assignment);
        auditLogService.logAction(getCurrentAdmin(), "DELETE_ASSIGNMENT", "Deleted assignment " + id, null);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs() {
        return auditLogService.getAllLogs();
    }
}
