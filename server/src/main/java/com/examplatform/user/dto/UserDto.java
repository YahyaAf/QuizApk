package com.examplatform.user.dto;

import com.examplatform.user.entity.Role;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private boolean blocked;
    private LocalDateTime createdAt;
    private Set<BadgeDto> badges;
}
