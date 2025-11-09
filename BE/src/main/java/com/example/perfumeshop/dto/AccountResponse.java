package com.example.perfumeshop.dto;

import com.example.perfumeshop.entity.Account.VaiTro;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {
    private Integer idTaiKhoan;
    private String email;
    private String tenHienThi;
    private String sdt;
    private String googleId;
    private String anhDaiDien;
    private String matKhau;
    private VaiTro vaiTro;
    private String token;
}
