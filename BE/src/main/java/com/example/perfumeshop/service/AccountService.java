package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.AccountRequest;
import com.example.perfumeshop.dto.AccountResponse;
import com.example.perfumeshop.entity.Account;
import com.example.perfumeshop.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {
     private final AccountRepository repository;

    public AccountResponse createAccount(AccountRequest request) {
        Account account = Account.builder()
                .email(request.getEmail())
                .tenHienThi(request.getTenHienThi())
                .sdt(request.getSdt())
                .googleId(request.getGoogleId())
                .anhDaiDien(request.getAnhDaiDien())
                .matKhau(request.getMatKhau())
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
        account.setMatKhau(request.getMatKhau());
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
        if (!account.getMatKhau().equals(password)) {
            throw new RuntimeException("Sai mật khẩu");
        }
        return toResponse(account);
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
                .build();
    }
    
}