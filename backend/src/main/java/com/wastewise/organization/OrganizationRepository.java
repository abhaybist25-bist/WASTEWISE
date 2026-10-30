package com.wastewise.organization;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends MongoRepository<Organization, String> {
    List<Organization> findByVerificationStatus(VerificationStatus status);
    Optional<Organization> findByCreatedByUserId(String createdByUserId);
    long countByVerificationStatus(VerificationStatus status);
}

