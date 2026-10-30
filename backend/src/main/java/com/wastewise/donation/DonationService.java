package com.wastewise.donation;

import com.wastewise.common.AppConstants;
import com.wastewise.common.PagedResponse;
import com.wastewise.exception.BadRequestException;
import com.wastewise.exception.ResourceNotFoundException;
import com.wastewise.exception.UnauthorizedException;
import com.wastewise.history.HistoryService;
import com.wastewise.notification.NotificationService;
import com.wastewise.notification.NotificationType;
import com.wastewise.organization.Organization;
import com.wastewise.organization.OrganizationRepository;
import com.wastewise.security.UserPrincipal;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final HistoryService historyService;
    private final NotificationService notificationService;

    public DonationService(DonationRepository donationRepository,
                           UserRepository userRepository,
                           OrganizationRepository organizationRepository,
                           HistoryService historyService,
                           NotificationService notificationService) {
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.historyService = historyService;
        this.notificationService = notificationService;
    }

    public Donation createDonation(CreateDonationRequest request, UserPrincipal currentUser) {
        // Food Safety and Consistency Validations
        if (!request.isSafetyDeclarationAccepted()) {
            throw new BadRequestException("Donation rejected: You must accept the FSSAI food-safety declaration.");
        }

        Instant now = Instant.now();
        if (request.getPickupDeadline().isBefore(now)) {
            throw new BadRequestException("Donation rejected: Pickup deadline must be in the future.");
        }

        if (request.getSafeConsumptionDeadline() != null &&
                request.getPickupDeadline().isAfter(request.getSafeConsumptionDeadline())) {
            throw new BadRequestException("Donation rejected: Pickup deadline cannot be later than the safe consumption deadline.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Organization org = null;
        if (user.getOrganizationId() != null) {
            org = organizationRepository.findById(user.getOrganizationId()).orElse(null);
        }

        Donation donation = new Donation();
        donation.setDonorId(user.getId());
        donation.setDonorName(user.getName());
        donation.setDonorOrganizationName(org != null ? org.getName() : user.getName());
        donation.setDonorPhone(user.getPhoneNumber());

        donation.setFoodName(request.getFoodName().trim());
        donation.setDescription(request.getDescription().trim());
        donation.setCategory(request.getCategory());
        donation.setImageUrl(request.getImageUrl());
        donation.setTotalQuantity(request.getQuantity());
        donation.setRemainingQuantity(request.getQuantity());
        donation.setUnit(request.getUnit().toUpperCase());
        donation.setDietaryType(request.getDietaryType() != null ? request.getDietaryType() : DietaryType.VEGETARIAN);
        donation.setPreparationTime(request.getPreparationTime() != null ? request.getPreparationTime() : now);
        donation.setSafeConsumptionDeadline(request.getSafeConsumptionDeadline());
        donation.setStorageCondition(request.getStorageCondition());
        donation.setAllergens(request.getAllergens() != null ? request.getAllergens() : new ArrayList<>());
        donation.setPackagingDetails(request.getPackagingDetails());

        donation.setPickupAddress(request.getPickupAddress());
        donation.setCity(request.getCity());
        donation.setState(request.getState());
        donation.setPostalCode(request.getPostalCode());

        Double lat = request.getLatitude();
        Double lng = request.getLongitude();
        if (lat == null && org != null) lat = org.getLatitude();
        if (lng == null && org != null) lng = org.getLongitude();
        if (lat == null) lat = 12.9716;
        if (lng == null) lng = 77.5946;
        donation.setCoordinates(new LocationCoordinates(lat, lng));

        donation.setPickupStartTime(request.getPickupStartTime() != null ? request.getPickupStartTime() : now);
        donation.setPickupDeadline(request.getPickupDeadline());

        donation.setSafetyDeclarationAccepted(true);
        donation.setSafetyNotes(request.getSafetyNotes());
        donation.setPreparedUnderTemperature(request.getPreparedUnderTemperature());
        donation.setStatus(DonationStatus.AVAILABLE);

        Donation saved = donationRepository.save(donation);

        // Record history event
        historyService.recordEvent(
                saved.getId(), null, "CREATED", user.getId(), user.getName(),
                user.getRole().name(), null, DonationStatus.AVAILABLE.name(),
                "Published surplus food listing: " + saved.getFoodName() + " (" + saved.getTotalQuantity() + " " + saved.getUnit() + ")"
        );

        return saved;
    }

    public Donation getDonationById(String id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", id));
        checkAndExpireDonation(donation);
        return donation;
    }

    public PagedResponse<Donation> getActiveDonations(String keyword, FoodCategory category,
                                                     Double minQuantity, String status,
                                                     int page, int size) {
        expireOldDonations();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<DonationStatus> activeStatuses = Arrays.asList(DonationStatus.AVAILABLE, DonationStatus.PARTIALLY_CLAIMED);

        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try {
                DonationStatus specificStatus = DonationStatus.valueOf(status.toUpperCase());
                activeStatuses = Collections.singletonList(specificStatus);
            } catch (IllegalArgumentException ignored) {}
        }

        Page<Donation> donationPage;
        if (StringUtils.hasText(keyword)) {
            donationPage = donationRepository.searchActiveDonations(activeStatuses, keyword.trim(), pageable);
        } else {
            donationPage = donationRepository.findByStatusIn(activeStatuses, pageable);
        }

        List<Donation> filtered = donationPage.getContent().stream()
                .filter(d -> category == null || d.getCategory() == category)
                .filter(d -> minQuantity == null || (d.getRemainingQuantity() != null && d.getRemainingQuantity() >= minQuantity))
                .collect(Collectors.toList());

        return new PagedResponse<>(
                filtered,
                donationPage.getNumber(),
                donationPage.getSize(),
                donationPage.getTotalElements(),
                donationPage.getTotalPages(),
                donationPage.isLast()
        );
    }

    public List<Donation> getNearbyDonations(Double userLat, Double userLng, Double maxDistanceKm) {
        expireOldDonations();
        List<DonationStatus> activeStatuses = Arrays.asList(DonationStatus.AVAILABLE, DonationStatus.PARTIALLY_CLAIMED);
        List<Donation> activeList = donationRepository.findAll().stream()
                .filter(d -> activeStatuses.contains(d.getStatus()))
                .filter(d -> d.getCoordinates() != null && d.getCoordinates().getLatitude() != null && d.getCoordinates().getLongitude() != null)
                .collect(Collectors.toList());

        if (userLat == null || userLng == null) {
            return activeList;
        }

        double radius = (maxDistanceKm != null && maxDistanceKm > 0) ? maxDistanceKm : 30.0;

        return activeList.stream()
                .filter(d -> calculateDistanceKm(userLat, userLng, d.getCoordinates().getLatitude(), d.getCoordinates().getLongitude()) <= radius)
                .sorted(Comparator.comparingDouble(d -> calculateDistanceKm(userLat, userLng, d.getCoordinates().getLatitude(), d.getCoordinates().getLongitude())))
                .collect(Collectors.toList());
    }

    public PagedResponse<Donation> getMyDonations(UserPrincipal currentUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Donation> donationPage = donationRepository.findByDonorId(currentUser.getId(), pageable);

        return new PagedResponse<>(
                donationPage.getContent(),
                donationPage.getNumber(),
                donationPage.getSize(),
                donationPage.getTotalElements(),
                donationPage.getTotalPages(),
                donationPage.isLast()
        );
    }

    public Donation updateDonation(String id, UpdateDonationRequest request, UserPrincipal currentUser) {
        Donation donation = getDonationById(id);

        if (!donation.getDonorId().equals(currentUser.getId()) &&
                !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("You are not authorized to update this donation");
        }

        if (donation.getStatus() == DonationStatus.COMPLETED || donation.getStatus() == DonationStatus.FULLY_CLAIMED) {
            throw new BadRequestException("Cannot edit donation that is already fully claimed or completed");
        }

        if (request.getFoodName() != null) donation.setFoodName(request.getFoodName().trim());
        if (request.getDescription() != null) donation.setDescription(request.getDescription().trim());
        if (request.getCategory() != null) donation.setCategory(request.getCategory());
        if (request.getImageUrl() != null) donation.setImageUrl(request.getImageUrl());
        if (request.getQuantity() != null && request.getQuantity() > 0) {
            double diff = request.getQuantity() - donation.getTotalQuantity();
            donation.setTotalQuantity(request.getQuantity());
            donation.setRemainingQuantity(Math.max(0, donation.getRemainingQuantity() + diff));
        }
        if (request.getUnit() != null) donation.setUnit(request.getUnit().toUpperCase());
        if (request.getDietaryType() != null) donation.setDietaryType(request.getDietaryType());
        if (request.getStorageCondition() != null) donation.setStorageCondition(request.getStorageCondition());
        if (request.getAllergens() != null) donation.setAllergens(request.getAllergens());
        if (request.getPackagingDetails() != null) donation.setPackagingDetails(request.getPackagingDetails());
        if (request.getPickupAddress() != null) donation.setPickupAddress(request.getPickupAddress());
        if (request.getCity() != null) donation.setCity(request.getCity());
        if (request.getState() != null) donation.setState(request.getState());
        if (request.getPostalCode() != null) donation.setPostalCode(request.getPostalCode());

        if (request.getLatitude() != null && request.getLongitude() != null) {
            donation.setCoordinates(new LocationCoordinates(request.getLatitude(), request.getLongitude()));
        }
        if (request.getPickupDeadline() != null) {
            if (request.getPickupDeadline().isBefore(Instant.now())) {
                throw new BadRequestException("Pickup deadline must be in the future");
            }
            donation.setPickupDeadline(request.getPickupDeadline());
        }

        donation.setUpdatedAt(Instant.now());
        Donation saved = donationRepository.save(donation);

        historyService.recordEvent(
                saved.getId(), null, "UPDATED", currentUser.getId(), currentUser.getName(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                saved.getStatus().name(), saved.getStatus().name(), "Listing details updated"
        );

        return saved;
    }

    public Donation cancelDonation(String id, UserPrincipal currentUser, String reason) {
        Donation donation = getDonationById(id);

        if (!donation.getDonorId().equals(currentUser.getId()) &&
                !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("You are not authorized to cancel this donation");
        }

        if (donation.getStatus() == DonationStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed donation");
        }

        String prev = donation.getStatus().name();
        donation.setStatus(DonationStatus.CANCELLED);
        donation.setUpdatedAt(Instant.now());
        Donation saved = donationRepository.save(donation);

        historyService.recordEvent(
                saved.getId(), null, "CANCELLED", currentUser.getId(), currentUser.getName(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                prev, DonationStatus.CANCELLED.name(), "Listing cancelled: " + (reason != null ? reason : "Donor cancellation")
        );

        return saved;
    }

    public Donation flagDonationByAdmin(String id, String reason) {
        Donation donation = getDonationById(id);
        String prev = donation.getStatus().name();
        donation.setStatus(DonationStatus.FLAGGED);
        donation.setUpdatedAt(Instant.now());
        Donation saved = donationRepository.save(donation);

        historyService.recordEvent(
                saved.getId(), null, "FLAGGED", "ADMIN", "Administrator",
                "ROLE_ADMIN", prev, DonationStatus.FLAGGED.name(), "Listing flagged as unsafe or inappropriate: " + reason
        );

        notificationService.sendNotification(
                donation.getDonorId(), NotificationType.SYSTEM_ALERT,
                "Your donation listing '" + donation.getFoodName() + "' has been flagged and suspended: " + reason,
                donation.getId(), "DONATION"
        );

        return saved;
    }

    @Scheduled(fixedRate = 60000) // check every 60 seconds
    public void expireOldDonations() {
        Instant now = Instant.now();
        List<DonationStatus> activeStatuses = Arrays.asList(DonationStatus.AVAILABLE, DonationStatus.PARTIALLY_CLAIMED);
        List<Donation> expired = donationRepository.findByStatusInAndPickupDeadlineBefore(activeStatuses, now);

        for (Donation d : expired) {
            checkAndExpireDonation(d);
        }
    }

    private void checkAndExpireDonation(Donation d) {
        if ((d.getStatus() == DonationStatus.AVAILABLE || d.getStatus() == DonationStatus.PARTIALLY_CLAIMED)
                && d.getPickupDeadline() != null && d.getPickupDeadline().isBefore(Instant.now())) {
            String prev = d.getStatus().name();
            d.setStatus(DonationStatus.EXPIRED);
            d.setUpdatedAt(Instant.now());
            donationRepository.save(d);

            historyService.recordEvent(
                    d.getId(), null, "EXPIRED", "SYSTEM", "System Auto-Scheduler",
                    "SYSTEM", prev, DonationStatus.EXPIRED.name(), "Donation expired: Pickup deadline passed"
            );

            notificationService.sendNotification(
                    d.getDonorId(), NotificationType.LISTING_EXPIRING,
                    "Donation '" + d.getFoodName() + "' has expired as the pickup deadline has passed.",
                    d.getId(), "DONATION"
            );
        }
    }

    public double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371 * c; // Earth's radius in km
    }
}

