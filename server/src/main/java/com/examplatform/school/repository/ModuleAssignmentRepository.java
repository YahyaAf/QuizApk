package com.examplatform.school.repository;

import com.examplatform.school.entity.ModuleAssignment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleAssignmentRepository extends JpaRepository<ModuleAssignment, Long> {
    
    @EntityGraph(attributePaths = {"module", "studentGroup"})
    List<ModuleAssignment> findByTeacherId(Long teacherId);
    
    @EntityGraph(attributePaths = {"module", "studentGroup"})
    List<ModuleAssignment> findByStudentGroupId(Long studentGroupId);
}
