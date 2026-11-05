package com.wastewise.donation;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DonationStatus {
    AVAILABLE,
    PARTIALLY_CLAIMED,
    FULLY_CLAIMED,
    PICKUP_IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    EXPIRED,
    FLAGGED;

    @JsonCreator
    public static DonationStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return AVAILABLE;
        }
        String clean = value.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        if ("CLAIMED".equals(clean)) {
            return FULLY_CLAIMED;
        }
        if ("CANCELED".equals(clean)) {
            return CANCELLED;
        }
        for (DonationStatus s : values()) {
            if (s.name().equalsIgnoreCase(clean)) {
                return s;
            }
        }
        return AVAILABLE;
    }
}

