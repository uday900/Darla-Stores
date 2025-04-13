package com.darla.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private Long id;

    @NotEmpty(message = "Name is mandatory")
    private String name;

    @NotEmpty(message = "Email is mandatory")
    @Email(message = "Invalid email format")
    private String email;

    // only for testing;
//    private String password;
//    @NotBlank(message = "Role is mandatory")
    private String role;

//    @NotBlank(message = "City is mandatory")
    private String city;

//    @NotBlank(message = "State is mandatory")
    private String state;

//    @NotBlank(message = "Country is mandatory")
    private String country;

//    @NotBlank(message = "District is mandatory")
    private String district;

//    @NotBlank(message = "Street is mandatory")
    private String street;
    
    private String zipCode;

    @NotEmpty(message = "Phone number is mandatory")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    private LocalDateTime createdAt;
}
