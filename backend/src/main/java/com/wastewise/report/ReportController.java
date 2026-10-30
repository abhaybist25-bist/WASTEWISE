package com.wastewise.report;

import com.wastewise.common.ApiResponse;
import com.wastewise.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/reports")
    public ResponseEntity<ApiResponse<Report>> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Report report = reportService.createReport(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Report submitted for administrator review", report));
    }

    @GetMapping("/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Report>>> getAllReports() {
        List<Report> reports = reportService.getAllReports();
        return ResponseEntity.ok(ApiResponse.success("Reports retrieved", reports));
    }

    @PatchMapping("/admin/reports/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Report>> updateReportStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ReportStatus status = ReportStatus.valueOf(body.getOrDefault("status", "RESOLVED").toUpperCase());
        String notes = body.get("adminNotes");
        Report updated = reportService.updateReportStatus(id, status, notes, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Report status updated", updated));
    }
}

