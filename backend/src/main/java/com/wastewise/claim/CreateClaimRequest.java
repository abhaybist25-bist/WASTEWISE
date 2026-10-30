package com.wastewise.claim;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.Instant;

public class CreateClaimRequest {

    @NotNull(message = "Requested quantity is required")
    @Positive(message = "Requested quantity must be greater than zero")
    private Double requestedQuantity;

    private String notes;
    private Instant estimatedPickupTime;

    public CreateClaimRequest() {}

    public Double getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Double requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getEstimatedPickupTime() {
        return estimatedPickupTime;
    }

    public void setEstimatedPickupTime(Instant estimatedPickupTime) {
        this.estimatedPickupTime = estimatedPickupTime;
    }
}

