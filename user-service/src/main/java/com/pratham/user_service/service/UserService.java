package com.pratham.user_service.service;

import com.pratham.user_service.dto.request.UserCreateRequest;
import com.pratham.user_service.dto.request.UserUpdateRequest;
import com.pratham.user_service.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserCreateRequest request);
    UserResponse getUserById(Long id);
    List<UserResponse> getAllUsers();
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
}
