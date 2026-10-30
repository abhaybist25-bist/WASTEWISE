package com.wastewise.donation;

import com.wastewise.common.ApiResponse;
import com.wastewise.common.AppConstants;
import com.wastewise.common.PagedResponse;
import com.wastewise.history.DonationHistory;
import com.wastewise.history.HistoryService;
import com.wastewise.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;
    private final HistoryService historyService;

    public DonationController(DonationService donationService, HistoryService historyService) {
        this.donationService = donationService;
        this.historyService = historyService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Donation>> createDonation(
            @Valid @RequestBody CreateDonationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Donation donation = donationService.createDonation(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Donation published successfully", donation));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<Donation>>> getActiveDonations(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) FoodCategory category,
            @RequestParam(required = false) Double minQuantity,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<Donation> response = donationService.getActiveDonations(
                keyword, category, minQuantity, status, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("Active food donations retrieved", response));
    }

    @GetMapping("/{id:[a-fA-F0-9]{24}}")
    public ResponseEntity<ApiResponse<Donation>> getDonationById(@PathVariable String id) {
        Donation donation = donationService.getDonationById(id);
        return ResponseEntity.ok(ApiResponse.success("Donation details retrieved", donation));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<Donation>>> getMyDonations(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<Donation> response = donationService.getMyDonations(currentUser, page, size);
        return ResponseEntity.ok(ApiResponse.success("My donations retrieved", response));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<Donation>>> getNearbyDonations(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "30.0") Double radiusKm) {
        List<Donation> list = donationService.getNearbyDonations(lat, lng, radiusKm);
        return ResponseEntity.ok(ApiResponse.success("Nearby donations retrieved", list));
    }

    @PutMapping("/{id:[a-fA-F0-9]{24}}")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Donation>> updateDonation(
            @PathVariable String id,
            @RequestBody UpdateDonationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Donation updated = donationService.updateDonation(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Donation updated successfully", updated));
    }

    @PatchMapping("/{id:[a-fA-F0-9]{24}}/cancel")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Donation>> cancelDonation(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String reason = body != null ? body.get("reason") : null;
        Donation cancelled = donationService.cancelDonation(id, currentUser, reason);
        return ResponseEntity.ok(ApiResponse.success("Donation cancelled", cancelled));
    }

    @GetMapping("/{id:[a-fA-F0-9]{24}}/history")
    public ResponseEntity<ApiResponse<List<DonationHistory>>> getDonationHistory(@PathVariable String id) {
        List<DonationHistory> history = historyService.getHistoryByDonationId(id);
        return ResponseEntity.ok(ApiResponse.success("Donation history retrieved", history));
    }

    @PatchMapping("/admin/{id:[a-fA-F0-9]{24}}/flag")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Donation>> flagDonation(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Inappropriate listing";
        Donation flagged = donationService.flagDonationByAdmin(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Donation flagged and suspended", flagged));
    }
}

