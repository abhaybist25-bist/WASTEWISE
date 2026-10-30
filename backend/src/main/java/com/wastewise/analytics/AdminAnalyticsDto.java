package com.wastewise.analytics;

import java.util.Map;

public class AdminAnalyticsDto {

    private long totalUsers;
    private long totalDonors;
    private long totalRecipients;
    private long totalVolunteers;
    private long pendingOrganizations;
    private long approvedOrganizations;

    private long totalDonations;
    private long activeDonations;
    private long completedDonations;
    private double totalEstimatedMealsRescued;
    private double totalEstimatedCo2SavedKg;

    private Map<String, Double> totalQuantityByUnit;
    private Map<String, Long> donationsByCategory;
    private Map<String, Long> donationsByStatus;
    private Map<String, Long> userDistribution;

    public AdminAnalyticsDto() {}

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalDonors() {
        return totalDonors;
    }

    public void setTotalDonors(long totalDonors) {
        this.totalDonors = totalDonors;
    }

    public long getTotalRecipients() {
        return totalRecipients;
    }

    public void setTotalRecipients(long totalRecipients) {
        this.totalRecipients = totalRecipients;
    }

    public long getTotalVolunteers() {
        return totalVolunteers;
    }

    public void setTotalVolunteers(long totalVolunteers) {
        this.totalVolunteers = totalVolunteers;
    }

    public long getPendingOrganizations() {
        return pendingOrganizations;
    }

    public void setPendingOrganizations(long pendingOrganizations) {
        this.pendingOrganizations = pendingOrganizations;
    }

    public long getApprovedOrganizations() {
        return approvedOrganizations;
    }

    public void setApprovedOrganizations(long approvedOrganizations) {
        this.approvedOrganizations = approvedOrganizations;
    }

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

    public double getTotalEstimatedMealsRescued() {
        return totalEstimatedMealsRescued;
    }

    public void setTotalEstimatedMealsRescued(double totalEstimatedMealsRescued) {
        this.totalEstimatedMealsRescued = totalEstimatedMealsRescued;
    }

    public double getTotalEstimatedCo2SavedKg() {
        return totalEstimatedCo2SavedKg;
    }

    public void setTotalEstimatedCo2SavedKg(double totalEstimatedCo2SavedKg) {
        this.totalEstimatedCo2SavedKg = totalEstimatedCo2SavedKg;
    }

    public Map<String, Double> getTotalQuantityByUnit() {
        return totalQuantityByUnit;
    }

    public void setTotalQuantityByUnit(Map<String, Double> totalQuantityByUnit) {
        this.totalQuantityByUnit = totalQuantityByUnit;
    }

    public Map<String, Long> getDonationsByCategory() {
        return donationsByCategory;
    }

    public void setDonationsByCategory(Map<String, Long> donationsByCategory) {
        this.donationsByCategory = donationsByCategory;
    }

    public Map<String, Long> getDonationsByStatus() {
        return donationsByStatus;
    }

    public void setDonationsByStatus(Map<String, Long> donationsByStatus) {
        this.donationsByStatus = donationsByStatus;
    }

    public Map<String, Long> getUserDistribution() {
        return userDistribution;
    }

    public void setUserDistribution(Map<String, Long> userDistribution) {
        this.userDistribution = userDistribution;
    }
}

