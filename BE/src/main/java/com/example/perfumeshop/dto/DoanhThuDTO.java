package com.example.perfumeshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class DoanhThuDTO {

    private LocalDate ngay;
    private Long idSanPham;
    private String tenSanPham;

    private Long idDanhMuc;
    private String tenDanhMuc;

    private Long idThuongHieu;
    private String tenThuongHieu;

    private String phuongThucTT;
    private BigDecimal doanhThu;

    // Constructor tổng (không có chi tiết sản phẩm/danh mục/thương hiệu)
    public DoanhThuDTO(LocalDate ngay, BigDecimal doanhThu) {
        this.ngay = ngay;
        this.doanhThu = doanhThu;
    }

    // Constructor chi tiết (có ngày + sản phẩm + danh mục + thương hiệu)
    public DoanhThuDTO(LocalDate ngay, Long idSanPham, String tenSanPham,
                       Long idDanhMuc, String tenDanhMuc,
                       Long idThuongHieu, String tenThuongHieu,
                       String phuongThucTT, BigDecimal doanhThu) {
        this.ngay = ngay;
        this.idSanPham = idSanPham;
        this.tenSanPham = tenSanPham;
        this.idDanhMuc = idDanhMuc;
        this.tenDanhMuc = tenDanhMuc;
        this.idThuongHieu = idThuongHieu;
        this.tenThuongHieu = tenThuongHieu;
        this.phuongThucTT = phuongThucTT;
        this.doanhThu = doanhThu;
    }
}
