package com.wastewise.report;

import com.wastewise.donation.Donation;
import com.wastewise.donation.DonationRepository;
import com.wastewise.exception.ResourceNotFoundException;
import com.wastewise.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final DonationRepository donationRepository;

    public ReportService(ReportRepository reportRepository, DonationRepository donationRepository) {
        this.reportRepository = reportRepository;
        this.donationRepository = donationRepository;
    }

    public Report createReport(CreateReportRequest request, UserPrincipal currentUser) {
        Donation donation = donationRepository.findById(request.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", request.getDonationId()));

        Report report = new Report();
        report.setDonationId(donation.getId());
        report.setFoodName(donation.getFoodName());
        report.setReporterId(currentUser.getId());
        report.setReporterName(currentUser.getName());
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());
        report.setStatus(ReportStatus.PENDING);
        report.setCreatedAt(Instant.now());

        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Report> getPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING);
    }

    public Report updateReportStatus(String id, ReportStatus status, String notes, UserPrincipal adminUser) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));

        report.setStatus(status);
        report.setAdminNotes(notes);
        report.setResolvedBy(adminUser.getName());
        report.setResolvedAt(Instant.now());

        return reportRepository.save(report);
    }
}

