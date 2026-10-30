package com.wastewise.claim;

import jakarta.validation.constraints.NotNull;

public class UpdateClaimStatusRequest {

    @NotNull(message = "Claim status is required")
    private ClaimStatus status;

    private String notes;
    private Double acceptedQuantity;

    public UpdateClaimStatusRequest() {}

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

    public Double getAcceptedQuantity() {
        return acceptedQuantity;
    }

    public void setAcceptedQuantity(Double acceptedQuantity) {
        this.acceptedQuantity = acceptedQuantity;
    }
}

