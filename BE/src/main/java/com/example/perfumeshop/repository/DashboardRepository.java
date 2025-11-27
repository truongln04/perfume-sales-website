package com.example.perfumeshop.repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DashboardRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int countTaiKhoan() {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tai_khoan", Integer.class);
    }

    public int countSanPham() {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM san_pham", Integer.class);
    }

    public int countDonHangMoi() {
        return jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM don_hang WHERE trang_thai = 'CHO_XAC_NHAN'", Integer.class);
    }

    public long sumDoanhThu() {
        return jdbcTemplate.queryForObject(
            "SELECT COALESCE(SUM(tong_tien),0) FROM don_hang WHERE trang_thai_tt = 'DA_THANH_TOAN'", Long.class);
    }
}