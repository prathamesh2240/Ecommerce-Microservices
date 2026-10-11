package com.pratham.user_service.service.impl;

import com.pratham.user_service.dto.request.AddressCreateRequest;
import com.pratham.user_service.dto.request.AddressUpdateRequest;
import com.pratham.user_service.dto.response.AddressResponse;
import com.pratham.user_service.entity.Address;
import com.pratham.user_service.exception.ResourceNotFoundException;
import com.pratham.user_service.repository.AddressRepository;
import com.pratham.user_service.service.AddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;

    @Override
    public List<AddressResponse> getAddressesByUserId(Long userId) {
        log.info("Fetching all addresses for user ID: {}", userId);
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AddressResponse getAddressByIdAndUserId(Long userId, Long addressId) {
        log.info("Fetching address ID: {} for user ID: {}", addressId, userId);
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> {
                    log.warn("Address fetch failed. Address ID: {} not found for user ID: {}", addressId, userId);
                    return new ResourceNotFoundException("Address not found with ID: " + addressId);
                });
        return mapToAddressResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse createAddress(Long userId, AddressCreateRequest request) {
        log.info("Creating new address for user ID: {}", userId);

        long addressCount = addressRepository.countByUserId(userId);

        // If this is the user's first address, or if they explicitly marked it as default
        boolean shouldBeDefault = addressCount == 0 || Boolean.TRUE.equals(request.getIsDefault());

        if (shouldBeDefault && addressCount > 0) {
            log.info("Clearing existing default addresses for user ID: {}", userId);
            addressRepository.clearDefaultByUserId(userId);
        }

        Address address = Address.builder()
                .userId(userId)
                .addressType(request.getAddressType())
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .addressLine1(request.getAddressLine1().trim())
                .addressLine2(request.getAddressLine2() != null ? request.getAddressLine2().trim() : null)
                .landmark(request.getLandmark() != null ? request.getLandmark().trim() : null)
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .pincode(request.getPincode().trim())
                .isDefault(shouldBeDefault)
                .build();

        Address savedAddress = addressRepository.save(address);
        log.info("Address successfully created with ID: {} for user ID: {}", savedAddress.getId(), userId);

        return mapToAddressResponse(savedAddress);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressUpdateRequest request) {
        log.info("Updating address ID: {} for user ID: {}", addressId, userId);

        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> {
                    log.warn("Address update failed. Address ID: {} not found for user ID: {}", addressId, userId);
                    return new ResourceNotFoundException("Address not found with ID: " + addressId);
                });

        // If setting this address as default, reset other defaults
        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            log.info("Setting address ID: {} as default; clearing other defaults for user ID: {}", addressId, userId);
            addressRepository.clearDefaultByUserId(userId);
            address.setIsDefault(true);
        }

        address.setAddressType(request.getAddressType());
        address.setFullName(request.getFullName().trim());
        address.setPhoneNumber(request.getPhoneNumber().trim());
        address.setAddressLine1(request.getAddressLine1().trim());
        address.setAddressLine2(request.getAddressLine2() != null ? request.getAddressLine2().trim() : null);
        address.setLandmark(request.getLandmark() != null ? request.getLandmark().trim() : null);
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPincode(request.getPincode().trim());

        Address updatedAddress = addressRepository.save(address);
        log.info("Address successfully updated. ID: {}", updatedAddress.getId());

        return mapToAddressResponse(updatedAddress);
    }

    @Override
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        log.info("Deleting address ID: {} for user ID: {}", addressId, userId);

        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> {
                    log.warn("Address deletion failed. Address ID: {} not found for user ID: {}", addressId, userId);
                    return new ResourceNotFoundException("Address not found with ID: " + addressId);
                });

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);
        log.info("Address with ID: {} deleted for user ID: {}", addressId, userId);

        // If the deleted address was default, automatically promote the most recently created remaining address
        if (wasDefault) {
            addressRepository.findFirstByUserIdOrderByCreatedAtDesc(userId).ifPresent(nextDefault -> {
                nextDefault.setIsDefault(true);
                addressRepository.save(nextDefault);
                log.info("Promoted address ID: {} to default for user ID: {}", nextDefault.getId(), userId);
            });
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(Long userId, Long addressId) {
        log.info("Setting address ID: {} as default for user ID: {}", addressId, userId);

        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> {
                    log.warn("Set default failed. Address ID: {} not found for user ID: {}", addressId, userId);
                    return new ResourceNotFoundException("Address not found with ID: " + addressId);
                });

        addressRepository.clearDefaultByUserId(userId);
        address.setIsDefault(true);

        Address savedAddress = addressRepository.save(address);
        log.info("Address ID: {} is now default for user ID: {}", savedAddress.getId(), userId);

        return mapToAddressResponse(savedAddress);
    }

    private AddressResponse mapToAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .userId(address.getUserId())
                .addressType(address.getAddressType())
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .landmark(address.getLandmark())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
