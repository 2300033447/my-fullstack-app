package com.fundspark.controller;

import com.fundspark.model.User;
import com.fundspark.repository.UserRepository;
import com.fundspark.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // SIGN-UP
    @PostMapping("/signup")
    public String registerUser(@RequestBody User user) {

        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return "Email already registered!";
        }

        userRepository.save(user);

        // ✉️ Send welcome email
        String subject = "Welcome to Fundspark 🎉";
        String body =
                "Hi " + user.getFullName() + ",\n\n" +
                "Your Fundspark account has been created successfully!\n\n" +
                "You can now start fundraisers or support others.\n\n" +
                "Warm regards,\nFundspark Team";

        emailService.sendEmail(user.getEmail(), subject, body);

        return "User registered successfully!";
    }

    // SIGN-IN
    @PostMapping("/signin")
    public String loginUser(@RequestBody User loginRequest) {
        Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());

        if (user.isPresent() && user.get().getPassword().equals(loginRequest.getPassword())) {
            return "Login successful!";
        } else {
            return "Invalid email or password!";
        }
    }

    @GetMapping("/users")
    public Iterable<User> getAllUsers() {
        return userRepository.findAll();
    }
}
