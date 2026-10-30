package com.wastewise.analytics;

import java.util.Map;

public class DonorAnalyticsDto {

    private long totalDonations;
    private long activeDonations;
    private long completedDonations;
    private long pendingClaims;
    private long cancelledDonations;
    private long expiredDonations;
    private double estimatedMealsRescued;
    private double estimatedCo2SavedKg;

    private Map<String, Double> quantityByUnit;
    private Map<String, Long> donationsByCategory;
    private Map<String, Long> donationsByMonth;

    public DonorAnalyticsDto() {}

    public long getTotalDonations() {
        return totalDonations;
    }

    public void setTotalDonations(long totalDonations) {
        this.totalDonations = totalDonations;
    }

    public long getActiveDonations() {
        return activeDonations;
    }

    public void setActiveDonations(long activeDonations) {
        this.activeDonations = activeDonations;
    }

    public long getCompletedDonations() {
        return completedDonations;
    }

    public void setCompletedDonations(long completedDonations) {
        this.completedDonations = completedDonations;
    }

    public long getPendingClaims() {
        return pendingClaims;
    }

    public void setPendingClaims(long pendingClaims) {
        this.pendingClaims = pendingClaims;
    }

    public long getCancelledDonations() {
        return cancelledDonations;
    }

    public void setCancelledDonations(long cancelledDonations) {
        this.cancelledDonations = cancelledDonations;
    }

    public long getExpiredDonations() {
        return expiredDonations;
    }

    public void setExpiredDonations(long expiredDonations) {
        this.expiredDonations = expiredDonations;
    }

    public double getEstimatedMealsRescued() {
        return estimatedMealsRescued;
    }

    public void setEstimatedMealsRescued(double estimatedMealsRescued) {
        this.estimatedMealsRescued = estimatedMealsRescued;
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

    public Map<String, Long> getDonationsByCategory() {
        return donationsByCategory;
    }

    public void setDonationsByCategory(Map<String, Long> donationsByCategory) {
        this.donationsByCategory = donationsByCategory;
    }

    public Map<String, Long> getDonationsByMonth() {
        return donationsByMonth;
    }

    public void setDonationsByMonth(Map<String, Long> donationsByMonth) {
        this.donationsByMonth = donationsByMonth;
    }
}

