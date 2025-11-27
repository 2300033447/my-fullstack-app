package com.fundspark.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String donorName;
    private double amount;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    // NEW: when donation was made
    private LocalDateTime createdAt = LocalDateTime.now();

    public Donation() {}

    public Donation(String donorName, double amount, Project project) {
        this.donorName = donorName;
        this.amount = amount;
        this.project = project;
    }

    public Long getId() { return id; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
