package com.fundspark.controller;

import com.fundspark.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:5173")
public class TestEmailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/email")
    public String sendTestEmail() {
        emailService.sendEmail(
                "test@fundspark.com",                     // any fake email is fine
                "Fundspark test email",
                "If you see this in Mailtrap, SMTP works! 🎉"
        );
        return "Test email sent!";
    }
}
