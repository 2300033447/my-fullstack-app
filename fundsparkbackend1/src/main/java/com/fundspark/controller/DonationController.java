package com.fundspark.controller;

import com.fundspark.model.Donation;
import com.fundspark.model.Project;
import com.fundspark.repository.DonationRepository;
import com.fundspark.repository.ProjectRepository;
import com.fundspark.service.EmailService;
import com.fundspark.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "http://localhost:5173")
public class DonationController {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ReceiptService receiptService;

    // ⭐ Make a donation to a project
    @PostMapping("/{projectId}")
    public Donation donateToProject(@PathVariable Long projectId,
                                    @RequestBody Donation donationRequest) {

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            throw new RuntimeException("Project not found");
        }

        // Attach project to donation and save
        Donation donation = new Donation();
        donation.setDonorName(donationRequest.getDonorName());
        donation.setAmount(donationRequest.getAmount());
        donation.setProject(project);
        Donation savedDonation = donationRepository.save(donation);

        // Update project's currentAmount
        double newAmount = project.getCurrentAmount() + donationRequest.getAmount();
        project.setCurrentAmount(newAmount);
        projectRepository.save(project);

        // ✉️ EMAIL: notify project owner
        if (project.getOwnerEmail() != null && !project.getOwnerEmail().isBlank()) {
            String subject = "You received a new donation 💜";
            String body =
                    "Hi,\n\n" +
                    "Your campaign \"" + safe(project.getTitle()) + "\" just received a new donation.\n\n" +
                    "Donor: " + donation.getDonorName() + "\n" +
                    "Amount: ₹" + donation.getAmount() + "\n" +
                    "Total raised: ₹" + newAmount + "\n\n" +
                    "Best regards,\nFundspark";

            emailService.sendEmail(project.getOwnerEmail(), subject, body);
        }

        // Return Donation so frontend knows the donation ID
        return savedDonation;
    }

    // ⭐ List donations for a project
    @GetMapping("/project/{projectId}")
    public List<Donation> getDonationsForProject(@PathVariable Long projectId) {
        return donationRepository.findByProjectId(projectId);
    }

    // ⭐ Download PDF receipt
    @GetMapping("/{donationId}/receipt")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long donationId) {
        try {
            Donation donation = donationRepository.findById(donationId).orElse(null);
            if (donation == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] pdfBytes = receiptService.generateDonationReceipt(donation);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename("donation-receipt-" + donationId + ".pdf")
                            .build()
            );

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String safe(String s) {
        return (s == null || s.isBlank()) ? "your campaign" : s;
    }
}
