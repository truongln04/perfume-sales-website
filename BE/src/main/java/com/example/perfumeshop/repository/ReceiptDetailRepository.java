package com.example.perfumeshop.repository;
import com.example.perfumeshop.entity.*;
import com.example.perfumeshop.entity.ReceiptDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceiptDetailRepository extends JpaRepository<ReceiptDetail, Integer> {
     boolean existsBySanPham(Product sanPham);
}
