package com.wastewise.organization;

import jakarta.validation.constraints.NotNull;

public class VerificationRequest {

    @NotNull(message = "Verification status is required")
    private VerificationStatus status;

    private String notes;

    public VerificationRequest() {}

    public VerificationRequest(VerificationStatus status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

