package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.*;
import com.example.perfumeshop.service.ReportService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    // 1) Doanh thu
    @GetMapping("/doanhthu")
    public List<DoanhThuDTO> doanhThu(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String payment,
            @RequestParam(required = false) String paymentStatus) {
        return service.getDoanhThu(fromDate, toDate, payment, paymentStatus);
    }

    @GetMapping("/doanhthu/export")
    public ResponseEntity<ByteArrayResource> exportDoanhThu(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String payment,
            @RequestParam(required = false) String paymentStatus) throws IOException {
        List<DoanhThuDTO> data = service.getDoanhThu(fromDate, toDate, payment, paymentStatus);
        return service.exportDoanhThuExcel(data);
    }

    // 2) Đơn hàng
    @GetMapping("/donhang")
    public List<DonHangDTO> donHang(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String orderStatus) {
        return service.getDonHang(fromDate, toDate, orderStatus);
    }

    @GetMapping("/donhang/export")
    public ResponseEntity<ByteArrayResource> exportDonHang(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String orderStatus) throws IOException {
        List<DonHangDTO> data = service.getDonHang(fromDate, toDate, orderStatus);
        return service.exportDonHangExcel(data);
    }

    // 3) Tồn kho
    @GetMapping("/tonkho")
    public List<TonKhoDTO> tonKho(
            @RequestParam(required = false) String productCode,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand) {
        return service.getTonKho(productCode, category, brand);
    }

    @GetMapping("/tonkho/export")
    public ResponseEntity<ByteArrayResource> exportTonKho(
            @RequestParam(required = false) String productCode,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand) throws IOException {
        List<TonKhoDTO> data = service.getTonKho(productCode, category, brand);
        return service.exportTonKhoExcel(data);
    }

    // 4) Bán chạy
    @GetMapping("/banchay")
    public List<BanChayDTO> banChay(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "10") int top) {
        return service.getBanChay(fromDate, toDate, category, brand, top);
    }

    @GetMapping("/banchay/export")
    public ResponseEntity<ByteArrayResource> exportBanChay(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "10") int top) throws IOException {
        List<BanChayDTO> data = service.getBanChay(fromDate, toDate, category, brand, top);
        return service.exportBanChayExcel(data);
    }
}
