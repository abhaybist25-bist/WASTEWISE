package com.wastewise.config;

import com.wastewise.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    private final DataInitializer dataInitializer;

    public DemoController(DataInitializer dataInitializer) {
        this.dataInitializer = dataInitializer;
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<String>> resetDemoData() {
        dataInitializer.resetDemoData();
        return ResponseEntity.ok(ApiResponse.success("Demonstration data re-initialized successfully."));
    }

    @GetMapping("/credentials")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getDemoCredentials() {
        List<Map<String, String>> credentials = List.of(
                Map.of("role", "Administrator", "email", "admin@wastewise.org", "password", "Admin@123", "notes", "Full administrative dashboard access"),
                Map.of("role", "Donor (Grand Palace Hotel)", "email", "donor@grandhotel.com", "password", "Donor@123", "notes", "Verified donor with active listings"),
                Map.of("role", "Recipient (Anna Seva NGO)", "email", "contact@annaseva.org", "password", "Ngo@123", "notes", "Approved community kitchen eligible to claim"),
                Map.of("role", "Recipient (Pending Verification)", "email", "hope@shelter.org", "password", "Ngo@123", "notes", "Unverified NGO pending admin review"),
                Map.of("role", "Volunteer", "email", "volunteer@wastewise.org", "password", "Volunteer@123", "notes", "Volunteer collection and transit driver")
        );
        return ResponseEntity.ok(ApiResponse.success("Demo accounts retrieved", credentials));
    }
}

