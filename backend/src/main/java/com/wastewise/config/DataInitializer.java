package com.wastewise.config;

import com.wastewise.claim.ClaimRepository;
import com.wastewise.donation.*;
import com.wastewise.history.DonationHistory;
import com.wastewise.history.HistoryRepository;
import com.wastewise.notification.NotificationRepository;
import com.wastewise.organization.Organization;
import com.wastewise.organization.OrganizationRepository;
import com.wastewise.organization.OrganizationType;
import com.wastewise.organization.VerificationStatus;
import com.wastewise.report.ReportRepository;
import com.wastewise.user.Role;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final DonationRepository donationRepository;
    private final ClaimRepository claimRepository;
    private final HistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           OrganizationRepository organizationRepository,
                           DonationRepository donationRepository,
                           ClaimRepository claimRepository,
                           HistoryRepository historyRepository,
                           NotificationRepository notificationRepository,
                           ReportRepository reportRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.donationRepository = donationRepository;
        this.claimRepository = claimRepository;
        this.historyRepository = historyRepository;
        this.notificationRepository = notificationRepository;
        this.reportRepository = reportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Initializing WasteWise database with baseline seed data...");
            seedDatabase();
            logger.info("WasteWise database initialized successfully!");
        }
    }

    public synchronized void resetDemoData() {
        logger.info("Resetting demo data...");
        claimRepository.deleteAll();
        donationRepository.deleteAll();
        historyRepository.deleteAll();
        notificationRepository.deleteAll();
        reportRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        seedDatabase();
        logger.info("Demo data reset completed!");
    }

    private void seedDatabase() {
        Instant now = Instant.now();

        // 1. Administrator
        User admin = new User();
        admin.setName("WasteWise Administrator");
        admin.setEmail("admin@wastewise.org");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setPhoneNumber("+91 98765 43210");
        admin.setAddress("WasteWise Governance Centre, MG Road, Bengaluru");
        admin.setActive(true);
        User savedAdmin = userRepository.save(admin);

        // 2. Verified Donor (Grand Palace Hotel)
        User donorUser = new User();
        donorUser.setName("Chef Vikram Malhotra");
        donorUser.setEmail("donor@grandhotel.com");
        donorUser.setPassword(passwordEncoder.encode("Donor@123"));
        donorUser.setRole(Role.ROLE_DONOR);
        donorUser.setPhoneNumber("+91 98111 22334");
        donorUser.setAddress("Grand Palace Banquet & Hotel, Brigade Road, Bengaluru");
        donorUser.setActive(true);
        User savedDonor = userRepository.save(donorUser);

        Organization donorOrg = new Organization();
        donorOrg.setName("Grand Palace Hotel & Banquets");
        donorOrg.setType(OrganizationType.HOTEL);
        donorOrg.setRegistrationNumber("FSSAI-11223344556677");
        donorOrg.setContactPerson("Chef Vikram Malhotra");
        donorOrg.setEmail("donor@grandhotel.com");
        donorOrg.setPhone("+91 98111 22334");
        donorOrg.setAddress("Brigade Road, Ashok Nagar");
        donorOrg.setCity("Bengaluru");
        donorOrg.setState("Karnataka");
        donorOrg.setPostalCode("560025");
        donorOrg.setLatitude(12.9719);
        donorOrg.setLongitude(77.6070);
        donorOrg.setVerificationStatus(VerificationStatus.APPROVED);
        donorOrg.setCreatedByUserId(savedDonor.getId());
        Organization savedDonorOrg = organizationRepository.save(donorOrg);

        savedDonor.setOrganizationId(savedDonorOrg.getId());
        userRepository.save(savedDonor);

        // 3. Verified Recipient (Anna Seva Community Kitchen)
        User recipientUser = new User();
        recipientUser.setName("Sister Ananya Rao");
        recipientUser.setEmail("contact@annaseva.org");
        recipientUser.setPassword(passwordEncoder.encode("Ngo@123"));
        recipientUser.setRole(Role.ROLE_RECIPIENT);
        recipientUser.setPhoneNumber("+91 98222 33445");
        recipientUser.setAddress("Anna Seva Foundation, Rajajinagar, Bengaluru");
        recipientUser.setActive(true);
        User savedRecipient = userRepository.save(recipientUser);

        Organization recipientOrg = new Organization();
        recipientOrg.setName("Anna Seva Community Kitchen & Trust");
        recipientOrg.setType(OrganizationType.COMMUNITY_KITCHEN);
        recipientOrg.setRegistrationNumber("DARPAN-KA-2023-01984");
        recipientOrg.setContactPerson("Sister Ananya Rao");
        recipientOrg.setEmail("contact@annaseva.org");
        recipientOrg.setPhone("+91 98222 33445");
        recipientOrg.setAddress("Rajajinagar 2nd Block");
        recipientOrg.setCity("Bengaluru");
        recipientOrg.setState("Karnataka");
        recipientOrg.setPostalCode("560010");
        recipientOrg.setLatitude(12.9982);
        recipientOrg.setLongitude(77.5530);
        recipientOrg.setDailyCapacity(250);
        recipientOrg.setAcceptedCategories(Arrays.asList("COOKED_MEALS", "BAKERY_PRODUCTS", "FRUITS", "VEGETABLES"));
        recipientOrg.setVerificationStatus(VerificationStatus.APPROVED);
        recipientOrg.setVerificationNotes("FSSAI certified and NGO Darpan verified kitchen.");
        recipientOrg.setCreatedByUserId(savedRecipient.getId());
        Organization savedRecipientOrg = organizationRepository.save(recipientOrg);

        savedRecipient.setOrganizationId(savedRecipientOrg.getId());
        userRepository.save(savedRecipient);

        // 4. Pending Recipient (Hope Children Shelter)
        User pendingRecipient = new User();
        pendingRecipient.setName("David Joseph");
        pendingRecipient.setEmail("hope@shelter.org");
        pendingRecipient.setPassword(passwordEncoder.encode("Ngo@123"));
        pendingRecipient.setRole(Role.ROLE_RECIPIENT);
        pendingRecipient.setPhoneNumber("+91 98333 44556");
        pendingRecipient.setAddress("Hope Foundation Shelter, Koramangala 4th Block, Bengaluru");
        pendingRecipient.setActive(true);
        User savedPendingRecipient = userRepository.save(pendingRecipient);

        Organization pendingOrg = new Organization();
        pendingOrg.setName("Hope Children Foundation");
        pendingOrg.setType(OrganizationType.SHELTER);
        pendingOrg.setRegistrationNumber("REG-NGO-998811");
        pendingOrg.setContactPerson("David Joseph");
        pendingOrg.setEmail("hope@shelter.org");
        pendingOrg.setPhone("+91 98333 44556");
        pendingOrg.setAddress("Koramangala 4th Block");
        pendingOrg.setCity("Bengaluru");
        pendingOrg.setState("Karnataka");
        pendingOrg.setPostalCode("560034");
        pendingOrg.setLatitude(12.9352);
        pendingOrg.setLongitude(77.6245);
        pendingOrg.setDailyCapacity(80);
        pendingOrg.setAcceptedCategories(Arrays.asList("COOKED_MEALS", "PACKAGED_FOOD"));
        pendingOrg.setVerificationStatus(VerificationStatus.PENDING);
        pendingOrg.setCreatedByUserId(savedPendingRecipient.getId());
        Organization savedPendingOrg = organizationRepository.save(pendingOrg);

        savedPendingRecipient.setOrganizationId(savedPendingOrg.getId());
        userRepository.save(savedPendingRecipient);

        // 5. Volunteer
        User volunteer = new User();
        volunteer.setName("Rahul Sharma");
        volunteer.setEmail("volunteer@wastewise.org");
        volunteer.setPassword(passwordEncoder.encode("Volunteer@123"));
        volunteer.setRole(Role.ROLE_VOLUNTEER);
        volunteer.setPhoneNumber("+91 98444 55667");
        volunteer.setAddress("Indiranagar, Bengaluru");
        volunteer.setActive(true);
        userRepository.save(volunteer);

        // 6. Sample Live Food Donations
        Donation d1 = new Donation();
        d1.setDonorId(savedDonor.getId());
        d1.setDonorName(savedDonor.getName());
        d1.setDonorOrganizationName(savedDonorOrg.getName());
        d1.setDonorPhone(savedDonor.getPhoneNumber());
        d1.setFoodName("Buffet Surplus: Paneer Butter Masala & Jeera Rice");
        d1.setDescription("Freshly cooked banquet surplus from corporate luncheon. Prepared in commercial kitchen following strict hygiene protocols. Kept in food-grade insulated containers.");
        d1.setCategory(FoodCategory.COOKED_MEALS);
        d1.setImageUrl("https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80");
        d1.setTotalQuantity(70.0);
        d1.setRemainingQuantity(70.0);
        d1.setUnit("MEALS");
        d1.setDietaryType(DietaryType.VEGETARIAN);
        d1.setPreparationTime(now.minus(2, ChronoUnit.HOURS));
        d1.setSafeConsumptionDeadline(now.plus(6, ChronoUnit.HOURS));
        d1.setStorageCondition(StorageCondition.HOT_HOLDING);
        d1.setAllergens(List.of("DAIRY"));
        d1.setPackagingDetails("Stainless steel sanitized thermal bins + foil packs");
        d1.setPickupAddress("Grand Palace Hotel, Banquet Kitchen Loading Bay, Brigade Road");
        d1.setCity("Bengaluru");
        d1.setState("Karnataka");
        d1.setPostalCode("560025");
        d1.setCoordinates(new LocationCoordinates(12.9719, 77.6070));
        d1.setPickupStartTime(now);
        d1.setPickupDeadline(now.plus(4, ChronoUnit.HOURS));
        d1.setSafetyDeclarationAccepted(true);
        d1.setPreparedUnderTemperature("Maintained above 65°C hot holding");
        d1.setStatus(DonationStatus.AVAILABLE);
        Donation savedD1 = donationRepository.save(d1);

        historyRepository.save(new DonationHistory(
                savedD1.getId(), null, "CREATED", savedDonor.getId(), savedDonor.getName(),
                "ROLE_DONOR", null, "AVAILABLE", "Published surplus banquet buffet listing"
        ));

        Donation d2 = new Donation();
        d2.setDonorId(savedDonor.getId());
        d2.setDonorName(savedDonor.getName());
        d2.setDonorOrganizationName(savedDonorOrg.getName());
        d2.setDonorPhone(savedDonor.getPhoneNumber());
        d2.setFoodName("Assorted Artisan Breads & Multigrain Loaves");
        d2.setDescription("Fresh bakery items baked this morning. Unsold bakery display including sourdough, burger buns, and whole wheat loaves.");
        d2.setCategory(FoodCategory.BAKERY_PRODUCTS);
        d2.setImageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80");
        d2.setTotalQuantity(40.0);
        d2.setRemainingQuantity(40.0);
        d2.setUnit("PACKETS");
        d2.setDietaryType(DietaryType.VEGETARIAN);
        d2.setPreparationTime(now.minus(4, ChronoUnit.HOURS));
        d2.setSafeConsumptionDeadline(now.plus(36, ChronoUnit.HOURS));
        d2.setStorageCondition(StorageCondition.ROOM_TEMPERATURE);
        d2.setAllergens(List.of("GLUTEN"));
        d2.setPackagingDetails("Individually wrapped paper packets");
        d2.setPickupAddress("Grand Palace Bakery Counter, Brigade Road");
        d2.setCity("Bengaluru");
        d2.setState("Karnataka");
        d2.setPostalCode("560025");
        d2.setCoordinates(new LocationCoordinates(12.9725, 77.6080));
        d2.setPickupStartTime(now);
        d2.setPickupDeadline(now.plus(8, ChronoUnit.HOURS));
        d2.setSafetyDeclarationAccepted(true);
        d2.setStatus(DonationStatus.AVAILABLE);
        Donation savedD2 = donationRepository.save(d2);

        historyRepository.save(new DonationHistory(
                savedD2.getId(), null, "CREATED", savedDonor.getId(), savedDonor.getName(),
                "ROLE_DONOR", null, "AVAILABLE", "Published bakery surplus listing"
        ));

        Donation d3 = new Donation();
        d3.setDonorId(savedDonor.getId());
        d3.setDonorName(savedDonor.getName());
        d3.setDonorOrganizationName(savedDonorOrg.getName());
        d3.setDonorPhone(savedDonor.getPhoneNumber());
        d3.setFoodName("Fresh Farm Spinach, Tomatoes & Carrots");
        d3.setDescription("Surplus fresh produce from morning farm delivery, excess stock before weekend replenishment.");
        d3.setCategory(FoodCategory.VEGETABLES);
        d3.setImageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80");
        d3.setTotalQuantity(45.0);
        d3.setRemainingQuantity(45.0);
        d3.setUnit("KG");
        d3.setDietaryType(DietaryType.VEGAN);
        d3.setPreparationTime(now.minus(6, ChronoUnit.HOURS));
        d3.setSafeConsumptionDeadline(now.plus(48, ChronoUnit.HOURS));
        d3.setStorageCondition(StorageCondition.REFRIGERATED);
        d3.setAllergens(List.of("NONE"));
        d3.setPackagingDetails("Ventilated crates");
        d3.setPickupAddress("Grand Palace Cold Storage Yard, Ashok Nagar");
        d3.setCity("Bengaluru");
        d3.setState("Karnataka");
        d3.setPostalCode("560025");
        d3.setCoordinates(new LocationCoordinates(12.9710, 77.6065));
        d3.setPickupStartTime(now);
        d3.setPickupDeadline(now.plus(12, ChronoUnit.HOURS));
        d3.setSafetyDeclarationAccepted(true);
        d3.setStatus(DonationStatus.AVAILABLE);
        Donation savedD3 = donationRepository.save(d3);

        historyRepository.save(new DonationHistory(
                savedD3.getId(), null, "CREATED", savedDonor.getId(), savedDonor.getName(),
                "ROLE_DONOR", null, "AVAILABLE", "Published organic vegetables surplus listing"
        ));
    }
}

