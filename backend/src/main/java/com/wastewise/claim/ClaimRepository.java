package com.wastewise.claim;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends MongoRepository<DonationClaim, String> {
    List<DonationClaim> findByDonationId(String donationId);
    Page<DonationClaim> findByRecipientId(String recipientId, Pageable pageable);
    List<DonationClaim> findByRecipientId(String recipientId);
    Page<DonationClaim> findByDonorId(String donorId, Pageable pageable);
    List<DonationClaim> findByDonorId(String donorId);
    List<DonationClaim> findByVolunteerId(String volunteerId);
    long countByRecipientId(String recipientId);
    long countByRecipientIdAndStatus(String recipientId, ClaimStatus status);
    long countByDonorId(String donorId);
    long countByStatus(ClaimStatus status);
}

