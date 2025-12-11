package com.example.perfumeshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.perfumeshop.entity.Receipt;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Integer> {
    @Query("""
SELECT r FROM Receipt r
WHERE LOWER(r.ghiChu) LIKE LOWER(CONCAT('%', :keyword, '%'))
   OR CAST(r.ngayNhap AS string) LIKE CONCAT('%', :keyword, '%')
""")
List<Receipt> search(@Param("keyword") String keyword);

    
}
