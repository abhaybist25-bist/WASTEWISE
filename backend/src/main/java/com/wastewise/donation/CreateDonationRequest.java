package com.wastewise.donation;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.Instant;
import java.util.List;

public class CreateDonationRequest {

    @NotBlank(message = "Food name is required")
    private String foodName;

    @NotBlank(message = "Food description is required")
    private String description;

    @NotNull(message = "Food category is required")
    private FoodCategory category;

    private String imageUrl;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Double quantity;

    @NotBlank(message = "Unit of measurement is required (e.g., MEALS, KG, PACKETS)")
    private String unit;

    private DietaryType dietaryType = DietaryType.VEGETARIAN;

    private Instant preparationTime;

    @Future(message = "Safe consumption deadline must be in the future")
    private Instant safeConsumptionDeadline;

    @NotNull(message = "Storage condition is required")
    private StorageCondition storageCondition;

    private List<String> allergens;

    private String packagingDetails;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    private String city;
    private String state;
    private String postalCode;

    private Double latitude;
    private Double longitude;

    private Instant pickupStartTime;

    @NotNull(message = "Pickup deadline is required")
    @Future(message = "Pickup deadline must be in the future")
    private Instant pickupDeadline;

    @AssertTrue(message = "You must agree to the FSSAI food-safety declaration certifying that food has been prepared and stored hygienically")
    private boolean safetyDeclarationAccepted;

    private String safetyNotes;
    private String preparedUnderTemperature;

    public CreateDonationRequest() {}

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

    public Instant getPreparationTime() {
        return preparationTime;
    }

    public void setPreparationTime(Instant preparationTime) {
        this.preparationTime = preparationTime;
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

    public boolean isSafetyDeclarationAccepted() {
        return safetyDeclarationAccepted;
    }

    public void setSafetyDeclarationAccepted(boolean safetyDeclarationAccepted) {
        this.safetyDeclarationAccepted = safetyDeclarationAccepted;
    }

    public String getSafetyNotes() {
        return safetyNotes;
    }

    public void setSafetyNotes(String safetyNotes) {
        this.safetyNotes = safetyNotes;
    }

    public String getPreparedUnderTemperature() {
        return preparedUnderTemperature;
    }

    public void setPreparedUnderTemperature(String preparedUnderTemperature) {
        this.preparedUnderTemperature = preparedUnderTemperature;
    }
}

