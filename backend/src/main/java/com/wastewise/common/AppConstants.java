package com.wastewise.common;

public final class AppConstants {
    private AppConstants() {}

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";

    // Estimated standard meal in kilograms (average 0.4 kg per meal) for food impact tracking
    public static final double KG_PER_ESTIMATED_MEAL = 0.40;
    // Estimated greenhouse gas emissions saved: approx 2.5 kg CO2e per kg of food rescued
    public static final double CO2_SAVED_PER_KG_FOOD = 2.50;
}

