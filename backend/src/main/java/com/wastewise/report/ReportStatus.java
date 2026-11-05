package com.wastewise.report;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ReportStatus {
    PENDING,
    INVESTIGATING,
    RESOLVED,
    DISMISSED;

    @JsonCreator
    public static ReportStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PENDING;
        }
        String clean = value.trim().toUpperCase();
        for (ReportStatus s : values()) {
            if (s.name().equalsIgnoreCase(clean)) {
                return s;
            }
        }
        return PENDING;
    }
}

