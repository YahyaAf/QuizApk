package com.examplatform.auth.service;

import com.examplatform.auth.dto.*;
import com.examplatform.common.exception.BadRequestException;
import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.config.JwtService;
import com.examplatform.user.entity.Role;
import com.examplatform.user.entity.User;
import com.examplatform.user.mapper.UserMapper;
import com.examplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // In-memory token store for simulated password resets
    private final Map<String, String> resetTokenMap = new ConcurrentHashMap<>();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Limit registration to STUDENT and TEACHER. ADMIN is created via seeds or database.
        if (request.getRole() == Role.ROLE_ADMIN) {
            throw new BadRequestException("Self-registration as Administrator is not allowed");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .blocked(false)
                .build();

        User savedUser = userRepository.save(user);
        
        String accessToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        // Send welcome email asynchronously
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFirstName(), savedUser.getRole().name());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDto(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.isBlocked()) {
            throw new BadRequestException("Your account is blocked. Please contact the administrator.");
        }

        // Authenticate in Spring context
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDto(user))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail == null) {
            throw new BadRequestException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new BadRequestException("Expired or invalid refresh token");
        }

        String accessToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDto(user))
                .build();
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + request.getEmail()));

        String token = UUID.randomUUID().toString();
        resetTokenMap.put(token, user.getEmail());

        // Send real password reset email (falls back to log if mail not configured)
        emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getFirstName(),
                token
        );
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = resetTokenMap.get(request.getToken());
        if (email == null) {
            throw new BadRequestException("Invalid or expired password reset token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetTokenMap.remove(request.getToken());
        log.info("Password successfully reset for user: {}", email);
    }
}
