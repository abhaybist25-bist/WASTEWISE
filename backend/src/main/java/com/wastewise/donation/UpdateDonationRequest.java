package com.wastewise.donation;

import java.time.Instant;
import java.util.List;

public class UpdateDonationRequest {
    private String foodName;
    private String description;
    private FoodCategory category;
    private String imageUrl;
    private Double quantity;
    private String unit;
    private DietaryType dietaryType;
    private Instant safeConsumptionDeadline;
    private StorageCondition storageCondition;
    private List<String> allergens;
    private String packagingDetails;
    private String pickupAddress;
    private String city;
    private String state;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private Instant pickupStartTime;
    private Instant pickupDeadline;

    public UpdateDonationRequest() {}

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public FoodCategory getCategory() {
        return category;
    }

    public void setCategory(FoodCategory category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public DietaryType getDietaryType() {
        return dietaryType;
    }

    public void setDietaryType(DietaryType dietaryType) {
        this.dietaryType = dietaryType;
    }

    public Instant getSafeConsumptionDeadline() {
        return safeConsumptionDeadline;
    }

    public void setSafeConsumptionDeadline(Instant safeConsumptionDeadline) {
        this.safeConsumptionDeadline = safeConsumptionDeadline;
    }

    public StorageCondition getStorageCondition() {
        return storageCondition;
    }

    public void setStorageCondition(StorageCondition storageCondition) {
        this.storageCondition = storageCondition;
    }

    public List<String> getAllergens() {
        return allergens;
    }

    public void setAllergens(List<String> allergens) {
        this.allergens = allergens;
    }

    public String getPackagingDetails() {
        return packagingDetails;
    }

    public void setPackagingDetails(String packagingDetails) {
        this.packagingDetails = packagingDetails;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Instant getPickupStartTime() {
        return pickupStartTime;
    }

    public void setPickupStartTime(Instant pickupStartTime) {
        this.pickupStartTime = pickupStartTime;
    }

    public Instant getPickupDeadline() {
        return pickupDeadline;
    }

    public void setPickupDeadline(Instant pickupDeadline) {
        this.pickupDeadline = pickupDeadline;
    }
}

