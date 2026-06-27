package com.examplatform.school.repository;

import com.examplatform.school.entity.ModuleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleAssignmentRepository extends JpaRepository<ModuleAssignment, Long> {
    List<ModuleAssignment> findByTeacherId(Long teacherId);
    List<ModuleAssignment> findByStudentGroupId(Long studentGroupId);
}
