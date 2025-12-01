package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.*;
import com.example.perfumeshop.entity.OrdersDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdersDetailRepository extends JpaRepository<OrdersDetail, Integer> {

    // 📋 Lấy tất cả chi tiết theo đơn hàng
    List<OrdersDetail> findByDonHang(Orders donHang);
 boolean existsBySanPham(Product sanPham);
    // 🔍 Tìm chi tiết theo id đơn hàng và id sản phẩm
    
}