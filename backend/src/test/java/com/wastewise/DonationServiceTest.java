package com.wastewise;

import com.wastewise.donation.*;
import com.wastewise.exception.BadRequestException;
import com.wastewise.history.HistoryService;
import com.wastewise.notification.NotificationService;
import com.wastewise.organization.OrganizationRepository;
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
class DonationServiceTest {

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
    private DonationService donationService;

    private User donorUser;
    private UserPrincipal donorPrincipal;

    @BeforeEach
    void setUp() {
        donorUser = new User("Chef Vikram", "donor@grandhotel.com", "pass", Role.ROLE_DONOR);
        donorUser.setId("donor-1");

        donorPrincipal = new UserPrincipal(
                "donor-1", "Chef Vikram", "donor@grandhotel.com", "pass", null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_DONOR")), true
        );
    }

    @Test
    @DisplayName("Should successfully create donation when safety declaration accepted")
    void testCreateDonation_Success() {
        Instant now = Instant.now();
        CreateDonationRequest request = new CreateDonationRequest();
        request.setFoodName("Fresh Rice & Curry");
        request.setDescription("Hygienically prepared");
        request.setCategory(FoodCategory.COOKED_MEALS);
        request.setQuantity(50.0);
        request.setUnit("MEALS");
        request.setStorageCondition(StorageCondition.HOT_HOLDING);
        request.setPickupAddress("Brigade Road, Bengaluru");
        request.setPickupDeadline(now.plus(4, ChronoUnit.HOURS));
        request.setSafeConsumptionDeadline(now.plus(6, ChronoUnit.HOURS));
        request.setSafetyDeclarationAccepted(true);

        when(userRepository.findById("donor-1")).thenReturn(Optional.of(donorUser));
        when(donationRepository.save(any(Donation.class))).thenAnswer(invocation -> {
            Donation d = invocation.getArgument(0);
            d.setId("don-100");
            return d;
        });

        Donation created = donationService.createDonation(request, donorPrincipal);

        assertNotNull(created);
        assertEquals("Fresh Rice & Curry", created.getFoodName());
        assertEquals(50.0, created.getRemainingQuantity());
        assertEquals(DonationStatus.AVAILABLE, created.getStatus());
        verify(historyService).recordEvent(any(), any(), eq("CREATED"), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should reject donation creation if food-safety declaration is not accepted")
    void testCreateDonation_RejectWithoutSafetyDeclaration() {
        CreateDonationRequest request = new CreateDonationRequest();
        request.setSafetyDeclarationAccepted(false); // Refused declaration!

        assertThrows(BadRequestException.class, () ->
                donationService.createDonation(request, donorPrincipal)
        );
        verify(donationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject donation when pickup deadline exceeds safe-consumption deadline")
    void testCreateDonation_InconsistentDeadlines() {
        Instant now = Instant.now();
        CreateDonationRequest request = new CreateDonationRequest();
        request.setFoodName("Meals");
        request.setSafetyDeclarationAccepted(true);
        // Pickup deadline AFTER safe consumption deadline! Contradictory/unsafe!
        request.setPickupDeadline(now.plus(10, ChronoUnit.HOURS));
        request.setSafeConsumptionDeadline(now.plus(4, ChronoUnit.HOURS));

        assertThrows(BadRequestException.class, () ->
                donationService.createDonation(request, donorPrincipal)
        );
    }

    @Test
    @DisplayName("Should calculate geographic distance accurately using Haversine formula")
    void testCalculateDistanceKm() {
        // Bengaluru MG Road (12.9756, 77.6066) to Koramangala (12.9352, 77.6245) is approx 4.8 km
        double distance = donationService.calculateDistanceKm(12.9756, 77.6066, 12.9352, 77.6245);
        assertTrue(distance > 4.0 && distance < 6.0, "Distance should be approx 4.8 km");
    }
}

