package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.*;
import com.example.perfumeshop.entity.*;
import com.example.perfumeshop.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
// import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final ReceiptRepository receiptRepo;
    // private final SupplierRepository supplierRepo;
    private final ProductRepository productRepo;
    private final WarehouseRepository warehouseRepo;
    @PersistenceContext
    private EntityManager em;

    // ==================== REGEX PATTERNS – CHUẨN NHƯ CÁC SERVICE KHÁC ====================
    private static final Pattern NOTE_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ0-9\\s,.?!-]{0,500}$");

    // ==================== CREATE RECEIPT ====================
    @Transactional
    public ReceiptResponse create(ReceiptRequest request) {
        validateCreateRequest(request);


        Receipt receipt = Receipt.builder()
                .ngayNhap(LocalDateTime.now())
                .ghiChu(request.getGhiChu() != null ? request.getGhiChu().trim() : null)
                .build();

        List<ReceiptDetail> chiTietList = new ArrayList<>();
        BigDecimal tongTien = BigDecimal.ZERO;

        for (ReceiptDetailRequest d : request.getChiTietPhieuNhap()) {
            Product sanPham = productRepo.findById(d.getIdSanPham())
                    .orElseThrow(() -> new ValidationException("Không tìm thấy sản phẩm với ID: " + d.getIdSanPham()));

            if (d.getSoLuong() <= 0) {
                throw new ValidationException("Số lượng nhập sản phẩm '" + sanPham.getTenSanPham() + "' phải lớn hơn 0");
            }
            if (d.getDonGia() == null || d.getDonGia().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ValidationException("Đơn giá sản phẩm '" + sanPham.getTenSanPham() + "' phải lớn hơn 0");
            }

            ReceiptDetail detail = ReceiptDetail.builder()
                    .phieuNhap(receipt)
                    .sanPham(sanPham)
                    .soLuong(d.getSoLuong())
                    .donGia(d.getDonGia())
                    .build();

            tongTien = tongTien.add(d.getDonGia().multiply(BigDecimal.valueOf(d.getSoLuong())));
            chiTietList.add(detail);

            // Cập nhật tồn kho
            updateSoLuongNhap(sanPham, d.getSoLuong());
            
        }

        receipt.setTongTien(tongTien);
        receipt.setChiTietPhieuNhap(chiTietList);

        Receipt saved = receiptRepo.save(receipt);
        return toResponse(saved);
    }

    // ==================== UPDATE RECEIPT ====================
    @Transactional
    public ReceiptResponse update(Integer id, ReceiptRequest request) {
        Receipt receipt = receiptRepo.findById(id)
                .orElseThrow(() -> new ValidationException("Không tìm thấy phiếu nhập với ID: " + id));

        validateUpdateRequest(request);

        // Rollback tồn kho cũ
        for (ReceiptDetail old : receipt.getChiTietPhieuNhap()) {
            updateSoLuongNhap(old.getSanPham(), -old.getSoLuong());
        }

        receipt.setNgayNhap(LocalDateTime.now());
        receipt.setGhiChu(request.getGhiChu() != null ? request.getGhiChu().trim() : null);

        List<ReceiptDetail> chiTietList = new ArrayList<>();
        BigDecimal tongTien = BigDecimal.ZERO;

        for (ReceiptDetailRequest d : request.getChiTietPhieuNhap()) {
            Product sanPham = productRepo.findById(d.getIdSanPham())
                    .orElseThrow(() -> new ValidationException("Không tìm thấy sản phẩm với ID: " + d.getIdSanPham()));

            if (d.getSoLuong() <= 0) {
                throw new ValidationException("Số lượng nhập sản phẩm '" + sanPham.getTenSanPham() + "' phải lớn hơn 0");
            }
            if (d.getDonGia() == null || d.getDonGia().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ValidationException("Đơn giá sản phẩm '" + sanPham.getTenSanPham() + "' phải lớn hơn 0");
            }

            ReceiptDetail detail = ReceiptDetail.builder()
                    .phieuNhap(receipt)
                    .sanPham(sanPham)
                    .soLuong(d.getSoLuong())
                    .donGia(d.getDonGia())
                    .build();

            tongTien = tongTien.add(d.getDonGia().multiply(BigDecimal.valueOf(d.getSoLuong())));
            chiTietList.add(detail);

            updateSoLuongNhap(sanPham, d.getSoLuong());
            
        }

        receipt.setTongTien(tongTien);
        receipt.setChiTietPhieuNhap(chiTietList);

        Receipt updated = receiptRepo.save(receipt);
        return toResponse(updated);
    }

    // ==================== DELETE ====================
 @Transactional
public void delete(Integer id) {
    Receipt receipt = receiptRepo.findById(id)
            .orElseThrow(() -> new ValidationException("Không tìm thấy phiếu nhập với ID: " + id));

    for (ReceiptDetail detail : receipt.getChiTietPhieuNhap()) {
        Product sp = detail.getSanPham();
        Warehouse wh = warehouseRepo.findById(sp.getIdSanPham())
                .orElseThrow(() -> new ValidationException("Không tìm thấy kho cho sản phẩm: " + sp.getTenSanPham()));

        int soLuongNhapBanDau = detail.getSoLuong();
        int tonKhoThucTe = wh.getSoLuongNhap() - wh.getSoLuongBan();

        if (tonKhoThucTe < soLuongNhapBanDau) {
            throw new ValidationException(
                "Không thể xóa phiếu nhập vì sản phẩm " + sp.getTenSanPham() +
                " đã được bán bớt (tồn kho thực tế: " + tonKhoThucTe +
                ", số lượng nhập từ phiếu: " + soLuongNhapBanDau + ")"
            );
        }
    }

    // Rollback tồn kho
    for (ReceiptDetail detail : receipt.getChiTietPhieuNhap()) {
        updateSoLuongNhap(detail.getSanPham(), -detail.getSoLuong());
    }

    receiptRepo.delete(receipt);
}


    // ==================== GET ALL & GET BY ID ====================
    public List<ReceiptResponse> getAll() {
        return receiptRepo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReceiptResponse getById(Integer id) {
        Receipt receipt = receiptRepo.findById(id)
                .orElseThrow(() -> new ValidationException("Không tìm thấy phiếu nhập với ID: " + id));
        return toResponse(receipt);
    }

    // ==================== VALIDATION – GIỐNG PRODUCT & CATEGORY SERVICE ====================
    private void validateCreateRequest(ReceiptRequest request) {
        
        if (request.getChiTietPhieuNhap() == null || request.getChiTietPhieuNhap().isEmpty()) {
            throw new ValidationException("Phiếu nhập phải có ít nhất 1 sản phẩm");
        }

        // Ghi chú (tùy chọn)
        if (request.getGhiChu() != null && !request.getGhiChu().trim().isEmpty()) {
            if (!NOTE_PATTERN.matcher(request.getGhiChu().trim()).matches()) {
                throw new ValidationException("Ghi chú không được vượt quá 500 ký tự và chỉ chứa chữ cái, số, khoảng trắng, dấu câu");
            }
        }
    }

    private void validateUpdateRequest(ReceiptRequest request) {
        
        if (request.getChiTietPhieuNhap() == null || request.getChiTietPhieuNhap().isEmpty()) {
            throw new ValidationException("Phiếu nhập phải có ít nhất 1 sản phẩm");
        }

        // Ghi chú (tùy chọn)
        if (request.getGhiChu() != null && !request.getGhiChu().trim().isEmpty()) {
            if (!NOTE_PATTERN.matcher(request.getGhiChu().trim()).matches()) {
                throw new ValidationException("Ghi chú không được vượt quá 500 ký tự");
            }
        }
    }

    // ==================== UTILITY ====================
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
            if (newNhap < 0) {
                throw new ValidationException("Số lượng nhập không hợp lệ (dưới 0)");
            }
            kho.setSoLuongNhap(newNhap);
        }
        if (kho != null) {
            warehouseRepo.save(kho);
        }
    }
    // ==================== SEARCH ====================
    public List<ReceiptResponse> search(String keyword) {
    if (keyword == null || keyword.trim().isEmpty()) {
        throw new ValidationException("Từ khóa tìm kiếm không được để trống");
    }

    List<Receipt> list = receiptRepo.search(keyword.trim());

    // if (list.isEmpty()) {
    //     throw new ValidationException("Không tìm thấy phiếu nhập phù hợp với từ khóa: " + keyword);
    // }

    return list.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
}


    private ReceiptResponse toResponse(Receipt r) {
        return ReceiptResponse.builder()
                .idPhieuNhap(r.getIdPhieuNhap())
                .ngayNhap(r.getNgayNhap())
                .tongTien(r.getTongTien())
                .ghiChu(r.getGhiChu())
                .chiTietPhieuNhap(r.getChiTietPhieuNhap().stream()
                        .map(d -> ReceiptDetailResponse.builder()
                                .idCTPN(d.getIdCTPN())
                                .idSanPham(d.getSanPham().getIdSanPham())
                                .tenSanPham(d.getSanPham().getTenSanPham())
                                .soLuong(d.getSoLuong())
                                .donGia(d.getDonGia())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}