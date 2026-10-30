package com.wastewise.auth;

import com.wastewise.organization.VerificationStatus;
import com.wastewise.user.Role;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private String userId;
    private String name;
    private String email;
    private Role role;
    private String organizationId;
    private String organizationName;
    private VerificationStatus verificationStatus;

    public AuthResponse() {}

    public AuthResponse(String token, String userId, String name, String email, Role role,
                        String organizationId, String organizationName, VerificationStatus verificationStatus) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.verificationStatus = verificationStatus;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}

