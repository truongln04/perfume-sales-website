package com.example.perfumeshop.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptDetailRequest {
    private Integer idSanPham;

    private Integer soLuong;

    private BigDecimal donGia;
}
