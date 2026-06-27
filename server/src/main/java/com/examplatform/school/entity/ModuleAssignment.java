package com.examplatform.school.entity;

import com.examplatform.common.entity.BaseEntity;
import com.examplatform.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "module_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"teacher_id", "module_id", "group_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleAssignment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudentGroup studentGroup;
}
