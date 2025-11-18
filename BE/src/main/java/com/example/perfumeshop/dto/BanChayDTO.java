package com.example.perfumeshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BanChayDTO {
    private Long idSanPham;
    private String tenSanPham;
    private Long tongBan;
    private BigDecimal doanhThu;
}
