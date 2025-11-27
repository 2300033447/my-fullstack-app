package com.fundspark.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                 // turn off CSRF
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()                // allow all requests
            )
            .formLogin(form -> form.disable())            // disable default login form
            .httpBasic(basic -> basic.disable());         // disable basic auth

        return http.build();
    }
}
