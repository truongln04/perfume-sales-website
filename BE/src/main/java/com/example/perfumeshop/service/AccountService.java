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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository repository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;


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
        account.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
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
    public boolean resetPasswordByEmail(String email) {
    Optional<Account> accountOpt = repository.findByEmail(email);
    if (accountOpt.isEmpty()) {
        System.err.println("⚠️ Không tìm thấy tài khoản với email: " + email);
        return false;
    }

    Account account = accountOpt.get();

    try {
        // ✅ Tạo mật khẩu mạnh ngẫu nhiên (10 ký tự)
        String newPassword = generateRandomPassword(10);

        // ✅ Mã hóa và lưu vào DB
        account.setMatKhau(passwordEncoder.encode(newPassword));
        repository.save(account);

        // ✅ Soạn nội dung email
        String subject = "🔐 Mật khẩu mới của bạn - PerfumeShop";
        String body = String.format(
                "Xin chào %s,\n\n" +
                "Hệ thống đã đặt lại mật khẩu cho bạn.\n\n" +
                "🔑 Mật khẩu mới của bạn là: %s\n\n" +
                "👉 Vui lòng đăng nhập và đổi lại mật khẩu ngay sau khi vào hệ thống.\n\n" +
                "Trân trọng,\nĐội ngũ hỗ trợ PerfumeShop",
                account.getTenHienThi(), newPassword
        );

        // ✅ Gửi email thông báo
        mailService.sendSimpleEmail(email, subject, body);
        System.out.println("✅ Đã gửi mật khẩu mới tới email: " + email);
        return true;

    } catch (Exception e) {
        System.err.println("❌ Lỗi khi gửi mật khẩu mới tới email " + email + ": " + e.getMessage());
        e.printStackTrace();
        return false;
    }
}

// ================= Utility =================
private String generateRandomPassword(int length) {
    if (length < 8) {
        throw new IllegalArgumentException("Mật khẩu phải có ít nhất 8 ký tự");
    }

    String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    String lower = "abcdefghijklmnopqrstuvwxyz";
    String digits = "0123456789";
    String special = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    String allChars = upper + lower + digits + special;

    StringBuilder password = new StringBuilder();
    Random random = new Random();

    // Đảm bảo có ít nhất 1 ký tự của mỗi loại
    password.append(upper.charAt(random.nextInt(upper.length())));
    password.append(lower.charAt(random.nextInt(lower.length())));
    password.append(digits.charAt(random.nextInt(digits.length())));
    password.append(special.charAt(random.nextInt(special.length())));

    // Thêm các ký tự ngẫu nhiên còn lại
    for (int i = 4; i < length; i++) {
        password.append(allChars.charAt(random.nextInt(allChars.length())));
    }

    // Trộn ngẫu nhiên thứ tự ký tự trong mật khẩu
    List<Character> passwordChars = password.chars()
            .mapToObj(c -> (char) c)
            .collect(Collectors.toList());
    Collections.shuffle(passwordChars);

    StringBuilder finalPassword = new StringBuilder();
    for (char c : passwordChars) {
        finalPassword.append(c);
    }

    return finalPassword.toString();
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