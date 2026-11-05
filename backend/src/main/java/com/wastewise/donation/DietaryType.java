package com.wastewise.donation;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DietaryType {
    VEGETARIAN,
    NON_VEGETARIAN,
    VEGAN,
    HALAL,
    JAIN;

    @JsonCreator
    public static DietaryType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return VEGETARIAN;
        }
        String clean = value.trim().toUpperCase().replace("-", "_");
        if ("VEG".equals(clean)) {
            return VEGETARIAN;
        }
        if ("NON_VEG".equals(clean) || "NONVEG".equals(clean)) {
            return NON_VEGETARIAN;
        }
        for (DietaryType d : values()) {
            if (d.name().equalsIgnoreCase(clean)) {
                return d;
            }
        }
        return VEGETARIAN;
    }
}

