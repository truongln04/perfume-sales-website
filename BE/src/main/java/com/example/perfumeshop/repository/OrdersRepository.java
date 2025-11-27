package com.example.perfumeshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.perfumeshop.entity.Orders;

import java.util.List;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Integer> {

    // 🔍 Lấy tất cả đơn hàng theo id tài khoản
    List<Orders> findByTaiKhoan_IdTaiKhoan(Integer idTaiKhoan);

    // 🔍 Lấy tất cả đơn hàng theo phương thức thanh toán (COD / ONLINE)
    List<Orders> findByPhuongThucTT(Orders.PaymentMethod phuongThucTT);

    // 🔍 Lấy tất cả đơn hàng theo trạng thái thanh toán
    List<Orders> findByTrangThaiTT(Orders.PaymentStatus trangThaiTT);

    // 🔍 Lấy tất cả đơn hàng theo trạng thái đơn hàng
    List<Orders> findByTrangThai(Orders.OrderStatus trangThai);

    // 🔍 Tìm đơn hàng theo tên người nhận hoặc số điện thoại (tùy tham số nào có)
    @Query("""
        SELECT o FROM Orders o
        WHERE 
            (:hoTenNhan IS NULL OR LOWER(o.hoTenNhan) LIKE LOWER(CONCAT('%', :hoTenNhan, '%')))
        AND 
            (:sdtNhan IS NULL OR o.sdtNhan = :sdtNhan)
        """)
    List<Orders> searchOrders(@Param("hoTenNhan") String hoTenNhan,
                              @Param("sdtNhan") String sdtNhan);

    boolean existsByTaiKhoan_IdTaiKhoan(Integer idTaiKhoan);
}