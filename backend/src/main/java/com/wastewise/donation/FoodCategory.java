package com.wastewise.donation;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum FoodCategory {
    COOKED_MEALS,
    BAKERY_PRODUCTS,
    FRUITS,
    VEGETABLES,
    PACKAGED_FOOD,
    DAIRY_PRODUCTS,
    OTHER;

    @JsonCreator
    public static FoodCategory fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return OTHER;
        }
        String clean = value.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        if ("BAKERY".equals(clean)) {
            return BAKERY_PRODUCTS;
        }
        if ("DAIRY".equals(clean)) {
            return DAIRY_PRODUCTS;
        }
        for (FoodCategory c : values()) {
            if (c.name().equalsIgnoreCase(clean)) {
                return c;
            }
        }
        return OTHER;
    }
}

