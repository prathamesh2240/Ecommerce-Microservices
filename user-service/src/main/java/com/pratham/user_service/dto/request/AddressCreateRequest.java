package com.pratham.user_service.dto.request;

import com.pratham.user_service.enums.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressCreateRequest {

    @NotNull(message = "Address type is required")
    private AddressType addressType;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+91)?[6-9]\\d{9}$",
            message = "Invalid mobile number. Please enter a valid 10-digit Indian mobile number."
    )
    private String phoneNumber;

    @NotBlank(message = "Address line 1 is required")
    @Size(min = 3, max = 255, message = "Address line 1 must be between 3 and 255 characters")
    private String addressLine1;

    @Size(max = 255, message = "Address line 2 must be up to 255 characters")
    private String addressLine2;

    @Size(max = 150, message = "Landmark must be up to 150 characters")
    private String landmark;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 100, message = "State must be between 2 and 100 characters")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(
            regexp = "^[1-9][0-9]{5}$",
            message = "Invalid pincode. Please enter a valid 6-digit Indian PIN code."
    )
    private String pincode;

    @Builder.Default
    private Boolean isDefault = false;
}
