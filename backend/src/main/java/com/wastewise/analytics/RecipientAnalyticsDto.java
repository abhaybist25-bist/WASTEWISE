package com.wastewise.analytics;

import java.util.Map;

public class RecipientAnalyticsDto {

    private long totalClaims;
    private long completedPickups;
    private long pendingClaims;
    private double estimatedMealsReceived;
    private double estimatedCo2SavedKg;

    private Map<String, Double> quantityByUnit;
    private Map<String, Long> claimsByStatus;

    public RecipientAnalyticsDto() {}

    public long getTotalClaims() {
        return totalClaims;
    }

    public void setTotalClaims(long totalClaims) {
        this.totalClaims = totalClaims;
    }

    public long getCompletedPickups() {
        return completedPickups;
    }

    public void setCompletedPickups(long completedPickups) {
        this.completedPickups = completedPickups;
    }

    public long getPendingClaims() {
        return pendingClaims;
    }

    public void setPendingClaims(long pendingClaims) {
        this.pendingClaims = pendingClaims;
    }

    public double getEstimatedMealsReceived() {
        return estimatedMealsReceived;
    }

    public void setEstimatedMealsReceived(double estimatedMealsReceived) {
        this.estimatedMealsReceived = estimatedMealsReceived;
    }

    public double getEstimatedCo2SavedKg() {
        return estimatedCo2SavedKg;
    }

    public void setEstimatedCo2SavedKg(double estimatedCo2SavedKg) {
        this.estimatedCo2SavedKg = estimatedCo2SavedKg;
    }

    public Map<String, Double> getQuantityByUnit() {
        return quantityByUnit;
    }

    public void setQuantityByUnit(Map<String, Double> quantityByUnit) {
        this.quantityByUnit = quantityByUnit;
    }

    public Map<String, Long> getClaimsByStatus() {
        return claimsByStatus;
    }

    public void setClaimsByStatus(Map<String, Long> claimsByStatus) {
        this.claimsByStatus = claimsByStatus;
    }
}

