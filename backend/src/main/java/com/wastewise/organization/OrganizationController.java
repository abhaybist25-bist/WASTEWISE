package com.wastewise.organization;

import com.wastewise.common.ApiResponse;
import com.wastewise.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping("/organizations")
    public ResponseEntity<ApiResponse<Organization>> createOrganization(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateOrganizationRequest request) {
        Organization organization = organizationService.createOrganization(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Organization profile created", organization));
    }

    @GetMapping("/organizations/me")
    public ResponseEntity<ApiResponse<Organization>> getMyOrganization(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Organization organization = organizationService.getOrganizationByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Organization retrieved", organization));
    }

    @GetMapping("/organizations/{id}")
    public ResponseEntity<ApiResponse<Organization>> getOrganizationById(@PathVariable String id) {
        Organization organization = organizationService.getOrganizationById(id);
        return ResponseEntity.ok(ApiResponse.success("Organization retrieved", organization));
    }

    @GetMapping("/admin/organizations/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Organization>>> getPendingOrganizations() {
        List<Organization> pending = organizationService.getPendingOrganizations();
        return ResponseEntity.ok(ApiResponse.success("Pending organizations retrieved", pending));
    }

    @GetMapping("/admin/organizations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Organization>>> getAllOrganizations() {
        List<Organization> all = organizationService.getAllOrganizations();
        return ResponseEntity.ok(ApiResponse.success("All organizations retrieved", all));
    }

    @PatchMapping("/admin/organizations/{id}/verification")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Organization>> updateVerificationStatus(
            @PathVariable String id,
            @Valid @RequestBody VerificationRequest request) {
        Organization updated = organizationService.updateVerificationStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Organization verification status updated", updated));
    }
}

