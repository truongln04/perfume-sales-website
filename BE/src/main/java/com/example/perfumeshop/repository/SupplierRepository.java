package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
     @Query("""
        SELECT s FROM Supplier s
        WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Supplier> searchByNameOrPhoneOrEmail(@Param("keyword") String keyword);
    boolean existsByNameIgnoreCase(String name);

    boolean existsByPhone(String phone);

    boolean existsByEmailIgnoreCase(String email);
}