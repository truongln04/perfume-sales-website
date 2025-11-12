package com.example.perfumeshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
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

    // 🔍 Lấy tất cả đơn hàng theo tên người nhận (tìm gần đúng)
    List<Orders> findByHoTenNhanContainingIgnoreCase(String hoTenNhan);

    // 🔍 Lấy tất cả đơn hàng theo số điện thoại người nhận
    List<Orders> findBySdtNhan(String sdtNhan);
}