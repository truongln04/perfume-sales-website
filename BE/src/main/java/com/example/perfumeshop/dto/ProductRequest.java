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
    private Integer idthuonghieu;
    private Integer idNcc;
    private BigDecimal giaBan;
    private BigDecimal kmPhanTram;
    private Boolean trangThai;
   
    @Builder.Default
    private BigDecimal giaNhap = BigDecimal.ZERO;

    @Builder.Default
    private Integer soLuongTon = 0;

}
