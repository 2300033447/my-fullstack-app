package com.fundspark.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.fundspark.model.Donation;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByProjectId(Long projectId);

    // NEW: for recent donors on a single campaign
    List<Donation> findTop5ByProjectIdOrderByCreatedAtDesc(Long projectId);

    // NEW: for global recent activity (if needed later)
    List<Donation> findTop10ByOrderByCreatedAtDesc();
}
