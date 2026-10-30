package com.wastewise.organization;

import com.wastewise.exception.ResourceNotFoundException;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationService(OrganizationRepository organizationRepository, UserRepository userRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    public Organization createOrganization(CreateOrganizationRequest request, String userId) {
        Organization organization = new Organization();
        organization.setName(request.getName().trim());
        organization.setType(request.getType());
        organization.setRegistrationNumber(request.getRegistrationNumber());
        organization.setContactPerson(request.getContactPerson());
        organization.setEmail(request.getEmail());
        organization.setPhone(request.getPhone());
        organization.setAddress(request.getAddress());
        organization.setCity(request.getCity());
        organization.setState(request.getState());
        organization.setPostalCode(request.getPostalCode());
        organization.setLatitude(request.getLatitude() != null ? request.getLatitude() : 12.9716);
        organization.setLongitude(request.getLongitude() != null ? request.getLongitude() : 77.5946);
        organization.setDailyCapacity(request.getDailyCapacity() != null ? request.getDailyCapacity() : 100);
        organization.setAcceptedCategories(request.getAcceptedCategories());
        organization.setCreatedByUserId(userId);
        organization.setVerificationStatus(VerificationStatus.PENDING);
        organization.setCreatedAt(Instant.now());
        organization.setUpdatedAt(Instant.now());

        Organization saved = organizationRepository.save(organization);

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setOrganizationId(saved.getId());
            userRepository.save(user);
        }

        return saved;
    }

    public Organization getOrganizationById(String id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", id));
    }

    public Organization getOrganizationByUserId(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (user.getOrganizationId() == null) {
            return null;
        }
        return organizationRepository.findById(user.getOrganizationId()).orElse(null);
    }

    public List<Organization> getPendingOrganizations() {
        return organizationRepository.findByVerificationStatus(VerificationStatus.PENDING);
    }

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    public Organization updateVerificationStatus(String id, VerificationRequest request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", id));

        organization.setVerificationStatus(request.getStatus());
        if (request.getNotes() != null) {
            organization.setVerificationNotes(request.getNotes());
        }
        organization.setUpdatedAt(Instant.now());

        return organizationRepository.save(organization);
    }
}

