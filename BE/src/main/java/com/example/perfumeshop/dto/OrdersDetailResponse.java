package com.example.perfumeshop.dto;
import java.math.BigDecimal;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdersDetailResponse {
     private Integer idDonHang;
    private Integer idSanPham;
    private String hinhAnh;
    private String tenSanPham;   // hiển thị tên sản phẩm nếu cần
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
}
