package com.wastewise.ai;

import com.wastewise.common.ApiResponse;
import com.wastewise.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiInsightsController {

    private final GeminiAiService geminiAiService;

    public AiInsightsController(GeminiAiService geminiAiService) {
        this.geminiAiService = geminiAiService;
    }

    @GetMapping("/insights")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AiInsightDto>> getInsights(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AiInsightDto insights = geminiAiService.generateInsightsForDonor(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("AI-powered food waste insights generated", insights));
    }

    @PostMapping("/insights/generate")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AiInsightDto>> triggerInsightGeneration(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AiInsightDto insights = geminiAiService.generateInsightsForDonor(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Insights freshly recalculated", insights));
    }
}

