package com.example.perfumeshop.repository;
import org.springframework.data.domain.Pageable;

import com.example.perfumeshop.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface StatisticalRepository extends JpaRepository<Orders, Integer> {

    @Query(value = """
        SELECT DATE(dh.ngay_dat) AS ngay,
               SUM(dh.tong_tien) AS doanhThu
        FROM don_hang dh
        WHERE dh.trang_thai = 'HOAN_THANH'
          AND (:fromDate IS NULL OR dh.ngay_dat >= :fromDate)
          AND (:toDate IS NULL OR dh.ngay_dat <= :toDate)
        GROUP BY DATE(dh.ngay_dat)
        ORDER BY DATE(dh.ngay_dat)
    """, nativeQuery = true)
    List<Map<String,Object>> revenueByDay(String fromDate, String toDate);

    @Query(value = """
        SELECT sp.ten_san_pham AS tenSanPham,
               SUM(ctdh.so_luong * ctdh.don_gia) AS doanhThuSP
        FROM chi_tiet_don_hang ctdh
        JOIN don_hang dh ON dh.id_don_hang = ctdh.id_don_hang
        JOIN san_pham sp ON sp.id_san_pham = ctdh.id_san_pham
        WHERE dh.trang_thai = 'HOAN_THANH'
          AND (:fromDate IS NULL OR dh.ngay_dat >= :fromDate)
          AND (:toDate IS NULL OR dh.ngay_dat <= :toDate)
        GROUP BY sp.id_san_pham, sp.ten_san_pham
        ORDER BY doanhThuSP DESC
    """, nativeQuery = true)
    List<Map<String,Object>> revenueByProduct(String fromDate, String toDate);

   @Query(value = """
    SELECT sp.ten_san_pham AS tenSanPham,
           SUM(ctdh.so_luong) AS soLuongBan,
           SUM(ctdh.so_luong * ctdh.don_gia) AS doanhThuSP
    FROM chi_tiet_don_hang ctdh
    JOIN don_hang dh ON dh.id_don_hang = ctdh.id_don_hang
    JOIN san_pham sp ON sp.id_san_pham = ctdh.id_san_pham
    WHERE dh.trang_thai = 'HOAN_THANH'
      AND (:fromDate IS NULL OR dh.ngay_dat >= :fromDate)
      AND (:toDate IS NULL OR dh.ngay_dat <= :toDate)
    GROUP BY sp.id_san_pham, sp.ten_san_pham
    ORDER BY soLuongBan DESC
""", nativeQuery = true)
List<Map<String,Object>> topSellingProducts(String fromDate, String toDate, Pageable pageable);


    @Query(value = """
        SELECT sp.ten_san_pham AS tenSanPham,
               COALESCE(SUM(ctpn.so_luong),0) AS nhap,
               COALESCE(SUM(ctdh.so_luong),0) AS xuat,
               COALESCE(SUM(ctpn.so_luong),0) - COALESCE(SUM(ctdh.so_luong),0) AS ton
        FROM san_pham sp
        LEFT JOIN chi_tiet_phieu_nhap ctpn ON ctpn.id_san_pham = sp.id_san_pham
        LEFT JOIN phieu_nhap pn ON pn.id_phieu_nhap = ctpn.id_phieu_nhap
        LEFT JOIN chi_tiet_don_hang ctdh ON ctdh.id_san_pham = sp.id_san_pham
        LEFT JOIN don_hang dh ON dh.id_don_hang = ctdh.id_don_hang
        WHERE (:fromDate IS NULL OR pn.ngay_nhap >= :fromDate OR dh.ngay_dat >= :fromDate)
          AND (:toDate IS NULL OR pn.ngay_nhap <= :toDate OR dh.ngay_dat <= :toDate)
        GROUP BY sp.id_san_pham, sp.ten_san_pham
    """, nativeQuery = true)
    List<Map<String,Object>> stockImportExport(String fromDate, String toDate);

    @Query(value = """
        SELECT dh.trang_thai AS trangThai,
               COUNT(*) AS soLuong
        FROM don_hang dh
        WHERE (:fromDate IS NULL OR dh.ngay_dat >= :fromDate)
          AND (:toDate IS NULL OR dh.ngay_dat <= :toDate)
        GROUP BY dh.trang_thai
    """, nativeQuery = true)
    List<Map<String,Object>> ordersByStatus(String fromDate, String toDate);
}


