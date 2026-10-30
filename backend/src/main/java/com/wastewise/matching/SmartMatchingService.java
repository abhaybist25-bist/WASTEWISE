package com.wastewise.matching;

import com.wastewise.donation.Donation;
import com.wastewise.donation.DonationRepository;
import com.wastewise.donation.DonationService;
import com.wastewise.donation.DonationStatus;
import com.wastewise.organization.Organization;
import com.wastewise.organization.OrganizationRepository;
import com.wastewise.organization.VerificationStatus;
import com.wastewise.security.UserPrincipal;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SmartMatchingService {

    // Configurable weights as specified in prompt
    private static final double WEIGHT_GEOGRAPHY = 0.30;
    private static final double WEIGHT_QUANTITY = 0.25;
    private static final double WEIGHT_PICKUP_TIME = 0.25;
    private static final double WEIGHT_CATEGORY = 0.10;
    private static final double WEIGHT_AVAILABILITY = 0.10;

    private final DonationRepository donationRepository;
    private final DonationService donationService;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public SmartMatchingService(DonationRepository donationRepository,
                                DonationService donationService,
                                UserRepository userRepository,
                                OrganizationRepository organizationRepository) {
        this.donationRepository = donationRepository;
        this.donationService = donationService;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
    }

    public List<RecommendationDto> getRecommendationsForRecipient(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId()).orElse(null);
        if (user == null || user.getOrganizationId() == null) {
            return Collections.emptyList();
        }

        Organization org = organizationRepository.findById(user.getOrganizationId()).orElse(null);
        if (org == null) {
            return Collections.emptyList();
        }

        // Must reject ineligible matches: unverified organizations cannot be matched
        if (org.getVerificationStatus() != VerificationStatus.APPROVED) {
            return Collections.emptyList();
        }

        Instant now = Instant.now();
        List<DonationStatus> activeStatuses = Arrays.asList(DonationStatus.AVAILABLE, DonationStatus.PARTIALLY_CLAIMED);
        List<Donation> availableDonations = donationRepository.findAll().stream()
                .filter(d -> activeStatuses.contains(d.getStatus()))
                .filter(d -> d.getPickupDeadline() != null && d.getPickupDeadline().isAfter(now))
                .filter(d -> d.getRemainingQuantity() != null && d.getRemainingQuantity() > 0)
                .collect(Collectors.toList());

        List<RecommendationDto> recommendations = new ArrayList<>();

        double userLat = org.getLatitude() != null ? org.getLatitude() : 12.9716;
        double userLng = org.getLongitude() != null ? org.getLongitude() : 77.5946;
        int capacity = org.getDailyCapacity() != null ? org.getDailyCapacity() : 100;
        List<String> acceptedCategories = org.getAcceptedCategories() != null ? org.getAcceptedCategories() : Collections.emptyList();

        for (Donation donation : availableDonations) {
            double donLat = donation.getCoordinates() != null && donation.getCoordinates().getLatitude() != null ?
                    donation.getCoordinates().getLatitude() : 12.9716;
            double donLng = donation.getCoordinates() != null && donation.getCoordinates().getLongitude() != null ?
                    donation.getCoordinates().getLongitude() : 77.5946;

            double distanceKm = donationService.calculateDistanceKm(userLat, userLng, donLat, donLng);

            // Geographic suitability (30%): 0-5km -> 100, 5-15km -> 80, 15-30km -> 50, >30km -> 20
            double geoScore;
            if (distanceKm <= 5.0) geoScore = 100.0;
            else if (distanceKm <= 15.0) geoScore = 80.0;
            else if (distanceKm <= 30.0) geoScore = 50.0;
            else geoScore = Math.max(10.0, 100.0 - (distanceKm * 2));

            // Quantity compatibility (25%): how well remaining quantity fits daily capacity
            double qtyScore;
            double remQty = donation.getRemainingQuantity();
            if (remQty <= capacity) {
                qtyScore = 95.0;
            } else {
                qtyScore = Math.max(30.0, 100.0 - ((remQty - capacity) / capacity * 50.0));
            }

            // Pickup time compatibility (25%): urgency curve (adequate window to travel and pickup)
            long hoursLeft = Duration.between(now, donation.getPickupDeadline()).toHours();
            double timeScore;
            if (hoursLeft >= 2 && hoursLeft <= 12) {
                // Ideal sweet spot: urgent enough to prevent waste, enough time to collect
                timeScore = 95.0;
            } else if (hoursLeft > 12) {
                timeScore = 80.0;
            } else if (hoursLeft >= 1) {
                timeScore = 70.0; // very urgent
            } else {
                timeScore = 40.0; // critical
            }

            // Category compatibility (10%)
            double catScore = 70.0; // default baseline
            if (!acceptedCategories.isEmpty()) {
                if (acceptedCategories.contains(donation.getCategory().name())) {
                    catScore = 100.0;
                } else {
                    catScore = 40.0;
                }
            }

            // Availability/Operational factor (10%)
            double availScore = 90.0;

            // Compute composite match score
            double totalScore = (geoScore * WEIGHT_GEOGRAPHY) +
                    (qtyScore * WEIGHT_QUANTITY) +
                    (timeScore * WEIGHT_PICKUP_TIME) +
                    (catScore * WEIGHT_CATEGORY) +
                    (availScore * WEIGHT_AVAILABILITY);

            List<String> reasons = new ArrayList<>();
            if (distanceKm <= 10.0) {
                reasons.add(String.format("Nearby pickup location (approx %.1f km away)", distanceKm));
            }
            if (remQty <= capacity) {
                reasons.add(String.format("Suitable quantity (%.0f %s fits capacity)", remQty, donation.getUnit()));
            }
            if (catScore == 100.0) {
                reasons.add("Matches organization's preferred category: " + donation.getCategory().name().replace('_', ' '));
            }
            if (hoursLeft >= 2 && hoursLeft <= 8) {
                reasons.add(String.format("Optimal rescue window (~%d hours left before deadline)", hoursLeft));
            }

            if (reasons.isEmpty()) {
                reasons.add("Available for collection within service area");
            }

            RecommendationDto dto = new RecommendationDto();
            dto.setDonation(donation);
            dto.setDistanceKm(Math.round(distanceKm * 10.0) / 10.0);
            dto.setMatchScore(Math.round(totalScore * 10.0) / 10.0);
            dto.setMatchReasons(reasons);

            recommendations.add(dto);
        }

        // Sort descending by match score
        recommendations.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));

        return recommendations;
    }
}

