package com.wastewise.claim;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ClaimStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    PICKUP_CONFIRMED,
    DELIVERED,
    CANCELLED;

    @JsonCreator
    public static ClaimStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String clean = value.trim().toUpperCase();
        if ("APPROVED".equals(clean)) {
            return ACCEPTED;
        }
        if ("PICKED_UP".equals(clean)) {
            return PICKUP_CONFIRMED;
        }
        if ("CANCELED".equals(clean)) {
            return CANCELLED;
        }
        for (ClaimStatus s : values()) {
            if (s.name().equalsIgnoreCase(clean)) {
                return s;
            }
        }
        return null;
    }
}

