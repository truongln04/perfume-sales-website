package com.example.perfumeshop.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptDetailResponse {
    private Integer idCTPN;
     private Integer idSanPham;
    private String tenSanPham;

    private Integer soLuong;

    private BigDecimal donGia;

}
