package com.examplatform.school.controller;

import com.examplatform.common.dto.ApiResponse;
import com.examplatform.school.entity.ModuleAssignment;
import com.examplatform.school.repository.ModuleAssignmentRepository;
import com.examplatform.user.entity.User;
import com.examplatform.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@Tag(name = "Teacher Context", description = "Teacher specific endpoints")
@SuppressWarnings("null")
public class TeacherContextController {

    private final ModuleAssignmentRepository moduleAssignmentRepository;
    private final UserRepository userRepository;

    @GetMapping("/assignments")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get modules and groups assigned to the current teacher")
    public ApiResponse<Map<String, Object>> getTeacherAssignments(Principal principal) {
        User teacher = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        List<ModuleAssignment> assignments = moduleAssignmentRepository.findByTeacherId(teacher.getId());

        List<Map<String, Object>> modules = assignments.stream()
                .map(ModuleAssignment::getModule)
                .distinct()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("name", m.getName());
                    return map;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> groups = assignments.stream()
                .map(ModuleAssignment::getStudentGroup)
                .distinct()
                .map(g -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", g.getId());
                    map.put("name", g.getName());
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("modules", modules);
        response.put("groups", groups);

        return ApiResponse.success(response, "Teacher assignments retrieved");
    }
}
