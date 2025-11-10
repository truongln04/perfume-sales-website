package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.ReceiptDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceiptDetailRepository extends JpaRepository<ReceiptDetail, Integer> {
    // Bạn có thể thêm các phương thức tùy chỉnh nếu cần, ví dụ:
    // List<ReceiptDetail> findByReceipt_ReceiptId(Integer receiptId);
}
