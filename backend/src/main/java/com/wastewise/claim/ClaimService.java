package com.wastewise.claim;

import com.wastewise.common.PagedResponse;
import com.wastewise.donation.Donation;
import com.wastewise.donation.DonationRepository;
import com.wastewise.donation.DonationStatus;
import com.wastewise.exception.BadRequestException;
import com.wastewise.exception.ResourceNotFoundException;
import com.wastewise.exception.UnauthorizedException;
import com.wastewise.history.HistoryService;
import com.wastewise.notification.NotificationService;
import com.wastewise.notification.NotificationType;
import com.wastewise.organization.Organization;
import com.wastewise.organization.OrganizationRepository;
import com.wastewise.organization.VerificationStatus;
import com.wastewise.security.UserPrincipal;
import com.wastewise.user.Role;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final HistoryService historyService;
    private final NotificationService notificationService;

    public ClaimService(ClaimRepository claimRepository,
                        DonationRepository donationRepository,
                        UserRepository userRepository,
                        OrganizationRepository organizationRepository,
                        HistoryService historyService,
                        NotificationService notificationService) {
        this.claimRepository = claimRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.historyService = historyService;
        this.notificationService = notificationService;
    }

    public synchronized DonationClaim claimDonation(String donationId, CreateClaimRequest request, UserPrincipal currentUser) {
        User recipient = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // Verify recipient organization is approved
        Organization recipientOrg = null;
        if (!isAdmin) {
            if (recipient.getRole() != Role.ROLE_RECIPIENT) {
                throw new BadRequestException("Only registered recipient organizations or community kitchens can claim food.");
            }
            if (recipient.getOrganizationId() == null) {
                throw new BadRequestException("You must register your organization profile before claiming donations.");
            }
            recipientOrg = organizationRepository.findById(recipient.getOrganizationId())
                    .orElseThrow(() -> new BadRequestException("Organization profile not found."));

            if (recipientOrg.getVerificationStatus() != VerificationStatus.APPROVED) {
                throw new BadRequestException("Organization verification required: Your organization is currently '"
                        + recipientOrg.getVerificationStatus()
                        + "'. An administrator must approve your organization before you can claim surplus food.");
            }
        } else if (recipient.getOrganizationId() != null) {
            recipientOrg = organizationRepository.findById(recipient.getOrganizationId()).orElse(null);
        }

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", donationId));

        if (donation.getStatus() != DonationStatus.AVAILABLE && donation.getStatus() != DonationStatus.PARTIALLY_CLAIMED) {
            throw new BadRequestException("This donation is no longer available for claiming (Status: " + donation.getStatus() + ").");
        }

        if (donation.getPickupDeadline() != null && donation.getPickupDeadline().isBefore(Instant.now())) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            throw new BadRequestException("Cannot claim: This donation listing has expired.");
        }

        if (donation.getRemainingQuantity() == null || donation.getRemainingQuantity() <= 0) {
            donation.setStatus(DonationStatus.FULLY_CLAIMED);
            donationRepository.save(donation);
            throw new BadRequestException("Cannot claim: Remaining quantity is 0.");
        }

        if (request.getRequestedQuantity() > donation.getRemainingQuantity()) {
            throw new BadRequestException("Requested quantity (" + request.getRequestedQuantity() + " " + donation.getUnit()
                    + ") exceeds available remaining quantity (" + donation.getRemainingQuantity() + " " + donation.getUnit() + ").");
        }

        // Deduct quantity atomically
        double remaining = donation.getRemainingQuantity() - request.getRequestedQuantity();
        donation.setRemainingQuantity(remaining);
        String prevDonationStatus = donation.getStatus().name();
        if (remaining == 0) {
            donation.setStatus(DonationStatus.FULLY_CLAIMED);
        } else {
            donation.setStatus(DonationStatus.PARTIALLY_CLAIMED);
        }
        donation.setUpdatedAt(Instant.now());
        donationRepository.save(donation);

        // Create Claim
        DonationClaim claim = new DonationClaim();
        claim.setDonationId(donation.getId());
        claim.setFoodName(donation.getFoodName());
        claim.setDonorId(donation.getDonorId());
        claim.setDonorName(donation.getDonorName());
        claim.setDonorOrganizationName(donation.getDonorOrganizationName());

        claim.setRecipientId(recipient.getId());
        claim.setRecipientName(recipient.getName());
        claim.setRecipientOrganizationId(recipientOrg != null ? recipientOrg.getId() : null);
        claim.setRecipientOrganizationName(recipientOrg != null ? recipientOrg.getName() : recipient.getName());
        claim.setRecipientPhone(recipient.getPhoneNumber());

        claim.setRequestedQuantity(request.getRequestedQuantity());
        claim.setAcceptedQuantity(request.getRequestedQuantity());
        claim.setUnit(donation.getUnit());
        claim.setStatus(ClaimStatus.PENDING);
        claim.setNotes(request.getNotes());
        claim.setPickupAddress(donation.getPickupAddress() + (donation.getCity() != null ? ", " + donation.getCity() : ""));
        claim.setEstimatedPickupTime(request.getEstimatedPickupTime() != null ? request.getEstimatedPickupTime() : donation.getPickupDeadline());
        claim.setCreatedAt(Instant.now());
        claim.setUpdatedAt(Instant.now());

        DonationClaim savedClaim = claimRepository.save(claim);

        // Record history
        historyService.recordEvent(
                donation.getId(), savedClaim.getId(), "CLAIM_PLACED", recipient.getId(), recipient.getName(),
                recipient.getRole().name(), prevDonationStatus, donation.getStatus().name(),
                "Claim requested: " + savedClaim.getRequestedQuantity() + " " + savedClaim.getUnit() + " by " + claim.getRecipientOrganizationName()
        );

        // Notify donor
        notificationService.sendNotification(
                donation.getDonorId(), NotificationType.CLAIM_RECEIVED,
                "New claim request of " + savedClaim.getRequestedQuantity() + " " + savedClaim.getUnit()
                        + " for '" + donation.getFoodName() + "' from " + claim.getRecipientOrganizationName(),
                savedClaim.getId(), "CLAIM"
        );

        return savedClaim;
    }

    public DonationClaim updateClaimStatus(String claimId, UpdateClaimStatusRequest request, UserPrincipal currentUser) {
        DonationClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("DonationClaim", "id", claimId));

        Donation donation = donationRepository.findById(claim.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", claim.getDonationId()));

        boolean isDonor = donation.getDonorId().equals(currentUser.getId());
        boolean isRecipient = claim.getRecipientId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isDonor && !isRecipient && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to update this claim");
        }

        ClaimStatus newStatus = request.getStatus();
        ClaimStatus prevStatus = claim.getStatus();

        if (newStatus == ClaimStatus.REJECTED || newStatus == ClaimStatus.CANCELLED) {
            if (prevStatus == ClaimStatus.PENDING || prevStatus == ClaimStatus.ACCEPTED) {
                // Restore remaining quantity back to donation
                double restored = donation.getRemainingQuantity() + claim.getRequestedQuantity();
                donation.setRemainingQuantity(restored);
                if (donation.getStatus() == DonationStatus.FULLY_CLAIMED || donation.getStatus() == DonationStatus.PARTIALLY_CLAIMED) {
                    donation.setStatus(restored >= donation.getTotalQuantity() ? DonationStatus.AVAILABLE : DonationStatus.PARTIALLY_CLAIMED);
                }
                donation.setUpdatedAt(Instant.now());
                donationRepository.save(donation);
            }
        }

        claim.setStatus(newStatus);
        if (request.getNotes() != null) {
            claim.setNotes(request.getNotes());
        }
        if (request.getAcceptedQuantity() != null && request.getAcceptedQuantity() > 0) {
            claim.setAcceptedQuantity(request.getAcceptedQuantity());
        }
        claim.setUpdatedAt(Instant.now());
        DonationClaim saved = claimRepository.save(claim);

        historyService.recordEvent(
                donation.getId(), saved.getId(), "CLAIM_STATUS_" + newStatus.name(),
                currentUser.getId(), currentUser.getName(), currentUser.getAuthorities().iterator().next().getAuthority(),
                prevStatus.name(), newStatus.name(), "Claim status transitioned to " + newStatus.name()
        );

        // Notify other party
        String recipientNotifyId = isDonor ? claim.getRecipientId() : donation.getDonorId();
        NotificationType nType = newStatus == ClaimStatus.ACCEPTED ? NotificationType.CLAIM_ACCEPTED :
                (newStatus == ClaimStatus.REJECTED ? NotificationType.CLAIM_REJECTED : NotificationType.SYSTEM_ALERT);

        notificationService.sendNotification(
                recipientNotifyId, nType,
                "Claim update for '" + donation.getFoodName() + "': status is now " + newStatus.name(),
                saved.getId(), "CLAIM"
        );

        return saved;
    }

    public DonationClaim confirmPickup(String claimId, UserPrincipal currentUser, String notes) {
        DonationClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("DonationClaim", "id", claimId));

        Donation donation = donationRepository.findById(claim.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", claim.getDonationId()));

        claim.setStatus(ClaimStatus.PICKUP_CONFIRMED);
        claim.setPickupConfirmedAt(Instant.now());
        claim.setPickupConfirmedBy(currentUser.getName());
        claim.setUpdatedAt(Instant.now());
        DonationClaim saved = claimRepository.save(claim);

        donation.setStatus(DonationStatus.PICKUP_IN_PROGRESS);
        donation.setUpdatedAt(Instant.now());
        donationRepository.save(donation);

        historyService.recordEvent(
                donation.getId(), saved.getId(), "PICKUP_CONFIRMED", currentUser.getId(), currentUser.getName(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                "ACCEPTED", ClaimStatus.PICKUP_CONFIRMED.name(),
                "Pickup milestone confirmed by " + currentUser.getName() + (notes != null ? ": " + notes : "")
        );

        notificationService.sendNotification(
                claim.getRecipientId(), NotificationType.PICKUP_CONFIRMED,
                "Surplus food for '" + donation.getFoodName() + "' was picked up by " + currentUser.getName(),
                saved.getId(), "CLAIM"
        );

        return saved;
    }

    public DonationClaim confirmDelivery(String claimId, UserPrincipal currentUser, String deliveryNotes) {
        DonationClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("DonationClaim", "id", claimId));

        Donation donation = donationRepository.findById(claim.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", claim.getDonationId()));

        claim.setStatus(ClaimStatus.DELIVERED);
        claim.setDeliveredAt(Instant.now());
        claim.setDeliveredConfirmedBy(currentUser.getName());
        claim.setDeliveryNotes(deliveryNotes);
        claim.setUpdatedAt(Instant.now());
        DonationClaim saved = claimRepository.save(claim);

        // Check if all claims for this donation are delivered and remainingQuantity == 0
        List<DonationClaim> allClaims = claimRepository.findByDonationId(donation.getId());
        boolean allFinished = allClaims.stream().allMatch(c -> c.getStatus() == ClaimStatus.DELIVERED || c.getStatus() == ClaimStatus.CANCELLED || c.getStatus() == ClaimStatus.REJECTED);
        if (allFinished && (donation.getRemainingQuantity() == null || donation.getRemainingQuantity() <= 0)) {
            donation.setStatus(DonationStatus.COMPLETED);
            donation.setUpdatedAt(Instant.now());
            donationRepository.save(donation);
        }

        historyService.recordEvent(
                donation.getId(), saved.getId(), "DELIVERY_CONFIRMED", currentUser.getId(), currentUser.getName(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                ClaimStatus.PICKUP_CONFIRMED.name(), ClaimStatus.DELIVERED.name(),
                "Delivery & receipt confirmed by " + currentUser.getName() + (deliveryNotes != null ? ": " + deliveryNotes : "")
        );

        notificationService.sendNotification(
                donation.getDonorId(), NotificationType.DELIVERY_CONFIRMED,
                "Food delivery confirmed! '" + donation.getFoodName() + "' has safely reached " + claim.getRecipientOrganizationName(),
                saved.getId(), "CLAIM"
        );

        return saved;
    }

    public PagedResponse<DonationClaim> getMyClaims(UserPrincipal currentUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<DonationClaim> claimsPage = claimRepository.findByRecipientId(currentUser.getId(), pageable);

        return new PagedResponse<>(
                claimsPage.getContent(),
                claimsPage.getNumber(),
                claimsPage.getSize(),
                claimsPage.getTotalElements(),
                claimsPage.getTotalPages(),
                claimsPage.isLast()
        );
    }

    public PagedResponse<DonationClaim> getClaimsForDonor(UserPrincipal currentUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<DonationClaim> claimsPage = claimRepository.findByDonorId(currentUser.getId(), pageable);

        return new PagedResponse<>(
                claimsPage.getContent(),
                claimsPage.getNumber(),
                claimsPage.getSize(),
                claimsPage.getTotalElements(),
                claimsPage.getTotalPages(),
                claimsPage.isLast()
        );
    }

    public List<DonationClaim> getClaimsByDonationId(String donationId) {
        return claimRepository.findByDonationId(donationId);
    }

    public DonationClaim getClaimById(String id) {
        return claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DonationClaim", "id", id));
    }
}

