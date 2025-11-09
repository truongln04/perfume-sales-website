package com.example.perfumeshop.service;

import com.example.perfumeshop.config.JwtUtil;
import com.example.perfumeshop.dto.AccountRequest;
import com.example.perfumeshop.dto.AccountResponse;
import com.example.perfumeshop.entity.Account;
import com.example.perfumeshop.repository.AccountRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {
     private final AccountRepository repository;
     private final JwtUtil jwtUtil;
     private final PasswordEncoder passwordEncoder;

    public AccountResponse createAccount(AccountRequest request) {
        Account account = Account.builder()
                .email(request.getEmail())
                .tenHienThi(request.getTenHienThi())
                .sdt(request.getSdt())
                .googleId(request.getGoogleId())
                .anhDaiDien(request.getAnhDaiDien())
                .matKhau(passwordEncoder.encode(request.getMatKhau()))
                .vaiTro(request.getVaiTro() != null ? request.getVaiTro() : Account.VaiTro.KHACHHANG)
                .build();
        return toResponse(repository.save(account));
    }

    public AccountResponse updateAccount(Integer id, AccountRequest request) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        account.setTenHienThi(request.getTenHienThi());
        account.setSdt(request.getSdt());
        account.setGoogleId(request.getGoogleId());
        account.setAnhDaiDien(request.getAnhDaiDien());
        account.setVaiTro(request.getVaiTro());
        return toResponse(repository.save(account));
    }

    public void deleteAccount(Integer id) {
        repository.deleteById(id);
    }

    public List<AccountResponse> getAllAccounts() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AccountResponse> searchAccounts(String keyword) {
        return repository.findByTenHienThiContainingIgnoreCase(keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AccountResponse getAccountById(Integer id) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        return toResponse(account);
    }

    public AccountResponse login(String email, String password) {
        Account account = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        if (!passwordEncoder.matches(password, account.getMatKhau())) {
            throw new RuntimeException("Sai mật khẩu");
        }
    // ✅ Sinh JWT token
    String token = jwtUtil.generateToken(account);
    System.out.println("🔐 JWT Token: " + token);

    // ✅ Trả về thông tin người dùng kèm token
    AccountResponse response = toResponse(account);
    response.setToken(token);
    return response;
    }

    public AccountResponse createOrUpdateGoogleAccount(AccountRequest request) {
        Optional<Account> existingOpt = repository.findByEmail(request.getEmail());
        Account account;

        if (existingOpt.isPresent()) {
            // Nếu đã tồn tại → cập nhật thông tin
            account = existingOpt.get();
            account.setAnhDaiDien(request.getAnhDaiDien());
            account.setGoogleId(request.getGoogleId());
            account.setTenHienThi(request.getTenHienThi());
        } else {
            // Nếu chưa có → tạo mới tài khoản khách hàng
            account = Account.builder()
                    .email(request.getEmail())
                    .tenHienThi(request.getTenHienThi())
                    .sdt(request.getSdt())
                    .googleId(request.getGoogleId())
                    .anhDaiDien(request.getAnhDaiDien())
                    .vaiTro(Account.VaiTro.KHACHHANG)
                    .build();
        }

        Account saved = repository.save(account);
        return toResponse(saved);
    }

    public boolean sendPasswordReset(String email, String newPassword) {
    Optional<Account> accountOpt = repository.findByEmail(email);
    if (accountOpt.isPresent()) {
        Account account = accountOpt.get();
        // Mã hóa mật khẩu mới trước khi lưu
        account.setMatKhau(passwordEncoder.encode(newPassword));
        repository.save(account);
        return true;
    }
    return false;
    }


    private AccountResponse toResponse(Account account) {
        return AccountResponse.builder()
                .idTaiKhoan(account.getIdTaiKhoan())
                .email(account.getEmail())
                .tenHienThi(account.getTenHienThi())
                .sdt(account.getSdt())
                .googleId(account.getGoogleId())
                .anhDaiDien(account.getAnhDaiDien())
                .matKhau(account.getMatKhau())
                .vaiTro(account.getVaiTro())
                .build();
    }
    
}