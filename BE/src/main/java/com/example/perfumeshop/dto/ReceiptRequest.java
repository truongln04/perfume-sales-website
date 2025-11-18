package com.example.perfumeshop.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptRequest {
    private Integer idNcc;
    private LocalDate ngayNhap;
    private String ghiChu;
    
    private List<ReceiptDetailRequest> chiTietPhieuNhap;
}
