package com.example.perfumeshop.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptResponse {

    private Integer idPhieuNhap;

    private LocalDateTime ngayNhap;

    private BigDecimal tongTien;

    private String ghiChu;
    
    private List<ReceiptDetailResponse> chiTietPhieuNhap;
}
