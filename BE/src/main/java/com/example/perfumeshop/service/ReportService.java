package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.*;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    private final JdbcTemplate jdbc;

    public ReportService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // 1) Doanh thu theo thời gian
    public List<DoanhThuDTO> getDoanhThu(String fromDate, String toDate, String payment, String paymentStatus) {
        String sql = "SELECT DATE(dh.ngay_dat) AS ngay, SUM(dh.tong_tien) AS doanh_thu FROM don_hang dh WHERE 1=1";
        List<Object> params = new ArrayList<>();
        if (fromDate != null && !fromDate.isBlank()) { sql += " AND dh.ngay_dat >= ?"; params.add(fromDate); }
        if (toDate != null && !toDate.isBlank()) { sql += " AND dh.ngay_dat <= ?"; params.add(toDate); }
        if (payment != null && !payment.isBlank()) { sql += " AND dh.phuong_thuc_tt = ?"; params.add(payment); }
        if (paymentStatus != null && !paymentStatus.isBlank()) { sql += " AND dh.trang_thai_tt = ?"; params.add(paymentStatus); }
        sql += " GROUP BY DATE(dh.ngay_dat) ORDER BY ngay ASC";
        return jdbc.query(sql, params.toArray(),
                (rs, i) -> new DoanhThuDTO(rs.getDate("ngay").toLocalDate(), rs.getBigDecimal("doanh_thu")));
    }

    // 2) Đơn hàng theo trạng thái
    public List<DonHangDTO> getDonHang(String fromDate, String toDate, String orderStatus) {
        String sql = "SELECT dh.trang_thai AS trang_thai, COUNT(*) AS so_luong, SUM(dh.tong_tien) AS tong_tien FROM don_hang dh WHERE 1=1";
        List<Object> params = new ArrayList<>();
        if (fromDate != null && !fromDate.isBlank()) { sql += " AND dh.ngay_dat >= ?"; params.add(fromDate); }
        if (toDate != null && !toDate.isBlank()) { sql += " AND dh.ngay_dat <= ?"; params.add(toDate); }
        if (orderStatus != null && !orderStatus.isBlank()) { sql += " AND dh.trang_thai = ?"; params.add(orderStatus); }
        sql += " GROUP BY dh.trang_thai";
        return jdbc.query(sql, params.toArray(),
                (rs, i) -> new DonHangDTO(rs.getString("trang_thai"), rs.getLong("so_luong"), rs.getBigDecimal("tong_tien")));
    }

    // 3) Xuất - Nhập - Tồn kho
    public List<TonKhoDTO> getTonKho(String productCode, String category, String brand) {
        String sql = """
                SELECT sp.id_san_pham, sp.ten_san_pham,
                       k.so_luong_nhap, k.so_luong_ban,
                       (k.so_luong_nhap - k.so_luong_ban) AS ton_kho
                FROM kho k
                JOIN san_pham sp ON k.id_san_pham = sp.id_san_pham
                LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id_danh_muc
                LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id_thuong_hieu
                WHERE 1=1
                """;
        List<Object> params = new ArrayList<>();
        if (productCode != null && !productCode.isBlank()) { sql += " AND sp.id_san_pham = ?"; params.add(productCode); }
        if (category != null && !category.isBlank()) { sql += " AND dm.ten_danh_muc = ?"; params.add(category); }
        if (brand != null && !brand.isBlank()) { sql += " AND th.ten_thuong_hieu = ?"; params.add(brand); }
        sql += " ORDER BY sp.id_san_pham";
        return jdbc.query(sql, params.toArray(),
                (rs, i) -> new TonKhoDTO(
                        rs.getLong("id_san_pham"),
                        rs.getString("ten_san_pham"),
                        rs.getInt("so_luong_nhap"),
                        rs.getInt("so_luong_ban"),
                        rs.getInt("ton_kho")));
    }

    // 4) Sản phẩm bán chạy
    public List<BanChayDTO> getBanChay(String fromDate, String toDate, String category, String brand, int top) {
        String sql = """
                SELECT sp.id_san_pham, sp.ten_san_pham,
                       SUM(ct.so_luong) AS tong_ban,
                       SUM(ct.so_luong * ct.don_gia) AS doanh_thu
                FROM chi_tiet_don_hang ct
                JOIN don_hang dh ON ct.id_don_hang = dh.id_don_hang
                JOIN san_pham sp ON ct.id_san_pham = sp.id_san_pham
                LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id_danh_muc
                LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id_thuong_hieu
                WHERE dh.trang_thai = 'Hoàn thành'
                """;
        List<Object> params = new ArrayList<>();
        if (fromDate != null && !fromDate.isBlank()) { sql += " AND dh.ngay_dat >= ?"; params.add(fromDate); }
        if (toDate != null && !toDate.isBlank()) { sql += " AND dh.ngay_dat <= ?"; params.add(toDate); }
        if (category != null && !category.isBlank()) { sql += " AND dm.ten_danh_muc = ?"; params.add(category); }
        if (brand != null && !brand.isBlank()) { sql += " AND th.ten_thuong_hieu = ?"; params.add(brand); }
        sql += " GROUP BY sp.id_san_pham, sp.ten_san_pham ORDER BY tong_ban DESC LIMIT ?";
        params.add(top);
        return jdbc.query(sql, params.toArray(),
                (rs, i) -> new BanChayDTO(
                        rs.getLong("id_san_pham"),
                        rs.getString("ten_san_pham"),
                        rs.getLong("tong_ban"),
                        rs.getBigDecimal("doanh_thu")));
    }

    // =========================
    // Excel export per report
    // =========================

    public ResponseEntity<ByteArrayResource> exportDoanhThuExcel(List<DoanhThuDTO> data) throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Doanh thu");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Ngày");
        header.createCell(1).setCellValue("Doanh thu");

        int rowIdx = 1;
        for (DoanhThuDTO dto : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(dto.getNgay().toString());
            row.createCell(1).setCellValue(dto.getDoanhThu().doubleValue());
        }

        return toExcelResponse(wb, "doanhthu.xlsx");
    }

    public ResponseEntity<ByteArrayResource> exportDonHangExcel(List<DonHangDTO> data) throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Đơn hàng");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Trạng thái");
        header.createCell(1).setCellValue("Số lượng");
        header.createCell(2).setCellValue("Tổng tiền");

        int rowIdx = 1;
        for (DonHangDTO dto : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(dto.getTrangThai());
            row.createCell(1).setCellValue(dto.getSoLuong());
            row.createCell(2).setCellValue(dto.getTongTien().doubleValue());
        }

        return toExcelResponse(wb, "donhang.xlsx");
    }

    public ResponseEntity<ByteArrayResource> exportTonKhoExcel(List<TonKhoDTO> data) throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Tồn kho");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID sản phẩm");
        header.createCell(1).setCellValue("Tên sản phẩm");
        header.createCell(2).setCellValue("Số lượng nhập");
        header.createCell(3).setCellValue("Số lượng bán");
        header.createCell(4).setCellValue("Tồn kho");

        int rowIdx = 1;
        for (TonKhoDTO dto : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(dto.getIdSanPham());
            row.createCell(1).setCellValue(dto.getTenSanPham());
            row.createCell(2).setCellValue(dto.getSoLuongNhap());
            row.createCell(3).setCellValue(dto.getSoLuongBan());
            row.createCell(4).setCellValue(dto.getTonKho());
        }

        return toExcelResponse(wb, "tonkho.xlsx");
    }

    public ResponseEntity<ByteArrayResource> exportBanChayExcel(List<BanChayDTO> data) throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Bán chạy");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID sản phẩm");
        header.createCell(1).setCellValue("Tên sản phẩm");
        header.createCell(2).setCellValue("Số lượng bán");
        header.createCell(3).setCellValue("Doanh thu");

        int rowIdx = 1;
        for (BanChayDTO dto : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(dto.getIdSanPham());
            row.createCell(1).setCellValue(dto.getTenSanPham());
            row.createCell(2).setCellValue(dto.getTongBan());
            row.createCell(3).setCellValue(dto.getDoanhThu().doubleValue());
        }

        return toExcelResponse(wb, "banchay.xlsx");
    }

    // Utility: build ResponseEntity for Excel
    private ResponseEntity<ByteArrayResource> toExcelResponse(Workbook wb, String filename) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        wb.write(out);
        wb.close();

        ByteArrayResource resource = new ByteArrayResource(out.toByteArray());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(resource.contentLength())
                .body(resource);
    }
}
