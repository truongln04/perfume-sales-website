package com.example.perfumeshop.service;

import com.example.perfumeshop.config.JwtUtil;
import com.example.perfumeshop.dto.AccountRequest;
import com.example.perfumeshop.dto.AccountResponse;
import com.example.perfumeshop.entity.Account;
import com.example.perfumeshop.entity.Account.VaiTro;
import com.example.perfumeshop.repository.*;

import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository repository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final OrdersRepository ordersRepository;

    // Regex patterns
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    // SĐT VN 10 số
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0[3|5|7|8|9]\\d{8}$");
    // ít nhất 8 ký tự, có chữ + số
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$");
    private static final Pattern IMG_PATTERN = Pattern.compile("^https?://.+\\.(png|jpe?g|gif|webp|svg)(\\?.*)?$", Pattern.CASE_INSENSITIVE);

    private final Map<String, String> resetCodes = new ConcurrentHashMap<>();

    // ====================== CREATE ACCOUNT ======================
    public AccountResponse createAccount(AccountRequest request) {
        validateCreateRequest(request);

        Account account = Account.builder()
                .email(request.getEmail().toLowerCase().trim())
                .tenHienThi(request.getTenHienThi().trim())
                .sdt(request.getSdt() != null ? request.getSdt().trim() : null)
                .googleId(request.getGoogleId())
                .anhDaiDien(request.getAnhDaiDien())
                .matKhau(passwordEncoder.encode(request.getMatKhau()))
                .vaiTro(request.getVaiTro() != null ? request.getVaiTro() : Account.VaiTro.KHACHHANG)
                .build();

        return toResponse(repository.save(account));
    }

    // ====================== UPDATE ACCOUNT ======================
    public AccountResponse updateAccount(Integer id, AccountRequest request) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        validateUpdateRequest(request, account.getEmail());

        account.setTenHienThi(request.getTenHienThi().trim());
        account.setSdt(request.getSdt() != null ? request.getSdt().trim() : null);
        account.setEmail(request.getEmail().toLowerCase().trim());
        account.setGoogleId(request.getGoogleId());
        account.setAnhDaiDien(request.getAnhDaiDien());

        // Chỉ cập nhật mật khẩu nếu có nhập mới và hợp lệ
        if (request.getMatKhau() != null && !request.getMatKhau().trim().isEmpty()) {
            if (!PASSWORD_PATTERN.matcher(request.getMatKhau()).matches()) {
                throw new ValidationException("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số");
            }
            account.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        }

        if (request.getVaiTro() != null) {
            account.setVaiTro(request.getVaiTro());
        }

        return toResponse(repository.save(account));
    }

    // ====================== LOGIN ======================
    public AccountResponse login(String email, String password) {
        if (email == null || email.trim().isEmpty()) {
            throw new ValidationException("Email không được để trống");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new ValidationException("Mật khẩu không được để trống");
        }

        Account account = repository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ValidationException("Email không tồn tại"));

        if (!passwordEncoder.matches(password, account.getMatKhau())) {
            throw new ValidationException("Sai mật khẩu");
        }

        String token = jwtUtil.generateToken(account);
        System.out.println("JWT Token: " + token);
        AccountResponse response = toResponse(account);
        response.setToken(token);
        return response;
    }

    // ====================== GOOGLE LOGIN ======================
    public AccountResponse createOrUpdateGoogleAccount(AccountRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ValidationException("Email Google không được để trống");
        }
        if (request.getGoogleId() == null || request.getGoogleId().trim().isEmpty()) {
            throw new ValidationException("Google ID không hợp lệ");
        }

        String normalizedEmail = request.getEmail().toLowerCase().trim();

        Optional<Account> existingOpt = repository.findByEmail(normalizedEmail);
        Account account;

        if (existingOpt.isPresent()) {
            account = existingOpt.get();
            // Cập nhật thông tin Google
            account.setGoogleId(request.getGoogleId());
            account.setAnhDaiDien(request.getAnhDaiDien());
            if (request.getTenHienThi() != null && !request.getTenHienThi().trim().isEmpty()) {
                account.setTenHienThi(request.getTenHienThi().trim());
            }
        } else {
            // Tạo mới
            if (request.getTenHienThi() == null || request.getTenHienThi().trim().isEmpty()) {
                throw new ValidationException("Tên hiển thị không được để trống khi tạo tài khoản Google");
            }
            account = Account.builder()
                    .email(normalizedEmail)
                    .tenHienThi(request.getTenHienThi().trim())
                    .sdt(request.getSdt() != null ? request.getSdt().trim() : null)
                    .googleId(request.getGoogleId())
                    .anhDaiDien(request.getAnhDaiDien())
                    .vaiTro(Account.VaiTro.KHACHHANG)
                    .build();
        }

        Account saved = repository.save(account);
        String token = jwtUtil.generateToken(saved);
        System.out.println("JWT Token: " + token);
        AccountResponse response = toResponse(saved);
        response.setToken(token);
        return response;
    }

    // ====================== RESET PASSWORD ======================
    public boolean sendVerificationCode(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new ValidationException("Email không hợp lệ");
        }

        Optional<Account> accountOpt = repository.findByEmail(email.toLowerCase().trim());
        if (accountOpt.isEmpty()) {
            return false; // Không thông báo để tránh leak email
        }

        String code = generateCode();
        resetCodes.put(email.toLowerCase().trim(), code);

        try {
            mailService.sendSimpleEmail(
                    email,
                    "Mã xác thực đặt lại mật khẩu",
                    "Xin chào " + accountOpt.get().getTenHienThi() + ",\n\n" +
                            "Mã xác thực của bạn là: " + code + "\n\n" +
                            "Mã có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này.");
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean verifyCodeAndResetPassword(String email, String code, String newPassword) {
        if (email == null || code == null || newPassword == null) {
            throw new ValidationException("Thông tin không được để trống");
        }
        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            throw new ValidationException("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ cái và số");
        }

        String validCode = resetCodes.get(email.toLowerCase().trim());
        if (validCode == null || !validCode.equals(code)) {
            throw new ValidationException("Mã xác thực không đúng hoặc đã hết hạn");
        }

        Account account = repository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        account.setMatKhau(passwordEncoder.encode(newPassword));
        repository.save(account);
        resetCodes.remove(email.toLowerCase().trim());
        return true;
    }

    // ====================== VALIDATION METHODS ======================
    private void validateCreateRequest(AccountRequest request) {
        // 1. Các trường bắt buộc
        if (request.getTenHienThi() == null || request.getTenHienThi().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên hiển thị");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập email");
        }
        if (request.getSdt() == null || request.getSdt().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập số điện thoại");
        }
        if (request.getMatKhau() == null || request.getMatKhau().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập mật khẩu");
        }

        // 2. Email: định dạng + không trùng
        String email = request.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException("Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: abc@example.com)");
        }
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ValidationException("Email này đã được sử dụng. Vui lòng chọn email khác");
        }

        // 3. Tên hiển thị: độ dài + ký tự hợp lệ
        String tenHienThi = request.getTenHienThi().trim();
        if (tenHienThi.length() < 3 || tenHienThi.length() > 33) {
            throw new ValidationException("Tên hiển thị phải từ 3 đến 33 ký tự");
        }
        if (!tenHienThi.matches("^[a-zA-ZÀ-ỹ\\s0-9]+$")) {
            throw new ValidationException("Tên hiển thị chỉ được chứa chữ cái, số và khoảng trắng");
        }

        // 4. Mật khẩu: dùng đúng PASSWORD_PATTERN đã định nghĩa
        if (!PASSWORD_PATTERN.matcher(request.getMatKhau()).matches()) {
            throw new ValidationException(
                    "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái, số và có thể chứa ký tự đặc biệt");
        }

        // 5. Số điện thoại : nếu nhập thì phải đúng định dạng + không trùng
        String sdt = request.getSdt().trim();
        if (!PHONE_PATTERN.matcher(sdt).matches()) {
            throw new ValidationException("Số điện thoại không hợp lệ. Phải là số Việt Nam 10 chữ số, bắt đầu bằng 0");
        }
        if (repository.existsBySdt(sdt)) {
            throw new ValidationException("Số điện thoại này đã được sử dụng");
        }
    }

    private void validateUpdateRequest(AccountRequest request, String currentEmail) {
        // 1. Email: bắt buộc + định dạng đúng
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập email");
        }
        String newEmail = request.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(newEmail).matches()) {
            throw new ValidationException("Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: abc@example.com)");
        }
        // Chỉ kiểm tra trùng nếu email bị thay đổi
        if (!newEmail.equals(currentEmail) && repository.existsByEmailIgnoreCase(newEmail)) {
            throw new ValidationException("Email này đã được sử dụng bởi tài khoản khác");
        }

        // 2. Tên hiển thị: bắt buộc + độ dài + ký tự hợp lệ (giống create)
        if (request.getTenHienThi() == null || request.getTenHienThi().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên hiển thị");
        }
        String tenHienThi = request.getTenHienThi().trim();
        if (tenHienThi.length() < 3 || tenHienThi.length() > 33) {
            throw new ValidationException("Tên hiển thị phải từ 3 đến 33 ký tự");
        }
        if (!tenHienThi.matches("^[a-zA-ZÀ-ỹ\\s0-9]+$")) {
            throw new ValidationException("Tên hiển thị chỉ được chứa chữ cái, số và khoảng trắng");
        }

        // 3. Số điện thoại: nếu có nhập thì phải đúng định dạng + không trùng với người
        // khác
        if (request.getSdt() != null && !request.getSdt().trim().isEmpty()) {
            String sdt = request.getSdt().trim();
            if (!PHONE_PATTERN.matcher(sdt).matches()) {
                throw new ValidationException(
                        "Số điện thoại không hợp lệ. Phải là số Việt Nam 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09");
            }
            // Kiểm tra trùng: chỉ báo lỗi nếu số điện thoại đã tồn tại và KHÔNG PHẢI của
            // chính tài khoản này
            Optional<Account> existingBySdt = repository.findBySdt(sdt);
            if (existingBySdt.isPresent() && !existingBySdt.get().getEmail().equals(currentEmail)) {
                throw new ValidationException("Số điện thoại này đã được sử dụng bởi tài khoản khác");
            }
        }

        // 4. Mật khẩu: chỉ validate nếu người dùng nhập mới
        if (request.getMatKhau() != null && !request.getMatKhau().trim().isEmpty()) {
            if (!PASSWORD_PATTERN.matcher(request.getMatKhau()).matches()) {
                throw new ValidationException("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số");
            }
        }

        // 5. Ảnh đại diện: tùy chọn, nếu nhập thì phải là URL hợp lệ
        if (request.getAnhDaiDien() != null && !request.getAnhDaiDien().trim().isEmpty()) {
            String avatar = request.getAnhDaiDien().trim();
            if (!IMG_PATTERN.matcher(avatar).matches()) {
                throw new ValidationException("Ảnh đại diện phải là URL hình ảnh hợp lệ");
            }
        }
    }

    // ====================== UTILITIES ======================
    private String generateCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
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
                .vaiTro(account.getVaiTro())
                .token(null)
                .build();
    }

    // Các method còn lại giữ nguyên (getAll, search, delete, v.v.)
    @Transactional
public void deleteAccount(Integer id) {
    Account account = repository.findById(id)
            .orElseThrow(() -> new ValidationException("Tài khoản không tồn tại"));

    // Kiểm tra nếu vai trò là KHACHHANG và đã có đơn hàng
    if (account.getVaiTro() == VaiTro.KHACHHANG
            && ordersRepository.existsByTaiKhoan_IdTaiKhoan(id)) {
        throw new ValidationException("Không thể xóa tài khoản khách hàng vì đã có đơn hàng");
    }

    repository.delete(account);
}



    public List<AccountResponse> getAllAccounts() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AccountResponse> searchAccounts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new ValidationException("Từ khóa tìm kiếm không được để trống");
        }
        return repository.findByTenHienThiContainingIgnoreCase(keyword.trim()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AccountResponse getAccountById(Integer id) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new ValidationException("Không tìm thấy tài khoản với ID: " + id));
        return toResponse(account);
    }

    public AccountResponse getAccountByEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException("Email không hợp lệ");
        }
        Account account = repository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ValidationException("Không tìm thấy tài khoản với email: " + email));
        return toResponse(account);
    }

    public AccountResponse updateAccountByEmail(String email, AccountRequest request) {
        Account account = repository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ValidationException("Không tìm thấy tài khoản"));

        account.setTenHienThi(request.getTenHienThi().trim());
        account.setSdt(request.getSdt() != null ? request.getSdt().trim() : null);
        account.setAnhDaiDien(request.getAnhDaiDien());

        return toResponse(repository.save(account));
    }
}