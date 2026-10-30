package com.wastewise.history;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoryService {

    private final HistoryRepository historyRepository;

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public DonationHistory recordEvent(String donationId, String claimId, String action,
                                       String actorId, String actorName, String actorRole,
                                       String prevStatus, String newStatus, String notes) {
        DonationHistory history = new DonationHistory(
                donationId, claimId, action, actorId, actorName, actorRole, prevStatus, newStatus, notes
        );
        return historyRepository.save(history);
    }

    public List<DonationHistory> getHistoryByDonationId(String donationId) {
        return historyRepository.findByDonationIdOrderByTimestampDesc(donationId);
    }
}

