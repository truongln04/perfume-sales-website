package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Orders;
import com.example.perfumeshop.entity.OrdersDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdersDetailRepository extends JpaRepository<OrdersDetail, OrdersDetail.OrdersDetailId> {

    // 📋 Lấy tất cả chi tiết theo đơn hàng
    List<OrdersDetail> findByDonHang(Orders donHang);

    // 🔍 Tìm chi tiết theo id đơn hàng và id sản phẩm
    Optional<OrdersDetail> findByIdDonHangAndIdSanPham(Integer idDonHang, Integer idSanPham);
}