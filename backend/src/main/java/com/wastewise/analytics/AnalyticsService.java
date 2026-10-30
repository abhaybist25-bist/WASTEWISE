package com.wastewise.analytics;

import com.wastewise.claim.ClaimRepository;
import com.wastewise.claim.ClaimStatus;
import com.wastewise.claim.DonationClaim;
import com.wastewise.common.AppConstants;
import com.wastewise.donation.Donation;
import com.wastewise.donation.DonationRepository;
import com.wastewise.donation.DonationStatus;
import com.wastewise.organization.OrganizationRepository;
import com.wastewise.organization.VerificationStatus;
import com.wastewise.user.Role;
import com.wastewise.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final DonationRepository donationRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy").withZone(ZoneId.systemDefault());

    public AnalyticsService(DonationRepository donationRepository,
                            ClaimRepository claimRepository,
                            UserRepository userRepository,
                            OrganizationRepository organizationRepository) {
        this.donationRepository = donationRepository;
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
    }

    public DonorAnalyticsDto getDonorAnalytics(String donorId) {
        List<Donation> donations = donationRepository.findByDonorId(donorId);
        List<DonationClaim> claims = claimRepository.findByDonorId(donorId);

        DonorAnalyticsDto dto = new DonorAnalyticsDto();
        dto.setTotalDonations(donations.size());
        dto.setActiveDonations(donations.stream().filter(d -> d.getStatus() == DonationStatus.AVAILABLE || d.getStatus() == DonationStatus.PARTIALLY_CLAIMED).count());
        dto.setCompletedDonations(donations.stream().filter(d -> d.getStatus() == DonationStatus.COMPLETED).count());
        dto.setPendingClaims(claims.stream().filter(c -> c.getStatus() == ClaimStatus.PENDING).count());
        dto.setCancelledDonations(donations.stream().filter(d -> d.getStatus() == DonationStatus.CANCELLED).count());
        dto.setExpiredDonations(donations.stream().filter(d -> d.getStatus() == DonationStatus.EXPIRED).count());

        Map<String, Double> qtyMap = new HashMap<>();
        double estimatedMeals = 0.0;
        for (Donation d : donations) {
            String u = d.getUnit() != null ? d.getUnit() : "MEALS";
            double qty = d.getTotalQuantity() != null ? d.getTotalQuantity() : 0.0;
            qtyMap.put(u, qtyMap.getOrDefault(u, 0.0) + qty);

            // Calculate estimated meals
            if ("MEALS".equalsIgnoreCase(u) || "PACKETS".equalsIgnoreCase(u) || "PIECES".equalsIgnoreCase(u)) {
                estimatedMeals += qty;
            } else if ("KG".equalsIgnoreCase(u) || "LITRES".equalsIgnoreCase(u)) {
                estimatedMeals += (qty / AppConstants.KG_PER_ESTIMATED_MEAL);
            }
        }
        dto.setQuantityByUnit(qtyMap);
        dto.setEstimatedMealsRescued(Math.round(estimatedMeals));
        dto.setEstimatedCo2SavedKg(Math.round(estimatedMeals * AppConstants.KG_PER_ESTIMATED_MEAL * AppConstants.CO2_SAVED_PER_KG_FOOD * 10.0) / 10.0);

        Map<String, Long> catMap = donations.stream()
                .filter(d -> d.getCategory() != null)
                .collect(Collectors.groupingBy(d -> d.getCategory().name(), Collectors.counting()));
        dto.setDonationsByCategory(catMap);

        Map<String, Long> monthMap = donations.stream()
                .filter(d -> d.getCreatedAt() != null)
                .collect(Collectors.groupingBy(d -> MONTH_FORMATTER.format(d.getCreatedAt()), Collectors.counting()));
        dto.setDonationsByMonth(monthMap);

        return dto;
    }

    public RecipientAnalyticsDto getRecipientAnalytics(String recipientId) {
        List<DonationClaim> claims = claimRepository.findByRecipientId(recipientId);

        RecipientAnalyticsDto dto = new RecipientAnalyticsDto();
        dto.setTotalClaims(claims.size());
        dto.setCompletedPickups(claims.stream().filter(c -> c.getStatus() == ClaimStatus.DELIVERED).count());
        dto.setPendingClaims(claims.stream().filter(c -> c.getStatus() == ClaimStatus.PENDING).count());

        Map<String, Double> qtyMap = new HashMap<>();
        double estimatedMeals = 0.0;
        for (DonationClaim c : claims) {
            if (c.getStatus() == ClaimStatus.DELIVERED || c.getStatus() == ClaimStatus.PICKUP_CONFIRMED) {
                String u = c.getUnit() != null ? c.getUnit() : "MEALS";
                double qty = c.getAcceptedQuantity() != null ? c.getAcceptedQuantity() :
                        (c.getRequestedQuantity() != null ? c.getRequestedQuantity() : 0.0);
                qtyMap.put(u, qtyMap.getOrDefault(u, 0.0) + qty);

                if ("MEALS".equalsIgnoreCase(u) || "PACKETS".equalsIgnoreCase(u) || "PIECES".equalsIgnoreCase(u)) {
                    estimatedMeals += qty;
                } else if ("KG".equalsIgnoreCase(u) || "LITRES".equalsIgnoreCase(u)) {
                    estimatedMeals += (qty / AppConstants.KG_PER_ESTIMATED_MEAL);
                }
            }
        }
        dto.setQuantityByUnit(qtyMap);
        dto.setEstimatedMealsReceived(Math.round(estimatedMeals));
        dto.setEstimatedCo2SavedKg(Math.round(estimatedMeals * AppConstants.KG_PER_ESTIMATED_MEAL * AppConstants.CO2_SAVED_PER_KG_FOOD * 10.0) / 10.0);

        Map<String, Long> statusMap = claims.stream()
                .collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting()));
        dto.setClaimsByStatus(statusMap);

        return dto;
    }

    public AdminAnalyticsDto getAdminAnalytics() {
        AdminAnalyticsDto dto = new AdminAnalyticsDto();

        dto.setTotalUsers(userRepository.count());
        dto.setTotalDonors(userRepository.countByRole(Role.ROLE_DONOR));
        dto.setTotalRecipients(userRepository.countByRole(Role.ROLE_RECIPIENT));
        dto.setTotalVolunteers(userRepository.countByRole(Role.ROLE_VOLUNTEER));

        dto.setPendingOrganizations(organizationRepository.countByVerificationStatus(VerificationStatus.PENDING));
        dto.setApprovedOrganizations(organizationRepository.countByVerificationStatus(VerificationStatus.APPROVED));

        List<Donation> allDonations = donationRepository.findAll();
        dto.setTotalDonations(allDonations.size());
        dto.setActiveDonations(allDonations.stream().filter(d -> d.getStatus() == DonationStatus.AVAILABLE || d.getStatus() == DonationStatus.PARTIALLY_CLAIMED).count());
        dto.setCompletedDonations(allDonations.stream().filter(d -> d.getStatus() == DonationStatus.COMPLETED).count());

        Map<String, Double> qtyMap = new HashMap<>();
        double estimatedMeals = 0.0;
        for (Donation d : allDonations) {
            String u = d.getUnit() != null ? d.getUnit() : "MEALS";
            double qty = d.getTotalQuantity() != null ? d.getTotalQuantity() : 0.0;
            qtyMap.put(u, qtyMap.getOrDefault(u, 0.0) + qty);

            if ("MEALS".equalsIgnoreCase(u) || "PACKETS".equalsIgnoreCase(u) || "PIECES".equalsIgnoreCase(u)) {
                estimatedMeals += qty;
            } else if ("KG".equalsIgnoreCase(u) || "LITRES".equalsIgnoreCase(u)) {
                estimatedMeals += (qty / AppConstants.KG_PER_ESTIMATED_MEAL);
            }
        }
        dto.setTotalQuantityByUnit(qtyMap);
        dto.setTotalEstimatedMealsRescued(Math.round(estimatedMeals));
        dto.setTotalEstimatedCo2SavedKg(Math.round(estimatedMeals * AppConstants.KG_PER_ESTIMATED_MEAL * AppConstants.CO2_SAVED_PER_KG_FOOD * 10.0) / 10.0);

        Map<String, Long> catMap = allDonations.stream()
                .filter(d -> d.getCategory() != null)
                .collect(Collectors.groupingBy(d -> d.getCategory().name(), Collectors.counting()));
        dto.setDonationsByCategory(catMap);

        Map<String, Long> statusMap = allDonations.stream()
                .collect(Collectors.groupingBy(d -> d.getStatus().name(), Collectors.counting()));
        dto.setDonationsByStatus(statusMap);

        Map<String, Long> userDist = new HashMap<>();
        userDist.put("Donors", dto.getTotalDonors());
        userDist.put("Recipients", dto.getTotalRecipients());
        userDist.put("Volunteers", dto.getTotalVolunteers());
        dto.setUserDistribution(userDist);

        return dto;
    }

    public Map<String, Object> getPlatformSummary() {
        AdminAnalyticsDto admin = getAdminAnalytics();
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalDonations", admin.getTotalDonations());
        summary.put("completedDonations", admin.getCompletedDonations());
        summary.put("totalMealsRescued", admin.getTotalEstimatedMealsRescued());
        summary.put("co2OffsetKg", admin.getTotalEstimatedCo2SavedKg());
        summary.put("verifiedOrganizations", admin.getApprovedOrganizations());
        summary.put("activeCommunities", admin.getTotalDonors() + admin.getTotalRecipients());
        return summary;
    }
}

