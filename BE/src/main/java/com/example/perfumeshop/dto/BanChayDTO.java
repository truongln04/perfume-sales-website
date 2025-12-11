package com.example.perfumeshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor

public class BanChayDTO {

    private LocalDate ngay;
    private Long idSanPham;
    private String tenSanPham;
    private Long tongBan;
    private BigDecimal doanhThu;
    private String tenDanhMuc;
    private String tenthuonghieu;

// Constructor tổng (không có ngày)
    public BanChayDTO(long idSanPham, String tenSanPham, long tongBan,
                      BigDecimal doanhThu, String tenDanhMuc, String tenthuonghieu) {
        this.idSanPham = idSanPham;
        this.tenSanPham = tenSanPham;
        this.tongBan = tongBan;
        this.doanhThu = doanhThu;
        this.tenDanhMuc = tenDanhMuc;
        this.tenthuonghieu = tenthuonghieu;
    }

    // Constructor chi tiết (có ngày)
    public BanChayDTO(LocalDate ngay, long idSanPham, String tenSanPham, long tongBan,
                      BigDecimal doanhThu, String tenDanhMuc, String tenthuonghieu) {
        this.ngay = ngay;
        this.idSanPham = idSanPham;
        this.tenSanPham = tenSanPham;
        this.tongBan = tongBan;
        this.doanhThu = doanhThu;
        this.tenDanhMuc = tenDanhMuc;
        this.tenthuonghieu = tenthuonghieu;
    }
    }