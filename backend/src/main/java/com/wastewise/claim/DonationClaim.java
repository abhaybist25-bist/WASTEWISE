package com.wastewise.claim;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "donationClaims")
public class DonationClaim {

    @Id
    private String id;

    @Indexed
    private String donationId;
    private String foodName;
    private String donorId;
    private String donorName;
    private String donorOrganizationName;

    @Indexed
    private String recipientId;
    private String recipientName;
    private String recipientOrganizationId;
    private String recipientOrganizationName;
    private String recipientPhone;

    private Double requestedQuantity;
    private Double acceptedQuantity;
    private String unit;

    @Indexed
    private ClaimStatus status = ClaimStatus.PENDING;

    private String notes;
    private String pickupAddress;
    private Instant estimatedPickupTime;

    private String volunteerId;
    private String volunteerName;

    private Instant pickupConfirmedAt;
    private String pickupConfirmedBy;

    private Instant deliveredAt;
    private String deliveredConfirmedBy;
    private String deliveryNotes;

    @Indexed
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public DonationClaim() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDonationId() {
        return donationId;
    }

    public void setDonationId(String donationId) {
        this.donationId = donationId;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
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

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getRecipientOrganizationId() {
        return recipientOrganizationId;
    }

    public void setRecipientOrganizationId(String recipientOrganizationId) {
        this.recipientOrganizationId = recipientOrganizationId;
    }

    public String getRecipientOrganizationName() {
        return recipientOrganizationName;
    }

    public void setRecipientOrganizationName(String recipientOrganizationName) {
        this.recipientOrganizationName = recipientOrganizationName;
    }

    public String getRecipientPhone() {
        return recipientPhone;
    }

    public void setRecipientPhone(String recipientPhone) {
        this.recipientPhone = recipientPhone;
    }

    public Double getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Double requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public Double getAcceptedQuantity() {
        return acceptedQuantity;
    }

    public void setAcceptedQuantity(Double acceptedQuantity) {
        this.acceptedQuantity = acceptedQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public Instant getEstimatedPickupTime() {
        return estimatedPickupTime;
    }

    public void setEstimatedPickupTime(Instant estimatedPickupTime) {
        this.estimatedPickupTime = estimatedPickupTime;
    }

    public String getVolunteerId() {
        return volunteerId;
    }

    public void setVolunteerId(String volunteerId) {
        this.volunteerId = volunteerId;
    }

    public String getVolunteerName() {
        return volunteerName;
    }

    public void setVolunteerName(String volunteerName) {
        this.volunteerName = volunteerName;
    }

    public Instant getPickupConfirmedAt() {
        return pickupConfirmedAt;
    }

    public void setPickupConfirmedAt(Instant pickupConfirmedAt) {
        this.pickupConfirmedAt = pickupConfirmedAt;
    }

    public String getPickupConfirmedBy() {
        return pickupConfirmedBy;
    }

    public void setPickupConfirmedBy(String pickupConfirmedBy) {
        this.pickupConfirmedBy = pickupConfirmedBy;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Instant deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getDeliveredConfirmedBy() {
        return deliveredConfirmedBy;
    }

    public void setDeliveredConfirmedBy(String deliveredConfirmedBy) {
        this.deliveredConfirmedBy = deliveredConfirmedBy;
    }

    public String getDeliveryNotes() {
        return deliveryNotes;
    }

    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
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

