package com.example.perfumeshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TonKhoDTO {
    private Long idSanPham;
    private String tenSanPham;
    private Integer soLuongNhap;
    private Integer soLuongBan;
    private Integer tonKho;
    private String tenDanhMuc;
    private String tenthuonghieu;

}
