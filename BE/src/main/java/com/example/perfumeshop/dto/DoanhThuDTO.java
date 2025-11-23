package com.example.perfumeshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class DoanhThuDTO {
    private LocalDate ngay;
    private BigDecimal doanhThu;
    // private String phuongThucTT;
    // private String trangThaiTT;
}
