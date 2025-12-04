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
    private String tenDanhMuc;       
    private Integer idthuonghieu;
    private String tenthuonghieu;
    private Integer idNcc;
    private String tenNcc;
    private BigDecimal giaNhap;
    private BigDecimal giaBan;
    private BigDecimal kmPhanTram;
    private Integer soLuongTon;
    private Boolean trangThai;
    private LocalDateTime ngayTao;
}
