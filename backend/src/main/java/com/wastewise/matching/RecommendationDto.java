package com.wastewise.matching;

import com.wastewise.donation.Donation;

import java.util.List;

public class RecommendationDto {

    private Donation donation;
    private double matchScore; // 0 - 100%
    private double distanceKm;
    private List<String> matchReasons;

    public RecommendationDto() {}

    public RecommendationDto(Donation donation, double matchScore, double distanceKm, List<String> matchReasons) {
        this.donation = donation;
        this.matchScore = matchScore;
        this.distanceKm = distanceKm;
        this.matchReasons = matchReasons;
    }

    public Donation getDonation() {
        return donation;
    }

    public void setDonation(Donation donation) {
        this.donation = donation;
    }

    public double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(double matchScore) {
        this.matchScore = matchScore;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public List<String> getMatchReasons() {
        return matchReasons;
    }

    public void setMatchReasons(List<String> matchReasons) {
        this.matchReasons = matchReasons;
    }
}

