package com.darla.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterDto {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 16, message = "Password must be between 8 and 16 characters")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,16}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@#$%^&+=)"
    )
    private String password;

//    @NotBlank(message = "City is required")
    private String city;

//    @NotBlank(message = "State is required")
    private String state;

//    @NotBlank(message = "Country is required")
    private String country;

//    @NotBlank(message = "District is required")
    private String district;

//    @NotBlank(message = "Street is required")
    private String street;
    
    //    @NotBlank(message = "Zip code is required")
    @NotBlank(message = "Zip code is required")
    @Pattern(regexp = "^\\d{5}$", message = "Zip code must be 5 digits")
    private String zipCode;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;
}
