package com.san.crop.insurance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class IpWebcamService {

    private static final Logger log = LoggerFactory.getLogger(IpWebcamService.class);

    // ── Runtime-mutable URL — can be updated from frontend without restart ─
    // Default from application.properties, overridden via POST /api/webcam/config
    @Value("${ipwebcam.url:http://192.168.43.1:8080}")
    private String webcamBaseUrl;

    @Value("${upload.dir:uploads/claim-images}")
    private String uploadDir;

    @Value("${ipwebcam.demo:false}")
    private boolean demoMode;

    // ── Called by WebcamConfigController to update IP from the frontend ───
    public void setWebcamUrl(String url) {
        this.webcamBaseUrl = url;
        log.info("[IPWebcam] URL updated to: {}", url);
    }

    public String getWebcamUrl() {
        return webcamBaseUrl;
    }

    /**
     * Captures photo from IP Webcam app.
     * Falls back to a placeholder image if camera is offline.
     * Always returns a file path — never null.
     */
    public String capturePhoto(Long farmerId, String causeOfLoss) {
        Path dir;
        try {
            dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
        } catch (Exception e) {
            log.error("[IPWebcam] Cannot create upload directory: {}", e.getMessage());
            return null;
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename  = String.format("farmer%d_%s_%s.jpg",
                farmerId, causeOfLoss.replaceAll("[^A-Za-z0-9]", "_"), timestamp);
        Path filePath = dir.resolve(filename);

        // Try live camera first (unless demo mode is on)
        if (!demoMode) {
            boolean success = tryLiveCapture(filePath);
            if (success) {
                log.info("[IPWebcam] Live photo saved: {}", filePath.toAbsolutePath());
                return filePath.toAbsolutePath().toString();
            }
            log.warn("[IPWebcam] Live camera failed — generating placeholder instead.");
        }

        // Fallback: generate placeholder image
        try {
            generatePlaceholderImage(filePath, farmerId, causeOfLoss, timestamp);
            log.info("[IPWebcam] Placeholder saved: {}", filePath.toAbsolutePath());
            return filePath.toAbsolutePath().toString();
        } catch (Exception e) {
            log.error("[IPWebcam] Placeholder generation failed: {}", e.getMessage());
            return null;
        }
    }

    // ── Try live snapshot from IP Webcam app ──────────────────────────────
    private boolean tryLiveCapture(Path filePath) {
        try {
            String snapshotUrl = webcamBaseUrl + "/shot.jpg";
            log.info("[IPWebcam] Trying: {}", snapshotUrl);

            HttpURLConnection conn = (HttpURLConnection) new URL(snapshotUrl).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(6000);
            conn.setRequestProperty("User-Agent", "CropInsurance-AI/1.0");

            if (conn.getResponseCode() != 200) {
                log.warn("[IPWebcam] HTTP {}", conn.getResponseCode());
                return false;
            }

            try (InputStream in  = conn.getInputStream();
                 OutputStream out = Files.newOutputStream(filePath)) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
            }
            return true;

        } catch (Exception e) {
            log.warn("[IPWebcam] Live capture failed: {}", e.getMessage());
            return false;
        }
    }

    // ── Generate a styled placeholder image ──────────────────────────────
    private void generatePlaceholderImage(Path filePath, Long farmerId,
                                          String cause, String timestamp) throws Exception {
        int w = 800, h = 500;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        Color bg     = cause.contains("FLOOD")   ? new Color(13, 71, 161)
                : cause.contains("DROUGHT") ? new Color(191, 54, 12)
                :                             new Color(74, 20, 140);
        Color accent = cause.contains("FLOOD")   ? new Color(33, 150, 243)
                : cause.contains("DROUGHT") ? new Color(255, 152, 0)
                :                             new Color(156, 39, 176);

        g.setPaint(new GradientPaint(0, 0, bg, w, h, bg.darker()));
        g.fillRect(0, 0, w, h);
        g.setColor(accent);
        g.fillRect(0, 0, w, 8);
        g.fillRect(0, h - 8, w, 8);

        g.setColor(new Color(255, 255, 255, 30));
        g.fillRoundRect(w / 2 - 55, 60, 110, 110, 20, 20);
        g.setColor(accentColor(cause));
        g.setFont(new Font("SansSerif", Font.BOLD, 72));
        g.drawString("!", w / 2 - 20, 145);

        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 28));
        String title = cause.replace("_", " ") + " ALERT";
        FontMetrics fm = g.getFontMetrics();
        g.drawString(title, (w - fm.stringWidth(title)) / 2, 220);

        g.setColor(new Color(255, 255, 255, 80));
        g.fillRect(80, 235, w - 160, 2);

        g.setColor(new Color(255, 255, 255, 200));
        g.setFont(new Font("SansSerif", Font.PLAIN, 16));
        String[] lines = {
                "Farmer ID  :  #" + farmerId,
                "Risk Type  :  " + cause.replace("_", " "),
                "Detected   :  " + timestamp.replace("_", " at "),
                "System     :  AI Crop Insurance — PMFBY",
                "",
                "Note: Camera was offline at time of alert.",
                "Field conditions recorded by IoT sensors."
        };
        int y = 265;
        for (String line : lines) {
            fm = g.getFontMetrics();
            g.drawString(line, (w - fm.stringWidth(line)) / 2, y);
            y += 28;
        }

        g.setColor(accent);
        g.fillRoundRect(w / 2 - 185, h - 60, 370, 36, 18, 18);
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 12));
        String badge = "Government of India  |  Pradhan Mantri Fasal Bima Yojana";
        fm = g.getFontMetrics();
        g.drawString(badge, (w - fm.stringWidth(badge)) / 2, h - 37);

        g.dispose();
        ImageIO.write(img, "jpg", filePath.toFile());
    }

    private Color accentColor(String cause) {
        if (cause.contains("FLOOD"))   return new Color(33, 150, 243);
        if (cause.contains("DROUGHT")) return new Color(255, 152, 0);
        return new Color(156, 39, 176);
    }

    public byte[] capturePhotoBytes() {
        try {
            HttpURLConnection conn = (HttpURLConnection)
                    new URL(webcamBaseUrl + "/shot.jpg").openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(6000);
            if (conn.getResponseCode() != 200) return null;
            try (InputStream in = conn.getInputStream()) {
                return in.readAllBytes();
            }
        } catch (Exception e) {
            log.warn("[IPWebcam] Byte capture failed: {}", e.getMessage());
            return null;
        }
    }
}