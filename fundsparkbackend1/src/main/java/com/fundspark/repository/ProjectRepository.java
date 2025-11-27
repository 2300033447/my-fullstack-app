// src/main/java/com/fundspark/repository/ProjectRepository.java
package com.fundspark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fundspark.model.Project;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // only active campaigns (for public listing)
    List<Project> findByActiveTrue();
}
