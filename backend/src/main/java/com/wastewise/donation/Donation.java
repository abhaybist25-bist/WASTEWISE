package com.wastewise.donation;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "donations")
public class Donation {

    @Id
    private String id;

    @Indexed
    private String donorId;
    private String donorName;
    private String donorOrganizationName;
    private String donorPhone;

    private String foodName;
    private String description;

    @Indexed
    private FoodCategory category;

    private String imageUrl;

    private Double totalQuantity;
    private Double remainingQuantity;
    private String unit; // MEALS, KG, PACKETS, PIECES, LITRES

    private DietaryType dietaryType = DietaryType.VEGETARIAN;
    private Instant preparationTime;
    private Instant safeConsumptionDeadline;
    private StorageCondition storageCondition = StorageCondition.ROOM_TEMPERATURE;
    private List<String> allergens = new ArrayList<>();
    private String packagingDetails;

    private String pickupAddress;
    private String city;
    private String state;
    private String postalCode;
    private LocationCoordinates coordinates;

    private Instant pickupStartTime;

    @Indexed
    private Instant pickupDeadline;

    // Food Safety Declaration (FSSAI guidelines compliance)
    private boolean safetyDeclarationAccepted;
    private String safetyNotes;
    private String preparedUnderTemperature;

    @Indexed
    private DonationStatus status = DonationStatus.AVAILABLE;

    @Indexed
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Donation() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDonorId() {
        return donorId;
    }

    public void setDonorId(String donorId) {
        this.donorId = donorId;
    }

    public String getDonorName() {
        return donorName;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }

    public String getDonorOrganizationName() {
        return donorOrganizationName;
    }

    public void setDonorOrganizationName(String donorOrganizationName) {
        this.donorOrganizationName = donorOrganizationName;
    }

    public String getDonorPhone() {
        return donorPhone;
    }

    public void setDonorPhone(String donorPhone) {
        this.donorPhone = donorPhone;
    }

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

    public Double getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Double totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Double getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Double remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
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

    public LocationCoordinates getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(LocationCoordinates coordinates) {
        this.coordinates = coordinates;
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

    public DonationStatus getStatus() {
        return status;
    }

    public void setStatus(DonationStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

