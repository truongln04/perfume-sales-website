package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    List<Supplier> findByNameContainingIgnoreCase(String keyword);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByPhone(String phone);

    boolean existsByEmailIgnoreCase(String email);
}