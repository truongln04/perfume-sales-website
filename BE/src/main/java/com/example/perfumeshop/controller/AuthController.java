package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.AccountRequest;
import com.example.perfumeshop.dto.AccountResponse;
import com.example.perfumeshop.dto.GoogleLoginRequest;
import com.example.perfumeshop.dto.LoginRequest;
import com.example.perfumeshop.service.AccountService;
import com.example.perfumeshop.service.GoogleAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AccountService service;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/login")
    public AccountResponse login(@RequestBody LoginRequest request) {
        return service.login(request.getEmail(), request.getPassword());
    }

    @PostMapping("/google")
public ResponseEntity<AccountResponse> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
    try {
        var payload = googleAuthService.verifyGoogleToken(request.getCredential());

        AccountRequest accRequest = new AccountRequest();
        accRequest.setEmail(payload.getEmail());
        accRequest.setTenHienThi((String) payload.get("name"));
        accRequest.setAnhDaiDien((String) payload.get("picture"));
        accRequest.setGoogleId(payload.getSubject());
        accRequest.setSdt("");

        // ✅ Service đã trả về AccountResponse kèm token
        AccountResponse response = service.createOrUpdateGoogleAccount(accRequest);
        return ResponseEntity.ok(response);

    } catch (Exception e) {
        return ResponseEntity.badRequest().body(null);
    }
}

    @PostMapping("/register")
    public AccountResponse register(@Valid @RequestBody AccountRequest request) {
        return service.createAccount(request);
    } 

    // Gửi mã reset
    @PostMapping("/send-reset-code")
    public ResponseEntity<String> sendResetCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        boolean sent = service.sendVerificationCode(email);
        return sent ? ResponseEntity.ok("Mã xác thực đã được gửi đến email.")
                    : ResponseEntity.badRequest().body("Email không tồn tại.");
    }

    // Reset password
    @PostMapping("/confirm-reset")
    public ResponseEntity<String> confirmResetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");
        String newPassword = payload.get("newPassword");

        boolean success = service.verifyCodeAndResetPassword(email, code, newPassword);
        return success ? ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.")
                       : ResponseEntity.badRequest().body("Mã xác thực không hợp lệ hoặc đã hết hạn.");
    }

    @GetMapping("/me")
public ResponseEntity<AccountResponse> getCurrentUser(@AuthenticationPrincipal String email) {
    AccountResponse account = service.getAccountByEmail(email);
    return ResponseEntity.ok(account);
}

    @PutMapping("/me")
public ResponseEntity<AccountResponse> updateCurrentUser(
        @AuthenticationPrincipal String email,
        @RequestBody AccountRequest request
) {
    AccountResponse updated = service.updateAccountByEmail(email, request);
    return ResponseEntity.ok(updated);
}

}