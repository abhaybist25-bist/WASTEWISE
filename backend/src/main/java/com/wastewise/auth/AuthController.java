package com.wastewise.auth;

import com.wastewise.common.ApiResponse;
import com.wastewise.organization.Organization;
import com.wastewise.organization.OrganizationRepository;
import com.wastewise.security.UserPrincipal;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public AuthController(AuthService authService,
                          UserRepository userRepository,
                          OrganizationRepository organizationRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.registerUser(registerRequest);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.ok(ApiResponse.error("Not authenticated"));
        }

        User user = userRepository.findById(currentUser.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.error("User not found"));
        }

        String orgName = null;
        com.wastewise.organization.VerificationStatus vStatus = null;
        if (user.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(user.getOrganizationId()).orElse(null);
            if (org != null) {
                orgName = org.getName();
                vStatus = org.getVerificationStatus();
            }
        }

        AuthResponse authResponse = new AuthResponse(
                null,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getOrganizationId(),
                orgName,
                vStatus
        );

        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved", authResponse));
    }
}
