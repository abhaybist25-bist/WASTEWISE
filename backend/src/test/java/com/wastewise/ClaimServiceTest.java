package com.wastewise;

import com.wastewise.claim.*;
import com.wastewise.donation.Donation;
import com.wastewise.donation.DonationRepository;
import com.wastewise.donation.DonationStatus;
import com.wastewise.exception.BadRequestException;
import com.wastewise.history.HistoryService;
import com.wastewise.notification.NotificationService;
import com.wastewise.organization.Organization;
import com.wastewise.organization.OrganizationRepository;
import com.wastewise.organization.VerificationStatus;
import com.wastewise.security.UserPrincipal;
import com.wastewise.user.Role;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private HistoryService historyService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ClaimService claimService;

    private User recipientUser;
    private Organization verifiedOrg;
    private Donation sampleDonation;
    private UserPrincipal recipientPrincipal;

    @BeforeEach
    void setUp() {
        recipientUser = new User("Sister Ananya", "contact@annaseva.org", "pass", Role.ROLE_RECIPIENT);
        recipientUser.setId("recipient-1");
        recipientUser.setOrganizationId("org-1");

        verifiedOrg = new Organization();
        verifiedOrg.setId("org-1");
        verifiedOrg.setName("Anna Seva Kitchen");
        verifiedOrg.setVerificationStatus(VerificationStatus.APPROVED);

        recipientPrincipal = new UserPrincipal(
                "recipient-1", "Sister Ananya", "contact@annaseva.org", "pass", "org-1",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_RECIPIENT")), true
        );

        sampleDonation = new Donation();
        sampleDonation.setId("don-1");
        sampleDonation.setFoodName("Buffet Surplus");
        sampleDonation.setDonorId("donor-1");
        sampleDonation.setTotalQuantity(100.0);
        sampleDonation.setRemainingQuantity(100.0);
        sampleDonation.setUnit("MEALS");
        sampleDonation.setStatus(DonationStatus.AVAILABLE);
        sampleDonation.setPickupDeadline(Instant.now().plus(6, ChronoUnit.HOURS));
    }

    @Test
    @DisplayName("Should support partial claim and correctly decrement remaining quantity")
    void testPartialClaim_Success() {
        CreateClaimRequest request = new CreateClaimRequest();
        request.setRequestedQuantity(40.0);

        when(userRepository.findById("recipient-1")).thenReturn(Optional.of(recipientUser));
        when(organizationRepository.findById("org-1")).thenReturn(Optional.of(verifiedOrg));
        when(donationRepository.findById("don-1")).thenReturn(Optional.of(sampleDonation));
        when(donationRepository.save(any(Donation.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(claimRepository.save(any(DonationClaim.class))).thenAnswer(invocation -> {
            DonationClaim c = invocation.getArgument(0);
            c.setId("claim-1");
            return c;
        });

        DonationClaim claim = claimService.claimDonation("don-1", request, recipientPrincipal);

        assertNotNull(claim);
        assertEquals(40.0, claim.getRequestedQuantity());
        assertEquals(60.0, sampleDonation.getRemainingQuantity(), "Remaining quantity should be 100 - 40 = 60");
        assertEquals(DonationStatus.PARTIALLY_CLAIMED, sampleDonation.getStatus());
        verify(donationRepository).save(sampleDonation);
    }

    @Test
    @DisplayName("Should prevent overclaiming when requested quantity exceeds available quantity")
    void testPreventOverclaiming() {
        CreateClaimRequest request = new CreateClaimRequest();
        request.setRequestedQuantity(150.0); // Only 100 available!

        when(userRepository.findById("recipient-1")).thenReturn(Optional.of(recipientUser));
        when(organizationRepository.findById("org-1")).thenReturn(Optional.of(verifiedOrg));
        when(donationRepository.findById("don-1")).thenReturn(Optional.of(sampleDonation));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                claimService.claimDonation("don-1", request, recipientPrincipal)
        );

        assertTrue(ex.getMessage().contains("exceeds available remaining quantity"));
        verify(claimRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject claims from unverified recipient organizations")
    void testRejectUnverifiedOrganization() {
        verifiedOrg.setVerificationStatus(VerificationStatus.PENDING); // Not approved!
        CreateClaimRequest request = new CreateClaimRequest();
        request.setRequestedQuantity(20.0);

        when(userRepository.findById("recipient-1")).thenReturn(Optional.of(recipientUser));
        when(organizationRepository.findById("org-1")).thenReturn(Optional.of(verifiedOrg));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                claimService.claimDonation("don-1", request, recipientPrincipal)
        );

        assertTrue(ex.getMessage().contains("verification required"));
        verify(donationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should mark donation as FULLY_CLAIMED when remaining quantity reaches 0")
    void testFullClaim_StatusTransition() {
        CreateClaimRequest request = new CreateClaimRequest();
        request.setRequestedQuantity(100.0);

        when(userRepository.findById("recipient-1")).thenReturn(Optional.of(recipientUser));
        when(organizationRepository.findById("org-1")).thenReturn(Optional.of(verifiedOrg));
        when(donationRepository.findById("don-1")).thenReturn(Optional.of(sampleDonation));
        when(donationRepository.save(any(Donation.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(claimRepository.save(any(DonationClaim.class))).thenAnswer(invocation -> invocation.getArgument(0));

        claimService.claimDonation("don-1", request, recipientPrincipal);

        assertEquals(0.0, sampleDonation.getRemainingQuantity());
        assertEquals(DonationStatus.FULLY_CLAIMED, sampleDonation.getStatus());
    }
}

