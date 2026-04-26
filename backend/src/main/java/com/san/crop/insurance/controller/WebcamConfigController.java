package com.san.crop.insurance.controller;

import com.san.crop.insurance.service.IpWebcamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webcam")
@CrossOrigin(origins = "*")
public class WebcamConfigController {

    private final IpWebcamService ipWebcamService;

    public WebcamConfigController(IpWebcamService ipWebcamService) {
        this.ipWebcamService = ipWebcamService;
    }

    // GET current webcam URL
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        return ResponseEntity.ok(Map.of(
                "url",    ipWebcamService.getWebcamUrl(),
                "status", testConnection(ipWebcamService.getWebcamUrl())
        ));
    }

    // UPDATE webcam URL from frontend — no backend restart needed
    @PostMapping("/config")
    public ResponseEntity<Map<String, String>> updateConfig(@RequestBody Map<String, String> body) {
        String newUrl = body.get("url");
        if (newUrl == null || newUrl.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "url is required"));
        }

        // Normalize — strip trailing slash
        newUrl = newUrl.trim().replaceAll("/$", "");

        ipWebcamService.setWebcamUrl(newUrl);
        String status = testConnection(newUrl);

        return ResponseEntity.ok(Map.of(
                "url",     newUrl,
                "status",  status,
                "message", "CONNECTED".equals(status)
                        ? "Camera connected successfully"
                        : "URL saved but camera not reachable — check IP and ensure IP Webcam app is running"
        ));
    }

    // Test if camera is reachable right now
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testCamera() {
        String url    = ipWebcamService.getWebcamUrl();
        String status = testConnection(url);
        return ResponseEntity.ok(Map.of(
                "url",    url,
                "status", status,
                "message", "CONNECTED".equals(status)
                        ? "Camera is online and responding"
                        : "Camera not reachable at " + url
        ));
    }

    private String testConnection(String baseUrl) {
        try {
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection)
                    new java.net.URL(baseUrl + "/shot.jpg").openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            return conn.getResponseCode() == 200 ? "CONNECTED" : "OFFLINE";
        } catch (Exception e) {
            return "OFFLINE";
        }
    }
}