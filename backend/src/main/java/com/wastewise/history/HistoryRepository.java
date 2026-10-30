package com.wastewise.history;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoryRepository extends MongoRepository<DonationHistory, String> {
    List<DonationHistory> findByDonationIdOrderByTimestampDesc(String donationId);
    List<DonationHistory> findByActorIdOrderByTimestampDesc(String actorId);
}

