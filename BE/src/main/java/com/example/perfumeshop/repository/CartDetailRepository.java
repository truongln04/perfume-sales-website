package com.example.perfumeshop.repository;
import com.example.perfumeshop.entity.Cart;
import com.example.perfumeshop.entity.CartDetail;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
@Transactional
public interface CartDetailRepository extends JpaRepository<CartDetail, Integer>{
 // Tìm chi tiết giỏ hàng theo id giỏ hàng và id sản phẩm
    CartDetail findByCart_IdGhAndSanPham_IdSanPham(Integer idGh, Integer idSanPham);
    @Modifying
    @Query("DELETE FROM CartDetail c WHERE c.cart = :cart")
    void deleteByCart(@Param("cart") Cart cart);
}
