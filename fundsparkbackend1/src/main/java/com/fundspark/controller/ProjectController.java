package com.fundspark.controller;

import com.fundspark.model.Project;
import com.fundspark.repository.ProjectRepository;
import com.fundspark.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {

        // Default values for new fields
        project.setActive(true);
        project.setVerified(false);

        Project saved = projectRepository.save(project);

        // ✉️ Email the owner if email exists
        if (project.getOwnerEmail() != null) {

            String subject = "Your Fundspark Campaign Has Been Created 🚀";
            String body =
                    "Hi,\n\n" +
                    "Your campaign \"" + safe(project.getTitle()) + "\" has been successfully created!\n\n" +
                    "You can now start sharing it with others.\n\n" +
                    "Warm regards,\nFundspark Team";

            emailService.sendEmail(project.getOwnerEmail(), subject, body);
        }

        return saved;
    }

    private String safe(String s) {
        return (s == null || s.isBlank()) ? "Untitled Campaign" : s;
    }
}
