package com.pratham.user_service.service;

import com.pratham.user_service.dto.request.AddressCreateRequest;
import com.pratham.user_service.dto.request.AddressUpdateRequest;
import com.pratham.user_service.dto.response.AddressResponse;

import java.util.List;

public interface AddressService {

    List<AddressResponse> getAddressesByUserId(Long userId);

    AddressResponse getAddressByIdAndUserId(Long userId, Long addressId);

    AddressResponse createAddress(Long userId, AddressCreateRequest request);

    AddressResponse updateAddress(Long userId, Long addressId, AddressUpdateRequest request);

    void deleteAddress(Long userId, Long addressId);

    AddressResponse setDefaultAddress(Long userId, Long addressId);
}
