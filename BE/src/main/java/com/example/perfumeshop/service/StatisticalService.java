// package com.example.perfumeshop.service;

// import com.example.perfumeshop.repository.StatisticalRepository;
// import lombok.RequiredArgsConstructor;
// import org.apache.poi.ss.usermodel.Row;
// import org.apache.poi.ss.usermodel.Sheet;
// import org.apache.poi.ss.usermodel.Workbook;
// import org.apache.poi.xssf.usermodel.XSSFWorkbook;
// import org.springframework.stereotype.Service;

// import jakarta.servlet.http.HttpServletResponse;
// import java.io.IOException;
// import java.util.List;
// import java.util.Map;

// @Service
// @RequiredArgsConstructor
// public class StatisticalService {
//     private final StatisticalRepository repo;

//     // ================== JSON API ==================
//     public List<Map<String,Object>> getRevenueByDay(String fromDate, String toDate) {
//         return repo.revenueByDay(fromDate, toDate);
//     }

//     public List<Map<String,Object>> getRevenueByProduct(String fromDate, String toDate) {
//         return repo.revenueByProduct(fromDate, toDate);
//     }

//     public List<Map<String,Object>> getTopSellingProducts(String fromDate, String toDate, int limit) {
//         return repo.topSellingProducts(fromDate, toDate, limit);
//     }

//     public List<Map<String,Object>> getStockImportExport(String fromDate, String toDate) {
//         return repo.stockImportExport(fromDate, toDate);
//     }

//     public List<Map<String,Object>> getOrdersByStatus(String fromDate, String toDate) {
//         return repo.ordersByStatus(fromDate, toDate);
//     }

//     // ================== EXCEL EXPORT ==================

//     // 1. Doanh thu (theo ngày + theo sản phẩm)
//     public void exportRevenueExcel(HttpServletResponse response,
//                                    String fromDate, String toDate) throws IOException {
//         List<Map<String,Object>> byDay = getRevenueByDay(fromDate, toDate);
//         List<Map<String,Object>> byProduct = getRevenueByProduct(fromDate, toDate);

//         Workbook wb = new XSSFWorkbook();

//         // Sheet 1: Doanh thu theo ngày
//         Sheet s1 = wb.createSheet("Doanh thu theo ngày");
//         Row h1 = s1.createRow(0);
//         h1.createCell(0).setCellValue("Ngày");
//         h1.createCell(1).setCellValue("Doanh thu");
//         int r1 = 1;
//         for (Map<String,Object> row : byDay) {
//             Row rr = s1.createRow(r1++);
//             rr.createCell(0).setCellValue(String.valueOf(row.get("ngay")));
//             rr.createCell(1).setCellValue(Double.parseDouble(String.valueOf(row.get("doanhThu"))));
//         }

//         // Sheet 2: Doanh thu theo sản phẩm
//         Sheet s2 = wb.createSheet("Doanh thu theo sản phẩm");
//         Row h2 = s2.createRow(0);
//         h2.createCell(0).setCellValue("Sản phẩm");
//         h2.createCell(1).setCellValue("Doanh thu");
//         int r2 = 1;
//         for (Map<String,Object> row : byProduct) {
//             Row rr = s2.createRow(r2++);
//             rr.createCell(0).setCellValue(String.valueOf(row.get("tenSanPham")));
//             rr.createCell(1).setCellValue(Double.parseDouble(String.valueOf(row.get("doanhThuSP"))));
//         }

//         wb.write(response.getOutputStream());
//         wb.close();
//     }

//     // 2. Sản phẩm bán chạy
//     public void exportTopSellingExcel(HttpServletResponse response,
//                                       String fromDate, String toDate, int limit) throws IOException {
//         List<Map<String,Object>> data = getTopSellingProducts(fromDate, toDate, limit);

//         Workbook wb = new XSSFWorkbook();
//         Sheet s = wb.createSheet("Sản phẩm bán chạy");
//         Row h = s.createRow(0);
//         h.createCell(0).setCellValue("Sản phẩm");
//         h.createCell(1).setCellValue("Số lượng bán");
//         h.createCell(2).setCellValue("Doanh thu");
//         int r = 1;
//         for (Map<String,Object> row : data) {
//             Row rr = s.createRow(r++);
//             rr.createCell(0).setCellValue(String.valueOf(row.get("tenSanPham")));
//             rr.createCell(1).setCellValue(Double.parseDouble(String.valueOf(row.get("soLuongBan"))));
//             rr.createCell(2).setCellValue(Double.parseDouble(String.valueOf(row.get("doanhThuSP"))));
//         }

//         wb.write(response.getOutputStream());
//         wb.close();
//     }

//     // 3. Nhập - Xuất - Tồn kho
//     public void exportStockExcel(HttpServletResponse response,
//                                  String fromDate, String toDate) throws IOException {
//         List<Map<String,Object>> data = getStockImportExport(fromDate, toDate);

//         Workbook wb = new XSSFWorkbook();
//         Sheet s = wb.createSheet("Tồn kho");
//         Row h = s.createRow(0);
//         h.createCell(0).setCellValue("Sản phẩm");
//         h.createCell(1).setCellValue("Nhập");
//         h.createCell(2).setCellValue("Xuất");
//         h.createCell(3).setCellValue("Tồn");
//         int r = 1;
//         for (Map<String,Object> row : data) {
//             Row rr = s.createRow(r++);
//             rr.createCell(0).setCellValue(String.valueOf(row.get("tenSanPham")));
//             rr.createCell(1).setCellValue(Double.parseDouble(String.valueOf(row.get("nhap"))));
//             rr.createCell(2).setCellValue(Double.parseDouble(String.valueOf(row.get("xuat"))));
//             rr.createCell(3).setCellValue(Double.parseDouble(String.valueOf(row.get("ton"))));
//         }

//         wb.write(response.getOutputStream());
//         wb.close();
//     }

//     // 4. Đơn hàng theo trạng thái
//     public void exportOrdersByStatusExcel(HttpServletResponse response,
//                                           String fromDate, String toDate) throws IOException {
//         List<Map<String,Object>> data = getOrdersByStatus(fromDate, toDate);

//         Workbook wb = new XSSFWorkbook();
//         Sheet s = wb.createSheet("Đơn hàng theo trạng thái");
//         Row h = s.createRow(0);
//         h.createCell(0).setCellValue("Trạng thái");
//         h.createCell(1).setCellValue("Số lượng");
//         int r = 1;
//         for (Map<String,Object> row : data) {
//             Row rr = s.createRow(r++);
//             rr.createCell(0).setCellValue(String.valueOf(row.get("trangThai")));
//             rr.createCell(1).setCellValue(Double.parseDouble(String.valueOf(row.get("soLuong"))));
//         }

//         wb.write(response.getOutputStream());
//         wb.close();
//     }
// }
