package com.example.perfumeshop.service;

import com.example.perfumeshop.config.JwtUtil;
import com.example.perfumeshop.dto.AccountRequest;
import com.example.perfumeshop.dto.AccountResponse;
import com.example.perfumeshop.entity.Account;
import com.example.perfumeshop.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository repository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final Map<String, String> resetCodes = new ConcurrentHashMap<>();

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
        account.setEmail(request.getEmail());
        account.setGoogleId(request.getGoogleId());
        account.setAnhDaiDien(request.getAnhDaiDien());
        // Chỉ cập nhật mật khẩu nếu người dùng nhập mật khẩu mới
        if (request.getMatKhau() != null && !request.getMatKhau().trim().isEmpty()) {
            account.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        }
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
        String token = jwtUtil.generateToken(account);
        System.out.println("JWT Token: " + token); // ✅ Trả về thông tin người dùng kèm token
        AccountResponse response = toResponse(account);
        response.setToken(token);
        return response;
    }

    public AccountResponse createOrUpdateGoogleAccount(AccountRequest request) {
        Optional<Account> existingOpt = repository.findByEmail(request.getEmail());
        Account account;
        if (existingOpt.isPresent()) {
            account = existingOpt.get();
            account.setAnhDaiDien(request.getAnhDaiDien());
            account.setGoogleId(request.getGoogleId());
            account.setTenHienThi(request.getTenHienThi());
        } else {
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

    // ================= Reset Password =================
    public boolean sendVerificationCode(String email) {
        Optional<Account> accountOpt = repository.findByEmail(email);
        if (accountOpt.isEmpty()) return false;

        String code = generateCode();
        resetCodes.put(email, code);

        try {
            mailService.sendSimpleEmail(
                email,
                "Mã xác thực đặt lại mật khẩu",
                "Xin chào " + accountOpt.get().getTenHienThi() + ",\n\n" +
                "Mã xác thực của bạn là: " + code + "\n\n" +
                "Vui lòng không chia sẻ mã này với người khác."
            );
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Xác thực code và reset password
    public boolean verifyCodeAndResetPassword(String email, String code, String newPassword) {
        String validCode = resetCodes.get(email);
        if (validCode != null && validCode.equals(code)) {
            Account account = repository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
            account.setMatKhau(passwordEncoder.encode(newPassword));
            repository.save(account);
            resetCodes.remove(email);
            return true;
        }
        return false;
    }

    // ================= Utility =================
    private String generateCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Tạo mã 6 chữ số
        return String.valueOf(code);
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
                .token(null) // Token chỉ sinh khi login
                .build();
    }
}