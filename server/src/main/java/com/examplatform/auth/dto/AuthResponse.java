package com.examplatform.auth.dto;

import com.examplatform.user.dto.UserDto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;
}
