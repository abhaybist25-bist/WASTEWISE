package com.wastewise.user;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    ROLE_DONOR,
    ROLE_RECIPIENT,
    ROLE_VOLUNTEER,
    ROLE_ADMIN;

    @JsonCreator
    public static Role fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String clean = value.trim().toUpperCase();
        if (!clean.startsWith("ROLE_")) {
            clean = "ROLE_" + clean;
        }
        for (Role r : values()) {
            if (r.name().equalsIgnoreCase(clean)) {
                return r;
            }
        }
        return null;
    }
}

