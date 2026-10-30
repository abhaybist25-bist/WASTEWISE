package com.wastewise.report;

import jakarta.validation.constraints.NotBlank;

public class CreateReportRequest {

    @NotBlank(message = "Donation ID is required")
    private String donationId;

    @NotBlank(message = "Reason is required (e.g. hygiene concern, expired food, misleading quantity)")
    private String reason;

    private String description;

    public CreateReportRequest() {}

    public String getDonationId() {
        return donationId;
    }

    public void setDonationId(String donationId) {
        this.donationId = donationId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

