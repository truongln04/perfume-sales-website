package com.example.perfumeshop.dto;
import java.math.BigDecimal;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdersDetailRequest {
    private Integer idDonHang;   // khóa ngoại đến Orders
    private Integer idSanPham;   // khóa ngoại đến Product
    private Integer soLuong;
    private BigDecimal donGia;
}
