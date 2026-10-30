package com.wastewise.analytics;

import com.wastewise.common.ApiResponse;
import com.wastewise.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/donor")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<DonorAnalyticsDto>> getDonorAnalytics(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DonorAnalyticsDto data = analyticsService.getDonorAnalytics(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Donor analytics retrieved", data));
    }

    @GetMapping("/recipient")
    @PreAuthorize("hasAnyRole('RECIPIENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<RecipientAnalyticsDto>> getRecipientAnalytics(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RecipientAnalyticsDto data = analyticsService.getRecipientAnalytics(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Recipient analytics retrieved", data));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminAnalyticsDto>> getAdminAnalytics() {
        AdminAnalyticsDto data = analyticsService.getAdminAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Platform admin analytics retrieved", data));
    }

    @GetMapping("/platform-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformSummary() {
        Map<String, Object> summary = analyticsService.getPlatformSummary();
        return ResponseEntity.ok(ApiResponse.success("Platform impact summary retrieved", summary));
    }
}

