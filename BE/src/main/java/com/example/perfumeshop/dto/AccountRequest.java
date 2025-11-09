package com.example.perfumeshop.dto;
import com.example.perfumeshop.entity.Account.VaiTro;
import lombok.Data;

@Data
public class AccountRequest {
    private String email;
    private String matKhau; // Chỉ dùng cho local auth
    private String tenHienThi;
    private String sdt;
    private String googleId;

    private String anhDaiDien;

    private VaiTro vaiTro; // Admin gán role, client mặc định KHACHHAN
}