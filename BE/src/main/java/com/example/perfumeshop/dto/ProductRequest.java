package com.example.perfumeshop.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {
    private String tenSanPham;
    private String moTa;
    private String hinhAnh;
    private Integer idDanhMuc;
    private Integer idThuongHieu;
    private BigDecimal giaNhap;
    private BigDecimal giaBan;
    private BigDecimal kmPhanTram;
    private Integer soLuongTon;
    private Boolean trangThai;
}
