package com.wastewise.history;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "donationHistory")
public class DonationHistory {

    @Id
    private String id;

    @Indexed
    private String donationId;

    private String claimId;

    private String action; // CREATED, UPDATED, CLAIMED, PICKED_UP, DELIVERED, CANCELLED, EXPIRED, FLAGGED

    private String actorId;
    private String actorName;
    private String actorRole;

    private String previousStatus;
    private String newStatus;

    @Indexed
    private Instant timestamp = Instant.now();

    private String notes;

    public DonationHistory() {}

    public DonationHistory(String donationId, String claimId, String action, String actorId,
                           String actorName, String actorRole, String previousStatus,
                           String newStatus, String notes) {
        this.donationId = donationId;
        this.claimId = claimId;
        this.action = action;
        this.actorId = actorId;
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.notes = notes;
        this.timestamp = Instant.now();
    }

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

    public String getClaimId() {
        return claimId;
    }

    public void setClaimId(String claimId) {
        this.claimId = claimId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public String getActorRole() {
        return actorRole;
    }

    public void setActorRole(String actorRole) {
        this.actorRole = actorRole;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

