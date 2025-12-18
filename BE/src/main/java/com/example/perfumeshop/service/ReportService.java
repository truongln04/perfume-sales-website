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

    // =========================
    // 1) DOANH THU
    // =========================
    public List<DoanhThuDTO> getDoanhThuTong(String fromDate, String toDate, String payment, String paymentStatus) {
        String sql = """
                SELECT DATE(dh.ngay_dat) AS ngay,
                       SUM(dh.tong_tien) AS doanhThu
                FROM don_hang dh
                WHERE dh.trang_thai_tt = 'DA_THANH_TOAN'
                """;

        List<Object> params = new ArrayList<>();

        if (fromDate != null && !fromDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) >= ?";
            params.add(fromDate);
        }
        if (toDate != null && !toDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) <= ?";
            params.add(toDate);
        }
        if (payment != null && !payment.isBlank()) {
            sql += " AND dh.phuong_thuc_tt = ?";
            params.add(payment);
        }

        sql += " GROUP BY DATE(dh.ngay_dat) ORDER BY ngay ASC";

        return jdbc.query(
                sql,
                (rs, i) -> new DoanhThuDTO(
                        rs.getDate("ngay").toLocalDate(),
                        rs.getBigDecimal("doanhThu")),
                params.toArray());
    }

    // ========================
    public List<DoanhThuDTO> getDoanhThuChiTiet(String fromDate, String toDate, String payment, String paymentStatus) {
        String sql = """
                SELECT DATE(dh.ngay_dat) AS ngay,
                       sp.id_san_pham AS idSanPham,
                       sp.ten_san_pham AS tenSanPham,
                       dm.id_danh_muc AS idDanhMuc,
                       dm.ten_danh_muc AS tenDanhMuc,
                       th.id_thuong_hieu AS idThuongHieu,
                       th.ten_thuong_hieu AS tenThuongHieu,
                       dh.phuong_thuc_tt,
                       SUM(ct.so_luong * ct.don_gia) AS doanhThu
                FROM don_hang dh
                JOIN chi_tiet_don_hang ct ON ct.id_don_hang = dh.id_don_hang
                JOIN san_pham sp ON sp.id_san_pham = ct.id_san_pham
                LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id_danh_muc
                LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id_thuong_hieu
                WHERE dh.trang_thai_tt = 'DA_THANH_TOAN'
                """;

        List<Object> params = new ArrayList<>();

        if (fromDate != null && !fromDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) >= ?";
            params.add(fromDate);
        }
        if (toDate != null && !toDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) <= ?";
            params.add(toDate);
        }
        if (payment != null && !payment.isBlank()) {
            sql += " AND dh.phuong_thuc_tt = ?";
            params.add(payment);
        }
        if (paymentStatus != null && !paymentStatus.isBlank()) {
            sql += " AND dh.trang_thai_tt = ?";
            params.add(paymentStatus);
        }

        sql += " GROUP BY DATE(dh.ngay_dat), sp.id_san_pham, sp.ten_san_pham, dm.id_danh_muc, dm.ten_danh_muc, th.id_thuong_hieu, th.ten_thuong_hieu, dh.phuong_thuc_tt "
                +
                "ORDER BY ngay ASC";

        return jdbc.query(
                sql,
                (rs, i) -> new DoanhThuDTO(
                        rs.getDate("ngay").toLocalDate(),
                        rs.getLong("idSanPham"),
                        rs.getString("tenSanPham"),
                        rs.getLong("idDanhMuc"),
                        rs.getString("tenDanhMuc"),
                        rs.getLong("idThuongHieu"),
                        rs.getString("tenThuongHieu"),
                        rs.getString("phuong_thuc_tt"),
                        rs.getBigDecimal("doanhThu")),
                params.toArray());
    }

    // =========================
    // 2) ĐƠN HÀNG
    // =========================
    public List<DonHangDTO> getDonHangTong(String fromDate, String toDate, String orderStatus) {

        String sql = "SELECT dh.trang_thai AS trang_thai, COUNT(*) AS so_luong, SUM(dh.tong_tien) AS tong_tien " +
                "FROM don_hang dh WHERE 1=1";

        List<Object> params = new ArrayList<>();

        if (fromDate != null && !fromDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) >= ?";
            params.add(fromDate);
        }
        if (toDate != null && !toDate.isBlank()) {
            sql += "AND DATE(dh.ngay_dat) <= ?";
            params.add(toDate);
        }
        if (orderStatus != null && !orderStatus.isBlank()) {
            sql += " AND dh.trang_thai = ?";
            params.add(orderStatus);
        }

        sql += " GROUP BY dh.trang_thai";

        return jdbc.query(
                sql,
                (rs, i) -> new DonHangDTO(
                        rs.getString("trang_thai"),
                        rs.getLong("so_luong"),
                        rs.getBigDecimal("tong_tien")),
                params.toArray());
    }

    //
    public List<DonHangDTO> getDonHangChiTiet(String fromDate, String toDate, String orderStatus) {
        String sql = "SELECT DATE(dh.ngay_dat) AS ngay, " +
                "dh.id_don_hang AS idDonHang, " +
                "dh.trang_thai AS trang_thai, " +
                "COUNT(ct.id_san_pham) AS so_luong, " +
                "SUM(ct.so_luong * ct.don_gia) AS tong_tien " +
                "FROM don_hang dh " +
                "JOIN chi_tiet_don_hang ct ON ct.id_don_hang = dh.id_don_hang " +
                "WHERE 1=1";

        List<Object> params = new ArrayList<>();

        if (fromDate != null && !fromDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) >= ?";
            params.add(fromDate);
        }
        if (toDate != null && !toDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) <= ?";
            params.add(toDate);
        }
        if (orderStatus != null && !orderStatus.isBlank()) {
            sql += " AND dh.trang_thai = ?";
            params.add(orderStatus);
        }

        sql += " GROUP BY DATE(dh.ngay_dat), dh.id_don_hang, dh.trang_thai " +
                "ORDER BY ngay ASC";

        return jdbc.query(
                sql,
                (rs, i) -> new DonHangDTO(
                        rs.getDate("ngay").toLocalDate(),
                        rs.getLong("idDonHang"),
                        rs.getString("trang_thai"),
                        rs.getLong("so_luong"),
                        rs.getBigDecimal("tong_tien")),
                params.toArray());
    }

    // =========================
 public List<TonKhoDTO> getTonKho(String productCode, String categoryId, String brandId) {

    String sql = """
            SELECT sp.id_san_pham, sp.ten_san_pham,
                   k.so_luong_nhap, k.so_luong_ban,
                   (k.so_luong_nhap - k.so_luong_ban) AS ton_kho,
                   dm.ten_danh_muc,
                   th.ten_thuong_hieu
            FROM kho k
            JOIN san_pham sp ON k.id_san_pham = sp.id_san_pham
            LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id_danh_muc
            LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id_thuong_hieu
            WHERE 1=1
            """;

    List<Object> params = new ArrayList<>();

    // lọc theo sản phẩm nếu có chọn
    if (productCode != null && !productCode.isBlank()) {
        sql += " AND sp.id_san_pham = ?";
        params.add(Long.valueOf(productCode));
    }

    // lọc theo danh mục nếu có chọn
    if (categoryId != null && !categoryId.isBlank()) {
        sql += " AND dm.id_danh_muc = ?";
        params.add(Long.valueOf(categoryId));
    }

    // lọc theo thương hiệu nếu có chọn
    if (brandId != null && !brandId.isBlank()) {
        sql += " AND th.id_thuong_hieu = ?";
        params.add(Long.valueOf(brandId));
    }

    sql += " ORDER BY sp.id_san_pham";

    return jdbc.query(
            sql,
            (rs, i) -> new TonKhoDTO(
                    rs.getLong("id_san_pham"),
                    rs.getString("ten_san_pham"),
                    rs.getInt("so_luong_nhap"),
                    rs.getInt("so_luong_ban"),
                    rs.getInt("ton_kho"),
                    rs.getString("ten_danh_muc"),
                    rs.getString("ten_thuong_hieu")),
            params.toArray());
}


    // =========================
    // 4) BÁN CHẠY (có chi tiết theo ngày)
    // =========================
    // =========================
    // 4a) BÁN CHẠY TỔNG
    // =========================
    public List<BanChayDTO> getBanChayTong(String fromDate, String toDate, String category, String brand, int top) {

        String sql = """
                SELECT sp.id_san_pham AS idSanPham,
                       sp.ten_san_pham AS tenSanPham,
                       SUM(ct.so_luong) AS tongBan,
                       SUM(ct.so_luong * ct.don_gia) AS doanhThu,
                       dm.ten_danh_muc,
                       th.ten_thuong_hieu
                FROM chi_tiet_don_hang ct
                JOIN don_hang dh ON ct.id_don_hang = dh.id_don_hang
                JOIN san_pham sp ON ct.id_san_pham = sp.id_san_pham
                LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id_danh_muc
                LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id_thuong_hieu
                WHERE dh.trang_thai = 'HOAN_THANH'
                """;

        List<Object> params = new ArrayList<>();

        if (fromDate != null && !fromDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) >= ?";
            params.add(fromDate);
        }
        if (toDate != null && !toDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) <= ?";
            params.add(toDate);
        }
        if (category != null && !category.isBlank()) {
            sql += " AND dm.ten_danh_muc = ?";
            params.add(category);
        }
        if (brand != null && !brand.isBlank()) {
            sql += " AND th.ten_thuong_hieu = ?";
            params.add(brand);
        }

        sql += " GROUP BY sp.id_san_pham, sp.ten_san_pham, dm.ten_danh_muc, th.ten_thuong_hieu " +
                "ORDER BY tongBan DESC LIMIT ?";
        params.add(top);

        return jdbc.query(
                sql,
                (rs, i) -> new BanChayDTO(
                        rs.getLong("idSanPham"),
                        rs.getString("tenSanPham"),
                        rs.getLong("tongBan"),
                        rs.getBigDecimal("doanhThu"),
                        rs.getString("ten_danh_muc"),
                        rs.getString("ten_thuong_hieu")),
                params.toArray());
    }

    // =========================
    // 4b) BÁN CHẠY CHI TIẾT THEO NGÀY
    // =========================
    public List<BanChayDTO> getBanChayChiTiet(String fromDate, String toDate, String category, String brand) {

        String sql = """
                SELECT DATE(dh.ngay_dat) AS ngay,
                       sp.id_san_pham AS idSanPham,
                       sp.ten_san_pham AS tenSanPham,
                       SUM(ct.so_luong) AS tongBan,
                       SUM(ct.so_luong * ct.don_gia) AS doanhThu,
                       dm.ten_danh_muc,
                       th.ten_thuong_hieu
                FROM chi_tiet_don_hang ct
                JOIN don_hang dh ON ct.id_don_hang = dh.id_don_hang
                JOIN san_pham sp ON ct.id_san_pham = sp.id_san_pham
                LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id_danh_muc
                LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id_thuong_hieu
                WHERE dh.trang_thai = 'HOAN_THANH'
                """;

        List<Object> params = new ArrayList<>();

        if (fromDate != null && !fromDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) >= ?";
            params.add(fromDate);
        }
        if (toDate != null && !toDate.isBlank()) {
            sql += " AND DATE(dh.ngay_dat) <= ?";
            params.add(toDate);
        }
        if (category != null && !category.isBlank()) {
            sql += " AND dm.ten_danh_muc = ?";
            params.add(category);
        }
        if (brand != null && !brand.isBlank()) {
            sql += " AND th.ten_thuong_hieu = ?";
            params.add(brand);
        }

        sql += " GROUP BY DATE(dh.ngay_dat), sp.id_san_pham, sp.ten_san_pham, dm.ten_danh_muc, th.ten_thuong_hieu " +
                "ORDER BY ngay ASC, tongBan DESC";

        return jdbc.query(
                sql,
                (rs, i) -> new BanChayDTO(
                        rs.getDate("ngay").toLocalDate(), // thêm ngày vào DTO
                        rs.getLong("idSanPham"),
                        rs.getString("tenSanPham"),
                        rs.getLong("tongBan"),
                        rs.getBigDecimal("doanhThu"),
                        rs.getString("ten_danh_muc"),
                        rs.getString("ten_thuong_hieu")),
                params.toArray());
    }

    // =========================
    // EXPORT EXCEL (KHÔNG THAY ĐỔI)
    // =========================

    public ResponseEntity<ByteArrayResource> exportDoanhThuExcel(List<DoanhThuDTO> data) throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Doanh thu");

        // Header
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Ngày");
        header.createCell(1).setCellValue("ID sản phẩm");
        header.createCell(2).setCellValue("Tên sản phẩm");
        header.createCell(3).setCellValue("ID danh mục");
        header.createCell(4).setCellValue("Tên danh mục");
        header.createCell(5).setCellValue("ID thương hiệu");
        header.createCell(6).setCellValue("Tên thương hiệu");
        header.createCell(7).setCellValue("Phương thức thanh toán");
        header.createCell(8).setCellValue("Doanh thu");

        // Data rows
        int rowIdx = 1;
        for (DoanhThuDTO dto : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(dto.getNgay() != null ? dto.getNgay().toString() : "");
            row.createCell(1).setCellValue(dto.getIdSanPham() != null ? dto.getIdSanPham() : 0);
            row.createCell(2).setCellValue(dto.getTenSanPham() != null ? dto.getTenSanPham() : "");
            row.createCell(3).setCellValue(dto.getIdDanhMuc() != null ? dto.getIdDanhMuc() : 0);
            row.createCell(4).setCellValue(dto.getTenDanhMuc() != null ? dto.getTenDanhMuc() : "");
            row.createCell(5).setCellValue(dto.getIdThuongHieu() != null ? dto.getIdThuongHieu() : 0);
            row.createCell(6).setCellValue(dto.getTenThuongHieu() != null ? dto.getTenThuongHieu() : "");
            row.createCell(7).setCellValue(dto.getPhuongThucTT() != null ? dto.getPhuongThucTT() : "");
            row.createCell(8).setCellValue(dto.getDoanhThu() != null ? dto.getDoanhThu().doubleValue() : 0.0);
        }

        return toExcelResponse(wb, "doanhthu.xlsx");
    }

    public ResponseEntity<ByteArrayResource> exportDonHangExcel(List<DonHangDTO> data) throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Đơn hàng");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Ngày");
        header.createCell(1).setCellValue("ID đơn hàng");
        header.createCell(2).setCellValue("Trạng thái");
        // header.createCell(3).setCellValue("Số sản phẩm");
        header.createCell(3).setCellValue("Tổng tiền");

        int i = 1;
        for (DonHangDTO dto : data) {
            Row row = sheet.createRow(i++);
            row.createCell(0).setCellValue(dto.getNgay() != null ? dto.getNgay().toString() : "");
            row.createCell(1).setCellValue(dto.getIdDonHang() != null ? dto.getIdDonHang() : 0);
            row.createCell(2).setCellValue(dto.getTrangThai());
            // row.createCell(3).setCellValue(dto.getSoLuong() != null ? dto.getSoLuong() :
            // 0);
            row.createCell(3).setCellValue(dto.getTongTien() != null ? dto.getTongTien().doubleValue() : 0.0);
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
        header.createCell(5).setCellValue("Tên danh mục");
        header.createCell(6).setCellValue("Tên thương hiệu");

        int i = 1;
        for (TonKhoDTO dto : data) {
            Row row = sheet.createRow(i++);
            row.createCell(0).setCellValue(dto.getIdSanPham());
            row.createCell(1).setCellValue(dto.getTenSanPham());
            row.createCell(2).setCellValue(dto.getSoLuongNhap());
            row.createCell(3).setCellValue(dto.getSoLuongBan());
            row.createCell(4).setCellValue(dto.getTonKho());
            row.createCell(5).setCellValue(dto.getTenDanhMuc());
            row.createCell(6).setCellValue(dto.getTenthuonghieu());
        }

        return toExcelResponse(wb, "xuatnhaptonkho.xlsx");
    }

    public ResponseEntity<ByteArrayResource> exportBanChayExcel(List<BanChayDTO> data) throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Bán chạy");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Ngày");
        header.createCell(1).setCellValue("ID sản phẩm");
        header.createCell(2).setCellValue("Tên sản phẩm");
        header.createCell(3).setCellValue("Số lượng bán");
        header.createCell(4).setCellValue("Doanh thu");
        header.createCell(5).setCellValue("Tên danh mục");
        header.createCell(6).setCellValue("Tên thương hiệu");

        int i = 1;
        for (BanChayDTO dto : data) {
            Row row = sheet.createRow(i++);
            row.createCell(0).setCellValue(dto.getNgay().toString()); // Cột 0: Ngày
            row.createCell(1).setCellValue(dto.getIdSanPham()); // Cột 1: ID sản phẩm
            row.createCell(2).setCellValue(dto.getTenSanPham()); // Cột 2: Tên sản phẩm
            row.createCell(3).setCellValue(dto.getTongBan()); // Cột 3: Số lượng bán
            row.createCell(4).setCellValue(dto.getDoanhThu().doubleValue());// Cột 4: Doanh thu
            row.createCell(5).setCellValue(dto.getTenDanhMuc()); // Cột 5: Tên danh mục
            row.createCell(6).setCellValue(dto.getTenthuonghieu()); // Cột 6: Tên thương hiệu

        }

        return toExcelResponse(wb, "sanphambanchay.xlsx");
    }

    private ResponseEntity<ByteArrayResource> toExcelResponse(Workbook wb, String filename) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        wb.write(out);
        wb.close();
        ByteArrayResource resource = new ByteArrayResource(out.toByteArray());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(resource.contentLength())
                .body(resource);
    }
}