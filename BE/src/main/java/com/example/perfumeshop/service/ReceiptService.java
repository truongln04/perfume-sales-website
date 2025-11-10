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
        }

        receipt.setTongTien(tongTien);
        receipt.setChiTietPhieuNhap(chiTietList);

        Receipt saved = receiptRepo.save(receipt);
        return toResponse(saved);
    }
public ReceiptResponse getById(Integer id) {
    Receipt receipt = receiptRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));
    return toResponse(receipt);
}
@Transactional
public ReceiptResponse update(Integer id, ReceiptRequest request) {
    Receipt receipt = receiptRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

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
    }

    receipt.setTongTien(tongTien);
    receipt.setChiTietPhieuNhap(chiTietList);

    Receipt updated = receiptRepo.save(receipt);
    return toResponse(updated);
}

    public List<ReceiptResponse> getAll() {
        return receiptRepo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void delete(Integer id) {
        receiptRepo.deleteById(id);
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
                        .thanhTien(d.getThanhTien())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
