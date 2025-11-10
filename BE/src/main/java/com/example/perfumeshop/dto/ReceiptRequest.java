package com.example.perfumeshop.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptRequest {
    private Integer idNcc;
    private String ghiChu;
    private List<ReceiptDetailRequest> chiTietPhieuNhap;
}
