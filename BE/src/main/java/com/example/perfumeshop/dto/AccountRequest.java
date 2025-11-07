package com.example.perfumeshop.dto;
import com.example.perfumeshop.entity.Account.VaiTro;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AccountRequest {
    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email tối đa 100 ký tự")
    private String email;

    @Size(max = 255, message = "Mật khẩu tối đa 255 ký tự")
    private String matKhau; // Chỉ dùng cho local auth

    @Size(min = 3, max = 100, message = "Tên hiển thị phải từ 3 đến 100 ký tự")
    private String tenHienThi;

    @Size(max = 10, message = "Số điện thoại tối đa 10 ký tự")
    private String sdt;

    @Size(max = 255, message = "Google ID tối đa 255 ký tự")
    private String googleId;

    private String anhDaiDien;

    private VaiTro vaiTro; // Admin gán role, client mặc định KHACHHAN
}
