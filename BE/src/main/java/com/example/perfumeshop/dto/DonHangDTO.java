package com.example.perfumeshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DonHangDTO {
    private String trangThai;
    private Long soLuong;
    private BigDecimal tongTien;
}
