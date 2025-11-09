package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.AccountRequest;
import com.example.perfumeshop.dto.AccountResponse;
import com.example.perfumeshop.dto.LoginRequest;
import com.example.perfumeshop.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AccountService service;

    @PostMapping("/login")
    public AccountResponse login(@RequestBody LoginRequest request) {
        return service.login(request.getEmail(), request.getPassword());
    }

    @PostMapping("/google")
    public ResponseEntity<AccountResponse> createOrUpdateGoogleAccount(@RequestBody AccountRequest request) {
        return ResponseEntity.ok(service.createOrUpdateGoogleAccount(request));
    }

    @PostMapping("/register")
    public AccountResponse register(@Valid @RequestBody AccountRequest request) {
        return service.createAccount(request);
    } 

    @PostMapping("/forgotpassword")
    public ResponseEntity<String> forgotPassword(@RequestParam String email, @RequestParam String newPassword) {
        // Gợi ý: bạn có thể thêm logic gửi email hoặc reset mật khẩu tại đây
        boolean success = service.sendPasswordReset(email, newPassword);
        return success
            ? ResponseEntity.ok("Mật khẩu đã được cập nhật.")
            : ResponseEntity.badRequest().body("Email không tồn tại.");
    }
}