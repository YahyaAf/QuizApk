package com.examplatform.user.mapper;

import com.examplatform.user.dto.UserDto;
import com.examplatform.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .blocked(user.isBlocked())
                .createdAt(user.getCreatedAt())
                .badges(user.getBadges() == null ? Collections.emptySet() :
                        user.getBadges().stream()
                                .map(badge -> com.examplatform.user.dto.BadgeDto.builder()
                                        .id(badge.getId())
                                        .name(badge.getName())
                                        .description(badge.getDescription())
                                        .build())
                                .collect(Collectors.toSet()))
                .build();
    }
}
