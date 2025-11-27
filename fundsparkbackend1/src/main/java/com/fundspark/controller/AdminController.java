// src/main/java/com/fundspark/controller/AdminController.java
package com.fundspark.controller;

import com.fundspark.model.Project;
import com.fundspark.repository.ProjectRepository;
import com.fundspark.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmailService emailService;

    // -------- GET: all projects for admin table --------
    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // -------- PUT: verify a project --------
    @PutMapping("/{id}/verify")
    public String verifyProject(@PathVariable Long id) {
        Project project = projectRepository.findById(id).orElse(null);
        if (project == null) {
            return "Project not found";
        }

        project.setVerified(true);
        projectRepository.save(project);

        // ✉️ email to owner if we have their email
        String subject = "Your Fundspark campaign is now verified ✔";
        String body =
                "Hi,\n\n" +
                "Your campaign \"" + safeTitle(project) + "\" has been verified by our team.\n\n" +
                "Verified campaigns appear more trustworthy to donors.\n\n" +
                "Best regards,\nFundspark Team";

        emailService.sendEmail(project.getOwnerEmail(), subject, body);

        return "Project verified";
    }

    // -------- PUT: deactivate a project --------
    @PutMapping("/{id}/deactivate")
    public String deactivateProject(@PathVariable Long id) {
        Project project = projectRepository.findById(id).orElse(null);
        if (project == null) {
            return "Project not found";
        }

        project.setActive(false);
        projectRepository.save(project);

        String subject = "Your Fundspark campaign has been deactivated";
        String body =
                "Hi,\n\n" +
                "Your campaign \"" + safeTitle(project) + "\" has been deactivated by an administrator.\n\n" +
                "If you believe this is a mistake, please contact support.\n\n" +
                "Best regards,\nFundspark Team";

        emailService.sendEmail(project.getOwnerEmail(), subject, body);

        return "Project deactivated";
    }

    // helper so we don't send null titles in mail
    private String safeTitle(Project p) {
        return (p.getTitle() != null && !p.getTitle().isBlank())
                ? p.getTitle()
                : "your campaign";
    }
}
