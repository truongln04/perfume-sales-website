package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.*;
import com.example.perfumeshop.entity.*;
import com.example.perfumeshop.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReceiptService {

    @Autowired private ReceiptRepository receiptRepo;
    @Autowired private SupplierRepository supplierRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private WarehouseRepository warehouseRepo;

    @Transactional
    public ReceiptResponse create(ReceiptRequest request) {
        Supplier nhaCungCap = supplierRepo.findById(request.getIdNcc()).orElse(null);

        Receipt receipt = Receipt.builder()
                .nhaCungCap(nhaCungCap)
                .ngayNhap(LocalDateTime.now())
                .ghiChu(request.getGhiChu())
                .build();

        List<ReceiptDetail> chiTietList = new ArrayList<>();
        BigDecimal tongTien = BigDecimal.ZERO;

        for (ReceiptDetailRequest d : request.getChiTietPhieuNhap()) {
            Product sanPham = productRepo.findById(d.getIdSanPham()).orElse(null);
            if (sanPham == null) continue;

            ReceiptDetail detail = ReceiptDetail.builder()
                    .phieuNhap(receipt)
                    .sanPham(sanPham)
                    .soLuong(d.getSoLuong())
                    .donGia(d.getDonGia())
                    .build();

            tongTien = tongTien.add(d.getDonGia().multiply(BigDecimal.valueOf(d.getSoLuong())));
            chiTietList.add(detail);

            updateSoLuongNhap(sanPham, d.getSoLuong());
            sanPham.setGiaNhap(d.getDonGia()); // ✅ cập nhật giá nhập
            productRepo.save(sanPham);
        }

        receipt.setTongTien(tongTien);
        receipt.setChiTietPhieuNhap(chiTietList);

        Receipt saved = receiptRepo.save(receipt);
        return toResponse(saved);
    }
    
    public ReceiptResponse getById(Integer id) {
        Receipt receipt = receiptRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        return toResponse(receipt);
    }

    @Transactional
    public ReceiptResponse update(Integer id, ReceiptRequest request) {
        Receipt receipt = receiptRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        for (ReceiptDetail old : receipt.getChiTietPhieuNhap()) {
            updateSoLuongNhap(old.getSanPham(), -old.getSoLuong());
        }

        Supplier nhaCungCap = supplierRepo.findById(request.getIdNcc()).orElse(null);
        receipt.setNhaCungCap(nhaCungCap);
        receipt.setNgayNhap(LocalDateTime.now());
        receipt.setGhiChu(request.getGhiChu());

        List<ReceiptDetail> chiTietList = new ArrayList<>();
        BigDecimal tongTien = BigDecimal.ZERO;

        for (ReceiptDetailRequest d : request.getChiTietPhieuNhap()) {
            Product sanPham = productRepo.findById(d.getIdSanPham()).orElse(null);
            if (sanPham == null) continue;

            ReceiptDetail detail = ReceiptDetail.builder()
                    .phieuNhap(receipt)
                    .sanPham(sanPham)
                    .soLuong(d.getSoLuong())
                    .donGia(d.getDonGia())
                    .build();

            tongTien = tongTien.add(d.getDonGia().multiply(BigDecimal.valueOf(d.getSoLuong())));
            chiTietList.add(detail);

            updateSoLuongNhap(sanPham, d.getSoLuong());
            sanPham.setGiaNhap(d.getDonGia()); // ✅ cập nhật giá nhập
            productRepo.save(sanPham);
        }

        receipt.setTongTien(tongTien);
        receipt.setChiTietPhieuNhap(chiTietList);

        Receipt updated = receiptRepo.save(receipt);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        Receipt receipt = receiptRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        for (ReceiptDetail detail : receipt.getChiTietPhieuNhap()) {
            updateSoLuongNhap(detail.getSanPham(), -detail.getSoLuong());
        }

        receiptRepo.delete(receipt);
    }

    public List<ReceiptResponse> getAll() {
        return receiptRepo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void updateSoLuongNhap(Product sanPham, int delta) {
        Warehouse kho = warehouseRepo.findBySanPham(sanPham);
        if (kho == null && delta > 0) {
            kho = Warehouse.builder()
                    .sanPham(sanPham)
                    .soLuongNhap(delta)
                    .soLuongBan(0)
                    .build();
        } else if (kho != null) {
            int newNhap = kho.getSoLuongNhap() + delta;
            if (newNhap < 0) throw new RuntimeException("Số lượng nhập không hợp lệ");
            kho.setSoLuongNhap(newNhap);
        }
        if (kho != null) warehouseRepo.save(kho);
    }

    private ReceiptResponse toResponse(Receipt r) {
        return ReceiptResponse.builder()
                .idPhieuNhap(r.getIdPhieuNhap())
                .ngayNhap(r.getNgayNhap())
                .tenNhaCungCap(r.getNhaCungCap() != null ? r.getNhaCungCap().getTenNcc() : null)
                .tongTien(r.getTongTien())
                .ghiChu(r.getGhiChu())
                .chiTietPhieuNhap(r.getChiTietPhieuNhap().stream().map(d -> ReceiptDetailResponse.builder()
                        .idCTPN(d.getIdCTPN())
                        .tenSanPham(d.getSanPham().getTenSanPham())
                        .soLuong(d.getSoLuong())
                        .donGia(d.getDonGia())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
