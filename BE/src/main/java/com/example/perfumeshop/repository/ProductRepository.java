package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByTrangThai(Boolean trangThai);

    List<Product> findByTenSanPhamContainingIgnoreCase(String keyword);

    // List<Product> findByThuonghieu_Idthuonghieu(Integer brandId);

    // List<Product> findByDanhMuc_IdDanhMuc(Integer categoryId);

    // Lấy theo brandId và trạng thái
    List<Product> findByThuonghieu_IdthuonghieuAndTrangThai(Integer brandId, Boolean trangThai);

    // Lấy theo categoryId và trạng thái
    List<Product> findByDanhMuc_IdDanhMucAndTrangThai(Integer categoryId, Boolean trangThai);

    boolean existsByTenSanPhamIgnoreCase(String tenSanPham);

    boolean existsByDanhMuc_IdDanhMuc(Integer idDanhMuc);

    boolean existsByThuonghieu_Idthuonghieu(Integer idthuonghieu);

    boolean existsByNhaCungCap_IdNcc(Integer idNcc);

}
