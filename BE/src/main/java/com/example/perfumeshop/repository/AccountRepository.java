package com.example.perfumeshop.repository;
import com.example.perfumeshop.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findByEmail(String email);
    List<Account> findByTenHienThiContainingIgnoreCase(String tenHienThi);
    List<Account> findByVaiTro(String vaiTro);
    boolean existsByEmail(String trim);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsBySdt(String sdt);
    Optional<Account> findBySdt(String sdt);
}
