package com.wastewise.claim;

import com.wastewise.common.ApiResponse;
import com.wastewise.common.AppConstants;
import com.wastewise.common.PagedResponse;
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
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping("/donations/{id}/claims")
    @PreAuthorize("hasAnyRole('RECIPIENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<DonationClaim>> createClaim(
            @PathVariable String id,
            @Valid @RequestBody CreateClaimRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DonationClaim claim = claimService.claimDonation(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Donation claimed successfully", claim));
    }

    @GetMapping("/claims/my")
    @PreAuthorize("hasAnyRole('RECIPIENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<DonationClaim>>> getMyClaims(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<DonationClaim> claims = claimService.getMyClaims(currentUser, page, size);
        return ResponseEntity.ok(ApiResponse.success("Recipient claims retrieved", claims));
    }

    @GetMapping("/claims/donor")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<DonationClaim>>> getClaimsForDonor(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<DonationClaim> claims = claimService.getClaimsForDonor(currentUser, page, size);
        return ResponseEntity.ok(ApiResponse.success("Donor claims retrieved", claims));
    }

    @GetMapping("/donations/{id}/claims")
    public ResponseEntity<ApiResponse<List<DonationClaim>>> getClaimsByDonation(@PathVariable String id) {
        List<DonationClaim> claims = claimService.getClaimsByDonationId(id);
        return ResponseEntity.ok(ApiResponse.success("Claims for donation retrieved", claims));
    }

    @GetMapping("/claims/{id}")
    public ResponseEntity<ApiResponse<DonationClaim>> getClaimById(@PathVariable String id) {
        DonationClaim claim = claimService.getClaimById(id);
        return ResponseEntity.ok(ApiResponse.success("Claim details retrieved", claim));
    }

    @PatchMapping("/claims/{id}/status")
    public ResponseEntity<ApiResponse<DonationClaim>> updateClaimStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateClaimStatusRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DonationClaim updated = claimService.updateClaimStatus(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Claim status updated", updated));
    }

    @PostMapping("/claims/{id}/pickup-confirmation")
    public ResponseEntity<ApiResponse<DonationClaim>> confirmPickup(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String notes = body != null ? body.get("notes") : null;
        DonationClaim updated = claimService.confirmPickup(id, currentUser, notes);
        return ResponseEntity.ok(ApiResponse.success("Pickup milestone confirmed", updated));
    }

    @PostMapping("/claims/{id}/delivery-confirmation")
    public ResponseEntity<ApiResponse<DonationClaim>> confirmDelivery(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String notes = body != null ? body.get("notes") : null;
        DonationClaim updated = claimService.confirmDelivery(id, currentUser, notes);
        return ResponseEntity.ok(ApiResponse.success("Delivery milestone confirmed", updated));
    }
}

