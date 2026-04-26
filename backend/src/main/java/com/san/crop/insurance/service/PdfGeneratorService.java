package com.san.crop.insurance.service;

import com.san.crop.insurance.model.Claim;
import com.san.crop.insurance.model.Farmer;
import com.san.crop.insurance.model.InsurancePolicy;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    // PDFBox 3.x FIX: fonts must be instantiated — PDType1Font.HELVETICA no longer exists
    private static final PDType1Font BOLD   = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDType1Font NORMAL = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

    public String generateClaimPdf(Claim claim) {

        String folderPath = "generated_pdfs";
        new File(folderPath).mkdirs();

        String fileName = "claim_" + claim.getId() + ".pdf";
        String filePath = folderPath + "/" + fileName;

        try (PDDocument document = new PDDocument()) {

            // ── PAGE 1: Claim Details ──────────────────────────────────
            PDPage page1 = new PDPage(PDRectangle.A4);
            document.addPage(page1);

            float pageWidth  = page1.getMediaBox().getWidth();
            float pageHeight = page1.getMediaBox().getHeight();
            float margin     = 50f;
            float yPos       = pageHeight - margin;

            PDPageContentStream cs = new PDPageContentStream(document, page1);

            // Green header bar
            cs.setNonStrokingColor(26f / 255f, 94f / 255f, 55f / 255f);
            cs.addRect(0, pageHeight - 75, pageWidth, 75);
            cs.fill();

            cs.beginText();
            cs.setFont(BOLD, 16);
            cs.setNonStrokingColor(1f, 1f, 1f);
            cs.newLineAtOffset(margin, pageHeight - 38);
            cs.showText("Government of India - PMFBY");
            cs.endText();

            cs.beginText();
            cs.setFont(BOLD, 11);
            cs.setNonStrokingColor(1f, 1f, 1f);
            cs.newLineAtOffset(margin, pageHeight - 58);
            cs.showText("Pradhan Mantri Fasal Bima Yojana - Crop Insurance Claim Report");
            cs.endText();

            yPos = pageHeight - 90;

            InsurancePolicy policy = claim.getInsurancePolicy();
            Farmer farmer = policy != null ? policy.getFarmer() : null;

            // Farmer Details
            yPos = drawSectionHeader(cs, "Farmer Details", margin, yPos, pageWidth);
            if (farmer != null) {
                yPos = drawRow(cs, "Name",     farmer.getName(),     margin, yPos);
                yPos = drawRow(cs, "District", farmer.getDistrict(), margin, yPos);
                yPos = drawRow(cs, "Village",  farmer.getVillage(),  margin, yPos);
            } else {
                yPos = drawRow(cs, "Farmer", "Information not available", margin, yPos);
            }
            yPos -= 10;

            // Policy Details
            yPos = drawSectionHeader(cs, "Policy Details", margin, yPos, pageWidth);
            if (policy != null) {
                yPos = drawRow(cs, "Policy Number", policy.getPolicyNumber(),        margin, yPos);
                yPos = drawRow(cs, "Crop Type",     policy.getCropType(),            margin, yPos);
                yPos = drawRow(cs, "Sum Insured",   "Rs. " + policy.getSumInsured(), margin, yPos);
            } else {
                yPos = drawRow(cs, "Policy", "Information not available", margin, yPos);
            }
            yPos -= 10;

            // Claim Details
            yPos = drawSectionHeader(cs, "Claim Details", margin, yPos, pageWidth);
            yPos = drawRow(cs, "Claim ID",         "#" + claim.getId(),                                         margin, yPos);
            yPos = drawRow(cs, "Cause of Loss",    safe(claim.getCauseOfLoss()),                                margin, yPos);
            yPos = drawRow(cs, "Detection Source", safe(claim.getDetectionSource()),                            margin, yPos);
            yPos = drawRow(cs, "Severity",         safe(claim.getSeverity()),                                   margin, yPos);
            yPos = drawRow(cs, "Wetness Index",    safeDouble(claim.getWetnessIndex()),                         margin, yPos);
            yPos = drawRow(cs, "Fraud Score",      String.valueOf(claim.getFraudScore()),                       margin, yPos);
            yPos = drawRow(cs, "Status",           claim.getStatus() != null ? claim.getStatus().name() : "-", margin, yPos);
            yPos = drawRow(cs, "Claim Amount",     "Rs. " + safeDouble(claim.getClaimAmount()),                 margin, yPos);
            yPos -= 10;

            // AI Disease Analysis
            yPos = drawSectionHeader(cs, "AI Disease Analysis", margin, yPos, pageWidth);
            yPos = drawRow(cs, "Detected Disease",   safe(claim.getDetectedDisease()),       margin, yPos);
            yPos = drawRow(cs, "Confidence Score",   safeDouble(claim.getConfidenceScore()), margin, yPos);
            yPos = drawRow(cs, "Recommended Remedy", safe(claim.getRecommendedRemedy()),     margin, yPos);
            yPos -= 15;

            boolean hasPhoto = claim.getPhotoPath() != null
                    && new File(claim.getPhotoPath()).exists();

            if (hasPhoto) {
                yPos = drawSectionHeader(cs, "Field Photo (see next page)", margin, yPos, pageWidth);
            }

            drawFooter(cs, pageWidth,
                    "Generated: " + LocalDateTime.now()
                            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            cs.close();

            // ── PAGE 2: Field Photo ────────────────────────────────────
            if (hasPhoto) {
                try {
                    PDImageXObject photo = PDImageXObject.createFromFile(claim.getPhotoPath(), document);

                    PDPage photoPage = new PDPage(PDRectangle.A4);
                    document.addPage(photoPage);

                    float pw = photoPage.getMediaBox().getWidth();
                    float ph = photoPage.getMediaBox().getHeight();

                    PDPageContentStream photoCs = new PDPageContentStream(document, photoPage);

                    photoCs.setNonStrokingColor(26f / 255f, 94f / 255f, 55f / 255f);
                    photoCs.addRect(0, ph - 55, pw, 55);
                    photoCs.fill();

                    photoCs.beginText();
                    photoCs.setFont(BOLD, 13);
                    photoCs.setNonStrokingColor(1f, 1f, 1f);
                    photoCs.newLineAtOffset(margin, ph - 35);
                    photoCs.showText("Field Photo Evidence - Claim #" + claim.getId());
                    photoCs.endText();

                    float maxW  = pw - 2 * margin;
                    float maxH  = ph - 160f;
                    float scale = Math.min(maxW / photo.getWidth(), maxH / photo.getHeight());
                    float drawW = photo.getWidth()  * scale;
                    float drawH = photo.getHeight() * scale;
                    float xOff  = margin + (maxW - drawW) / 2f;
                    float yOff  = (ph - 55 - margin) - drawH;

                    photoCs.drawImage(photo, xOff, yOff, drawW, drawH);

                    photoCs.beginText();
                    photoCs.setFont(NORMAL, 9);
                    photoCs.setNonStrokingColor(0.4f, 0.4f, 0.4f);
                    photoCs.newLineAtOffset(margin, yOff - 18);
                    photoCs.showText("Auto-captured from IP Webcam on sensor alert  |  "
                            + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                            + "  |  Cause: " + safe(claim.getCauseOfLoss()));
                    photoCs.endText();

                    photoCs.beginText();
                    photoCs.setFont(NORMAL, 8);
                    photoCs.setNonStrokingColor(0.6f, 0.6f, 0.6f);
                    photoCs.newLineAtOffset(margin, yOff - 30);
                    photoCs.showText("File: " + new File(claim.getPhotoPath()).getName());
                    photoCs.endText();

                    drawFooter(photoCs, pw, "AI Crop Insurance System  |  PMFBY  |  Government of India");
                    photoCs.close();

                } catch (Exception photoEx) {
                    PDPage notePage = new PDPage(PDRectangle.A4);
                    document.addPage(notePage);
                    PDPageContentStream noteCs = new PDPageContentStream(document, notePage);
                    noteCs.beginText();
                    noteCs.setFont(NORMAL, 11);
                    noteCs.setNonStrokingColor(0.3f, 0.3f, 0.3f);
                    noteCs.newLineAtOffset(50, 700);
                    noteCs.showText("Field photo could not be embedded: " + photoEx.getMessage());
                    noteCs.endText();
                    noteCs.close();
                }

            } else if (claim.getPhotoPath() != null) {
                PDPage notePage = new PDPage(PDRectangle.A4);
                document.addPage(notePage);
                PDPageContentStream noteCs = new PDPageContentStream(document, notePage);
                noteCs.beginText();
                noteCs.setFont(NORMAL, 11);
                noteCs.setNonStrokingColor(0.4f, 0.4f, 0.4f);
                noteCs.newLineAtOffset(50, 700);
                noteCs.showText("Field photo: File not found on server - camera may have been offline.");
                noteCs.endText();
                noteCs.close();
            }

            document.save(filePath);

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate claim PDF", e);
        }

        return new File(filePath).getAbsolutePath();
    }

    // ── Green section header bar ───────────────────────────────────────────
    private float drawSectionHeader(PDPageContentStream cs, String title,
                                    float x, float yPos, float pageWidth) throws IOException {
        cs.setNonStrokingColor(0.18f, 0.42f, 0.25f);
        cs.addRect(x - 5, yPos - 16, pageWidth - 2 * x + 10, 20);
        cs.fill();

        cs.beginText();
        cs.setFont(BOLD, 11);
        cs.setNonStrokingColor(1f, 1f, 1f);
        cs.newLineAtOffset(x, yPos - 12);
        cs.showText(title);
        cs.endText();

        return yPos - 28;
    }

    // ── Label: Value row ──────────────────────────────────────────────────
    private float drawRow(PDPageContentStream cs, String label, String value,
                          float x, float yPos) throws IOException {
        cs.beginText();
        cs.setFont(BOLD, 10);
        cs.setNonStrokingColor(0.18f, 0.36f, 0.22f);
        cs.newLineAtOffset(x + 10, yPos);
        cs.showText(label + ":");
        cs.endText();

        cs.beginText();
        cs.setFont(NORMAL, 10);
        cs.setNonStrokingColor(0.1f, 0.1f, 0.1f);
        cs.newLineAtOffset(x + 160, yPos);
        cs.showText(value != null ? value : "-");
        cs.endText();

        return yPos - 18;
    }

    // ── Green footer bar ───────────────────────────────────────────────────
    private void drawFooter(PDPageContentStream cs, float pageWidth, String text) throws IOException {
        cs.setNonStrokingColor(26f / 255f, 94f / 255f, 55f / 255f);
        cs.addRect(0, 0, pageWidth, 30);
        cs.fill();

        cs.beginText();
        cs.setFont(NORMAL, 8);
        cs.setNonStrokingColor(1f, 1f, 1f);
        cs.newLineAtOffset(50, 10);
        cs.showText(text);
        cs.endText();
    }

    // ── Null-safe helpers ──────────────────────────────────────────────────
    private String safe(String value) {
        return value == null ? "-" : value;
    }

    private String safeDouble(Double value) {
        return value == null ? "-" : String.valueOf(value);
    }

    private String safeDouble(double value) {
        return String.valueOf(value);
    }
}