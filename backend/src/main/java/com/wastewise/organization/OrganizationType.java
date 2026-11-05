package com.wastewise.organization;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum OrganizationType {
    RESTAURANT,
    HOTEL,
    HOSTEL,
    CATERER,
    BAKERY,
    NGO,
    COMMUNITY_KITCHEN,
    SHELTER,
    OTHER;

    @JsonCreator
    public static OrganizationType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return OTHER;
        }
        String clean = value.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        for (OrganizationType t : values()) {
            if (t.name().equalsIgnoreCase(clean)) {
                return t;
            }
        }
        return OTHER;
    }
}

