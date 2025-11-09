package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
     @Query("""
        SELECT s FROM Supplier s
        WHERE LOWER(s.tenNcc) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(s.sdt) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Supplier> searchByNameOrPhoneOrEmail(@Param("keyword") String keyword);
    boolean existsByTenNccIgnoreCase(String tenNcc);

    boolean existsBySdt(String sdt);

    boolean existsByEmailIgnoreCase(String email);
}