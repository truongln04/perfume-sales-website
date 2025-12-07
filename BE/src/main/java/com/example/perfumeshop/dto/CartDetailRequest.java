package com.example.perfumeshop.dto;
import lombok.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDetailRequest {
    private Integer idSanPham;       
    private Integer soLuong;
    private Long donGia;
}
