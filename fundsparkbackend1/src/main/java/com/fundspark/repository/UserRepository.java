package com.fundspark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fundspark.model.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 🔍 Custom query method to find user by email
    Optional<User> findByEmail(String email);
}
