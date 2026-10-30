package com.wastewise.matching;

import com.wastewise.common.ApiResponse;
import com.wastewise.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final SmartMatchingService smartMatchingService;

    public MatchingController(SmartMatchingService smartMatchingService) {
        this.smartMatchingService = smartMatchingService;
    }

    @GetMapping("/recommendations")
    @PreAuthorize("hasAnyRole('RECIPIENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<RecommendationDto>>> getRecommendations(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<RecommendationDto> recommendations = smartMatchingService.getRecommendationsForRecipient(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Smart recommendations calculated", recommendations));
    }
}

