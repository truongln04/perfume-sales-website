package com.example.perfumeshop.dto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseResponse {
    private Integer idSanPham;
    private String tenSanPham;
    private Integer soLuongNhap;
    private Integer soLuongBan;
    
}
