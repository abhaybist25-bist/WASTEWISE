package com.wastewise.donation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface DonationRepository extends MongoRepository<Donation, String> {

    Page<Donation> findByStatusIn(Collection<DonationStatus> statuses, Pageable pageable);

    Page<Donation> findByDonorId(String donorId, Pageable pageable);

    List<Donation> findByDonorId(String donorId);

    List<Donation> findByStatusInAndPickupDeadlineBefore(Collection<DonationStatus> statuses, Instant now);

    @Query("{ '$and': [ " +
           "  { 'status': { '$in': ?0 } }, " +
           "  { '$or': [ " +
           "    { 'foodName': { '$regex': ?1, '$options': 'i' } }, " +
           "    { 'description': { '$regex': ?1, '$options': 'i' } }, " +
           "    { 'city': { '$regex': ?1, '$options': 'i' } } " +
           "  ] } " +
           "] }")
    Page<Donation> searchActiveDonations(Collection<DonationStatus> statuses, String keyword, Pageable pageable);

    long countByStatus(DonationStatus status);

    long countByStatusIn(Collection<DonationStatus> statuses);

    long countByDonorId(String donorId);

    long countByDonorIdAndStatus(String donorId, DonationStatus status);
}

