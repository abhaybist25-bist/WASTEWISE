package com.wastewise.ai;

import java.time.Instant;
import java.util.List;

public class AiInsightDto {

    private String donorId;
    private String summary;
    private List<String> recurringPatterns;
    private List<String> planningRecommendations;
    private String peakSurplusDay;
    private String topSurplusCategory;
    private double avgQuantityPerListing;
    private String confidenceScore;
    private boolean generatedWithAi;
    private Instant generatedAt;

    public AiInsightDto() {
        this.generatedAt = Instant.now();
    }

    public String getDonorId() {
        return donorId;
    }

    public void setDonorId(String donorId) {
        this.donorId = donorId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getRecurringPatterns() {
        return recurringPatterns;
    }

    public void setRecurringPatterns(List<String> recurringPatterns) {
        this.recurringPatterns = recurringPatterns;
    }

    public List<String> getPlanningRecommendations() {
        return planningRecommendations;
    }

    public void setPlanningRecommendations(List<String> planningRecommendations) {
        this.planningRecommendations = planningRecommendations;
    }

    public String getPeakSurplusDay() {
        return peakSurplusDay;
    }

    public void setPeakSurplusDay(String peakSurplusDay) {
        this.peakSurplusDay = peakSurplusDay;
    }

    public String getTopSurplusCategory() {
        return topSurplusCategory;
    }

    public void setTopSurplusCategory(String topSurplusCategory) {
        this.topSurplusCategory = topSurplusCategory;
    }

    public double getAvgQuantityPerListing() {
        return avgQuantityPerListing;
    }

    public void setAvgQuantityPerListing(double avgQuantityPerListing) {
        this.avgQuantityPerListing = avgQuantityPerListing;
    }

    public String getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(String confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public boolean isGeneratedWithAi() {
        return generatedWithAi;
    }

    public void setGeneratedWithAi(boolean generatedWithAi) {
        this.generatedWithAi = generatedWithAi;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }
}

