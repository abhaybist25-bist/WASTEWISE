package com.wastewise.auth;

import com.wastewise.exception.BadRequestException;
import com.wastewise.organization.Organization;
import com.wastewise.organization.OrganizationRepository;
import com.wastewise.organization.OrganizationType;
import com.wastewise.organization.VerificationStatus;
import com.wastewise.security.JwtTokenProvider;
import com.wastewise.security.UserPrincipal;
import com.wastewise.user.Role;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail().trim().toLowerCase(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User record not found"));

        String orgName = null;
        VerificationStatus vStatus = null;

        if (user.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(user.getOrganizationId()).orElse(null);
            if (org != null) {
                orgName = org.getName();
                vStatus = org.getVerificationStatus();
            }
        }

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getOrganizationId(),
                orgName,
                vStatus
        );
    }

    public AuthResponse registerUser(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email address is already in use!");
        }

        // Prevent registration with ROLE_ADMIN via the public register API
        if (request.getRole() == Role.ROLE_ADMIN) {
            throw new BadRequestException("Cannot register as an Administrator. Administrator accounts must be pre-provisioned.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setActive(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.save(user);

        // If organization details provided, create organization
        String orgName = null;
        VerificationStatus vStatus = null;
        if (StringUtils.hasText(request.getOrganizationName())) {
            Organization organization = new Organization();
            organization.setName(request.getOrganizationName().trim());
            organization.setType(request.getOrganizationType() != null ? request.getOrganizationType() :
                    (request.getRole() == Role.ROLE_DONOR ? OrganizationType.RESTAURANT : OrganizationType.NGO));
            organization.setRegistrationNumber(request.getRegistrationNumber());
            organization.setContactPerson(request.getName().trim());
            organization.setEmail(email);
            organization.setPhone(request.getPhoneNumber());
            organization.setAddress(request.getAddress());
            organization.setCity(request.getCity());
            organization.setState(request.getState());
            organization.setPostalCode(request.getPostalCode());
            organization.setLatitude(request.getLatitude() != null ? request.getLatitude() : 12.9716); // Default lat if omitted
            organization.setLongitude(request.getLongitude() != null ? request.getLongitude() : 77.5946); // Default lng if omitted
            organization.setDailyCapacity(request.getDailyCapacity() != null ? request.getDailyCapacity() : 100);
            organization.setAcceptedCategories(request.getAcceptedCategories());
            organization.setCreatedByUserId(savedUser.getId());
            // Pre-approval for regular donors, PENDING for NGOs/Recipients requiring admin verification
            organization.setVerificationStatus(VerificationStatus.PENDING);

            Organization savedOrg = organizationRepository.save(organization);
            savedUser.setOrganizationId(savedOrg.getId());
            userRepository.save(savedUser);

            orgName = savedOrg.getName();
            vStatus = savedOrg.getVerificationStatus();
        }

        // Generate token
        UserPrincipal principal = UserPrincipal.create(savedUser);
        String jwt = tokenProvider.generateTokenFromUser(principal);

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getOrganizationId(),
                orgName,
                vStatus
        );
    }
}

