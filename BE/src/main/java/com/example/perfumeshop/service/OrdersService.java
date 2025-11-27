package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.*;
import com.example.perfumeshop.entity.*;
import com.example.perfumeshop.entity.Orders.PaymentMethod;
import com.example.perfumeshop.entity.Orders.OrderStatus;
import com.example.perfumeshop.entity.Orders.PaymentStatus;
import com.example.perfumeshop.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrdersService {

    private final OrdersRepository ordersRepo;
    private final AccountRepository accountRepo;
    private final ProductRepository productRepo;
    private final OrdersDetailRepository ordersDetailRepo;
    private final WarehouseRepository warehouseRepository;

    // ==================== REGEX PATTERNS ====================
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ\\s]{3,40}$");           
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0[0-9]{9}$");                   
    private static final Pattern ADDRESS_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ0-9 ,./-]{3,40}$"); 
    private static final Pattern NOTE_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ0-9\\s]{8,}$");                    

    // ==================== CREATE ORDER ====================
    @Transactional
    public OrdersResponse create(OrdersRequest request, List<OrdersDetailRequest> chiTietDonHang) {
        validateCreateOrderRequest(request, chiTietDonHang);

        Account account = accountRepo.findById(request.getIdTaiKhoan())
                .orElseThrow(() -> new ValidationException("Không tìm thấy tài khoản với ID: " + request.getIdTaiKhoan()));

        Orders order = Orders.builder()
                .taiKhoan(account)
                .ngayDat(LocalDateTime.now())
                .phuongThucTT(request.getPhuongThucTT())
                .trangThaiTT(request.getPhuongThucTT() == PaymentMethod.ONLINE
                        ? PaymentStatus.DA_THANH_TOAN
                        : PaymentStatus.CHUA_THANH_TOAN)
                .hoTenNhan(request.getHoTenNhan().trim())
                .sdtNhan(request.getSdtNhan().trim())
                .diaChiGiao(request.getDiaChiGiao().trim())
                .ghiChu(request.getGhiChu() != null ? request.getGhiChu().trim() : null)
                .build();

        List<OrdersDetail> detailList = new ArrayList<>();
        BigDecimal tongTien = BigDecimal.ZERO;

        for (OrdersDetailRequest d : chiTietDonHang) {
            Product sanPham = productRepo.findById(d.getIdSanPham())
                .orElse(null);

            if (sanPham == null) {
            continue;
            }

            OrdersDetail detail = OrdersDetail.builder()
                    .donHang(order)
                    .sanPham(sanPham)
                    .soLuong(d.getSoLuong())
                    .donGia(d.getDonGia())
                    .build();

            tongTien = tongTien.add(d.getDonGia().multiply(BigDecimal.valueOf(d.getSoLuong())));
            detailList.add(detail);
        }

        if (tongTien.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Tổng tiền đơn hàng phải lớn hơn 0");
        }

        order.setTongTien(tongTien);
        order.setChiTietDonHang(detailList);

        Orders saved = ordersRepo.save(order);
        return toResponse(saved);
    }

    // ==================== GET BY ID ====================
    public OrdersResponse getById(Integer id) {
        if (id == null || id <= 0) {
            throw new ValidationException("ID đơn hàng không hợp lệ");
        }
        Orders order = ordersRepo.findById(id)
                .orElseThrow(() -> new ValidationException("Không tìm thấy đơn hàng với ID: " + id));
        return toResponse(order);
    }

    // ==================== GET ALL ====================
    public List<OrdersResponse> getAll() {
        return ordersRepo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ==================== DELETE ====================
    public void deleteOrder(Integer id) {
        if (id == null || id <= 0) {
            throw new ValidationException("ID đơn hàng không hợp lệ");
        }
        if (!ordersRepo.existsById(id)) {
            throw new ValidationException("Không tìm thấy đơn hàng để xóa");
        }
        // Chỉ cho xóa khi đang ở trạng thái chờ xác nhận hoặc đã hủy
        Orders order = ordersRepo.findById(id).get();
        if (order.getTrangThai() != OrderStatus.CHO_XAC_NHAN && order.getTrangThai() != OrderStatus.HUY) {
            throw new ValidationException("Chỉ được xóa đơn hàng ở trạng thái Chờ xác nhận hoặc Đã hủy");
        }
        ordersRepo.deleteById(id);
    }

    // ==================== SEARCH ====================
    public List<OrdersResponse> searchOrders(String hoTenNhan, String sdtNhan) {
        if ((hoTenNhan == null || hoTenNhan.trim().isEmpty()) &&
                (sdtNhan == null || sdtNhan.trim().isEmpty())) {
            throw new ValidationException("Vui lòng nhập ít nhất một trong hai: Họ tên nhận hoặc Số điện thoại");
        }

        String ten = hoTenNhan != null ? hoTenNhan.trim() : null;
        String sdt = sdtNhan != null ? sdtNhan.trim() : null;

        List<Orders> orders = ordersRepo.searchOrders(ten, sdt);
        return orders.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ==================== UPDATE PAYMENT STATUS ====================
    @Transactional
    public OrdersResponse updatePaymentStatus(Integer id, PaymentStatus trangThaiTT) {
        if (id == null || id <= 0) {
            throw new ValidationException("ID đơn hàng không hợp lệ");
        }
        if (trangThaiTT == null) {
            throw new ValidationException("Trạng thái thanh toán không được để trống");
        }

        Orders order = ordersRepo.findById(id)
                .orElseThrow(() -> new ValidationException("Không tìm thấy đơn hàng với ID: " + id));

        order.setTrangThaiTT(trangThaiTT);
        return toResponse(ordersRepo.save(order));
    }

    // ==================== UPDATE ORDER STATUS ====================
    @Transactional
    public OrdersResponse updateStatus(Integer id, OrderStatus trangThai, PaymentStatus paymentStatus) {
        if (id == null || id <= 0) {
            throw new ValidationException("ID đơn hàng không hợp lệ");
        }
        if (trangThai == null) {
            throw new ValidationException("Trạng thái đơn hàng không được để trống");
        }

        Orders order = ordersRepo.findById(id)
                .orElseThrow(() -> new ValidationException("Không tìm thấy đơn hàng với ID: " + id));

        OrderStatus oldStatus = order.getTrangThai();

        // === HOÀN THÀNH → cộng số lượng bán ===
        if (oldStatus != OrderStatus.HOAN_THANH && trangThai == OrderStatus.HOAN_THANH) {
            updateSoldQuantity(order, true);
            order.setTrangThaiTT(PaymentStatus.DA_THANH_TOAN);
        }

        // === TRẢ HÀNG → trừ số lượng bán ===
        if (oldStatus == OrderStatus.HOAN_THANH && trangThai == OrderStatus.TRA_HANG) {
            updateSoldQuantity(order, false);
            order.setTrangThaiTT(paymentStatus != null ? paymentStatus : PaymentStatus.HOAN_TIEN);
        }

        order.setTrangThai(trangThai);
        return toResponse(ordersRepo.save(order));
    }

    // ==================== GET BY ACCOUNT ID ====================
    public List<OrdersResponse> getByAccountId(Integer idTaiKhoan) {
        if (idTaiKhoan == null || idTaiKhoan <= 0) {
            throw new ValidationException("ID tài khoản không hợp lệ");
        }
        if (!accountRepo.existsById(idTaiKhoan)) {
            throw new ValidationException("Không tìm thấy tài khoản với ID: " + idTaiKhoan);
        }
        List<Orders> orders = ordersRepo.findByTaiKhoan_IdTaiKhoan(idTaiKhoan);
        return orders.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ==================== PRIVATE VALIDATION & UTILS ====================

    private void validateCreateOrderRequest(OrdersRequest request, List<OrdersDetailRequest> chiTiet) {
        if (request == null) {
            throw new ValidationException("Dữ liệu đơn hàng không được để trống");
        }
        if (chiTiet == null || chiTiet.isEmpty()) {
            throw new ValidationException("Chi tiết đơn hàng không được để trống");
        }

        // Họ tên nhận
        if (request.getHoTenNhan() == null || request.getHoTenNhan().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập họ tên người nhận");
        }
        if (!NAME_PATTERN.matcher(request.getHoTenNhan().trim()).matches()) {
            throw new ValidationException("Họ tên người nhận hải từ 3-40 ký tự, chỉ chứa chữ cái, số và khoảng trắng");
        }

        // SĐT nhận
        if (request.getSdtNhan() == null || request.getSdtNhan().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập số điện thoại người nhận");
        }
        if (!PHONE_PATTERN.matcher(request.getSdtNhan().trim()).matches()) {
            throw new ValidationException("Số điện thoại người nhận phải bắt đầu bằng 0 và đúng 10 chữ số");
        }

        // Địa chỉ giao
        if (request.getDiaChiGiao() == null || request.getDiaChiGiao().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập địa chỉ giao hàng");
        }
        if (!ADDRESS_PATTERN.matcher(request.getDiaChiGiao().trim()).matches()) {
            throw new ValidationException("Địa chỉ giao hàng phải từ 3-40 ký tự, chỉ chứa chữ, số và dấu ,./-");
        }

        // Ghi chú (tùy chọn)
        if (request.getGhiChu() != null && !NOTE_PATTERN.matcher(request.getGhiChu()).matches()) {
            throw new ValidationException("Ghi chú ít nhất 8 ký tự trở lên");
        }

        // Phương thức thanh toán
        if (request.getPhuongThucTT() == null) {
            throw new ValidationException("Vui lòng chọn phương thức thanh toán");
        }
    }

    private void updateSoldQuantity(Orders order, boolean isAdd) {
        List<OrdersDetail> details = ordersDetailRepo.findByDonHang(order);
        for (OrdersDetail detail : details) {
            Product product = detail.getSanPham();
            if (product == null) continue;

            Warehouse warehouse = warehouseRepository.findBySanPham(product);
            if (warehouse == null) continue;

            int currentSold = warehouse.getSoLuongBan() != null ? warehouse.getSoLuongBan() : 0;
            int newSold = isAdd ? currentSold + detail.getSoLuong() : currentSold - detail.getSoLuong();
            warehouse.setSoLuongBan(Math.max(0, newSold)); // không âm
            warehouseRepository.save(warehouse);
        }
    }

    private OrdersResponse toResponse(Orders order) {
        List<OrdersDetailResponse> detailDTOs = ordersDetailRepo.findByDonHang(order).stream()
                .map(detail -> OrdersDetailResponse.builder()
                        .idDonHang(detail.getDonHang().getId())
                        .idSanPham(detail.getSanPham() != null ? detail.getSanPham().getIdSanPham() : null)
                        .hinhAnh(detail.getSanPham() != null ? detail.getSanPham().getHinhAnh() : null)
                        .tenSanPham(detail.getSanPham() != null ? detail.getSanPham().getTenSanPham() : null)
                        .soLuong(detail.getSoLuong())
                        .donGia(detail.getDonGia())
                        .build())
                .collect(Collectors.toList());

        return OrdersResponse.builder()
                .id(order.getId())
                .idTaiKhoan(order.getTaiKhoan() != null ? order.getTaiKhoan().getIdTaiKhoan() : null)
                .ngayDat(order.getNgayDat())
                .tongTien(order.getTongTien())
                .phuongThucTT(order.getPhuongThucTT())
                .trangThaiTT(order.getTrangThaiTT())
                .trangThai(order.getTrangThai())
                .hoTenNhan(order.getHoTenNhan())
                .sdtNhan(order.getSdtNhan())
                .diaChiGiao(order.getDiaChiGiao())
                .ghiChu(order.getGhiChu())
                .chiTietDonHang(detailDTOs)
                .build();
    }
}