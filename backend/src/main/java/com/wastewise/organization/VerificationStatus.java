package com.wastewise.organization;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum VerificationStatus {
    PENDING,
    APPROVED,
    REJECTED;

    @JsonCreator
    public static VerificationStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PENDING;
        }
        String clean = value.trim().toUpperCase();
        for (VerificationStatus v : values()) {
            if (v.name().equalsIgnoreCase(clean)) {
                return v;
            }
        }
        return PENDING;
    }
}

