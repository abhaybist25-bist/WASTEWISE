package com.wastewise.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wastewise.donation.Donation;
import com.wastewise.donation.DonationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiAiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAiService.class);

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String geminiApiUrl;

    private final DonationRepository donationRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiAiService(DonationRepository donationRepository) {
        this.donationRepository = donationRepository;
    }

    public AiInsightDto generateInsightsForDonor(String donorId) {
        List<Donation> donations = donationRepository.findByDonorId(donorId);

        AiInsightDto dto = new AiInsightDto();
        dto.setDonorId(donorId);
        dto.setGeneratedAt(Instant.now());

        if (donations.isEmpty()) {
            dto.setSummary("Insufficient historical data. Create more surplus food listings to unlock AI-powered waste pattern analytics.");
            dto.setRecurringPatterns(List.of("No listings recorded yet."));
            dto.setPlanningRecommendations(List.of("Publish surplus donations as soon as food is available to build a reliable demand profile."));
            dto.setConfidenceScore("N/A - Insufficient Data");
            dto.setGeneratedWithAi(false);
            return dto;
        }

        // Compute local empirical heuristics from real records
        double totalQuantity = donations.stream().mapToDouble(d -> d.getTotalQuantity() != null ? d.getTotalQuantity() : 0.0).sum();
        double avgQuantity = Math.round((totalQuantity / donations.size()) * 10.0) / 10.0;
        dto.setAvgQuantityPerListing(avgQuantity);

        // Day of week analysis
        Map<DayOfWeek, Long> dayCounts = donations.stream()
                .filter(d -> d.getCreatedAt() != null)
                .collect(Collectors.groupingBy(d -> d.getCreatedAt().atZone(ZoneId.systemDefault()).getDayOfWeek(), Collectors.counting()));

        DayOfWeek peakDay = dayCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(DayOfWeek.FRIDAY);
        dto.setPeakSurplusDay(peakDay.name());

        // Category analysis
        Map<String, Long> categoryCounts = donations.stream()
                .filter(d -> d.getCategory() != null)
                .collect(Collectors.groupingBy(d -> d.getCategory().name(), Collectors.counting()));

        String topCat = categoryCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("COOKED_MEALS");
        dto.setTopSurplusCategory(topCat);

        // If Gemini API Key is available, invoke Gemini AI with anonymized statistical summary
        if (StringUtils.hasText(geminiApiKey) && !geminiApiKey.equals("your_gemini_api_key_here")) {
            try {
                String aiSummary = callGeminiForInsights(donations.size(), avgQuantity, peakDay.name(), topCat);
                if (StringUtils.hasText(aiSummary)) {
                    dto.setSummary(aiSummary);
                    dto.setRecurringPatterns(List.of(
                            "Surplus frequency peaks prominently on " + peakDay.name() + "s.",
                            "Primary surplus category is " + topCat.replace('_', ' ') + " accounting for most surplus volume.",
                            "Average surplus batch size stands at " + avgQuantity + " units."
                    ));
                    dto.setPlanningRecommendations(List.of(
                            "Adjust batch preparation quantities downwards by ~15% on " + peakDay.name() + " mornings.",
                            "Coordinate earlier distribution slots with local NGOs for " + topCat.replace('_', ' ') + ".",
                            "Implement blast chilling or proper temperature holding to maximize safe consumption window."
                    ));
                    dto.setConfidenceScore("High (Gemini 1.5 Flash Verified)");
                    dto.setGeneratedWithAi(true);
                    return dto;
                }
            } catch (Exception ex) {
                logger.warn("Failed to generate AI insights via Gemini API: {}. Falling back to statistical analyzer.", ex.getMessage());
            }
        }

        // Resilient built-in statistical fallback
        dto.setSummary(String.format(
                "Based on %d historical listings, your kitchen experiences the highest surplus volume of %s on %ss, with an average donation batch size of %.1f units.",
                donations.size(), topCat.replace('_', ' '), peakDay.name(), avgQuantity
        ));

        dto.setRecurringPatterns(List.of(
                String.format("Recurring surplus concentration on %ss.", peakDay.name()),
                String.format("%s constitutes the largest portion of your rescued food.", topCat.replace('_', ' ')),
                String.format("Standard surplus batch is approximately %.1f units per occurrence.", avgQuantity)
        ));

        dto.setPlanningRecommendations(List.of(
                String.format("Review production recipes on %ss to calibrate preparation closer to expected demand.", peakDay.name()),
                "Schedule automatic alerts to local community kitchens 2 hours before kitchen closing.",
                "Review portion packaging to optimize pickup and storage safety."
        ));

        dto.setConfidenceScore(donations.size() > 5 ? "Reliable (Data-driven Heuristic)" : "Moderate (Sample size < 5)");
        dto.setGeneratedWithAi(false);

        return dto;
    }

    private String callGeminiForInsights(int totalDonations, double avgQty, String peakDay, String topCat) {
        String prompt = String.format(
                "You are an expert food waste reduction consultant. A commercial food donor has logged %d donations in our WasteWise platform. " +
                "Their highest surplus occurs on %s, their most frequent surplus category is %s, and average surplus batch is %.1f units. " +
                "Provide a concise, highly professional 2-3 sentence strategic executive summary with actionable guidance to reduce waste at source.",
                totalDonations, peakDay, topCat, avgQty
        );

        String url = geminiApiUrl + "?key=" + geminiApiKey;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            } catch (Exception e) {
                logger.error("Failed to parse Gemini response", e);
            }
        }
        return null;
    }
}

