package com.example.perfumeshop.dto;
import lombok.*;
@Data
@NoArgsConstructor
@AllArgsConstructor

public class CartDetailResponse {
    private Integer idCtgh;
    private Integer idSanPham;
    private String tenSanPham;   // thêm field này
    private String hinhAnh;  // thêm field này
    private Integer soLuong;
    private Long donGia;
}
