package com.pratham.user_service.service.impl;

import com.pratham.user_service.dto.request.UserCreateRequest;
import com.pratham.user_service.dto.request.UserUpdateRequest;
import com.pratham.user_service.dto.response.UserResponse;
import com.pratham.user_service.entity.User;
import com.pratham.user_service.enums.Role;
import com.pratham.user_service.enums.Status;
import com.pratham.user_service.exception.DuplicateResourceException;
import com.pratham.user_service.exception.ResourceNotFoundException;
import com.pratham.user_service.repository.UserRepository;
import com.pratham.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        log.info("Attempting to create user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed. Email: {} is already registered", request.getEmail());
            throw new DuplicateResourceException("Email is already registered");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(encodedPassword)
                .phoneNumber(request.getPhoneNumber())
                .role(Role.ROLE_USER)
                .status(Status.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User successfully created with ID: {}", savedUser.getId());

        return mapToUserResponse(savedUser);
    }

    @Override
    public UserResponse getUserById(Long id) {
        log.info("Fetching user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User fetch failed. User ID: {} not found", id);
                    return new ResourceNotFoundException("User not found with ID: " + id);
                });
        return mapToUserResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        log.info("Fetching all registered users");
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        log.info("Attempting to update user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User update failed. User ID: {} not found", id);
                    return new ResourceNotFoundException("User not found with ID: " + id);
                });

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        User updatedUser = userRepository.save(user);
        log.info("User successfully updated. ID: {}", updatedUser.getId());

        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        log.info("Attempting to delete user with ID: {}", id);

        if (!userRepository.existsById(id)) {
            log.warn("User deletion failed. User ID: {} does not exist", id);
            throw new ResourceNotFoundException("User not found with ID: " + id);
        }

        userRepository.deleteById(id);
        log.info("User with ID: {} successfully deleted", id);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
