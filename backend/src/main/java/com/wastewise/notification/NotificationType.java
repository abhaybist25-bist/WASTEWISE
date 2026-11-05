package com.wastewise.notification;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum NotificationType {
    NEW_DONATION,
    CLAIM_RECEIVED,
    CLAIM_ACCEPTED,
    CLAIM_REJECTED,
    PICKUP_REMINDER,
    PICKUP_CONFIRMED,
    DELIVERY_CONFIRMED,
    DONATION_CANCELLED,
    LISTING_EXPIRING,
    VERIFICATION_UPDATE,
    SYSTEM_ALERT;

    @JsonCreator
    public static NotificationType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return SYSTEM_ALERT;
        }
        String clean = value.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        for (NotificationType n : values()) {
            if (n.name().equalsIgnoreCase(clean)) {
                return n;
            }
        }
        return SYSTEM_ALERT;
    }
}

