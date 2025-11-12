package com.example.perfumeshop.dto;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.example.perfumeshop.entity.Orders.OrderStatus;
import com.example.perfumeshop.entity.Orders.PaymentMethod;
import com.example.perfumeshop.entity.Orders.PaymentStatus;
import lombok.*;

@Data
@NoArgsConstructor  
@AllArgsConstructor
@Builder
public class OrdersResponse {
    private Integer id;
    private Integer idTaiKhoan;
    private LocalDateTime ngayDat;
    private BigDecimal tongTien;

    private PaymentMethod phuongThucTT;
    private PaymentStatus trangThaiTT;
    private OrderStatus trangThai;

    private String hoTenNhan;
    private String sdtNhan;
    private String diaChiGiao;
    private String ghiChu;

    // Nếu bạn muốn trả thêm chi tiết đơn hàng:
    private List<OrdersDetailResponse> chiTietDonHang;
}
