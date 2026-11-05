package com.wastewise.donation;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum StorageCondition {
    ROOM_TEMPERATURE,
    REFRIGERATED,
    FROZEN,
    HOT_HOLDING,
    COOL_DRY_PLACE;

    @JsonCreator
    public static StorageCondition fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ROOM_TEMPERATURE;
        }
        String clean = value.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        for (StorageCondition s : values()) {
            if (s.name().equalsIgnoreCase(clean)) {
                return s;
            }
        }
        return ROOM_TEMPERATURE;
    }
}

