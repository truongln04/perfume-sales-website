package com.example.perfumeshop.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Integer idSanPham;
    private String tenSanPham;
    private String moTa;
    private String hinhAnh;
    private Integer idDanhMuc;
    private Integer idThuongHieu;
    private BigDecimal giaNhap;
    private BigDecimal giaBan;
    private BigDecimal kmPhanTram;
    private BigDecimal giaSauKm;
    private Integer soLuongTon;
    private Boolean trangThai;
    private LocalDateTime ngayTao;
}
