package com.example.perfumeshop.dto;
import java.math.BigDecimal;
import java.util.List;

import com.example.perfumeshop.entity.Orders.PaymentMethod;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdersRequest {
    private Integer idTaiKhoan;       // id_tai_khoan (foreign key)
    private BigDecimal tongTien;      // tổng tiền đơn hàng
    private PaymentMethod phuongThucTT; // COD / ONLINE

    private String hoTenNhan;
    private String sdtNhan;
    private String diaChiGiao;
    private String ghiChu;
    private List<OrdersDetailRequest> chiTietDonHang;
}
