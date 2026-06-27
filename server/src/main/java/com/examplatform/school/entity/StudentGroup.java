package com.examplatform.school.entity;

import com.examplatform.common.entity.BaseEntity;
import com.examplatform.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "student_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"students", "hibernateLazyInitializer", "handler"})
public class StudentGroup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String description;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "studentGroup", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> students = new HashSet<>();
}
