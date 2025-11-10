package com.example.perfumeshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.perfumeshop.entity.Receipt;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Integer> {
    // Bạn có thể thêm các phương thức tùy chỉnh nếu cần, ví dụ:
    // List<Receipt> findBySupplier_Id(Integer supplierId);
    // List<Receipt> findByReceiptDateBetween(LocalDateTime start, LocalDateTime end);
}
