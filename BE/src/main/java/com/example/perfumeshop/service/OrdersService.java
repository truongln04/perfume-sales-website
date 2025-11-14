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
public class OrdersService {

    @Autowired private OrdersRepository ordersRepo;
    @Autowired private AccountRepository accountRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private OrdersDetailRepository ordersDetailRepo;

    // 🧾 Tạo đơn hàng mới (giống ReceiptService)
    @Transactional
    public OrdersResponse create(OrdersRequest request, List<OrdersDetailRequest> chiTietDonHang) {
        Account account = accountRepo.findById(request.getIdTaiKhoan()).orElse(null);

        Orders order = Orders.builder()
                .taiKhoan(account)
                .ngayDat(LocalDateTime.now())
                .phuongThucTT(request.getPhuongThucTT())
                .hoTenNhan(request.getHoTenNhan())
                .sdtNhan(request.getSdtNhan())
                .diaChiGiao(request.getDiaChiGiao())
                .ghiChu(request.getGhiChu())
                .build();

        List<OrdersDetail> detailList = new ArrayList<>();
        BigDecimal tongTien = BigDecimal.ZERO;

        for (OrdersDetailRequest d : chiTietDonHang) {
            Product sanPham = productRepo.findById(d.getIdSanPham()).orElse(null);
            if (sanPham == null) continue;

            OrdersDetail detail = OrdersDetail.builder()
                    .donHang(order)
                    .sanPham(sanPham)
                    .soLuong(d.getSoLuong())
                    .donGia(d.getDonGia())
                    .thanhTien(d.getDonGia().multiply(BigDecimal.valueOf(d.getSoLuong())))
                    .build();

            tongTien = tongTien.add(detail.getThanhTien());
            detailList.add(detail);
        }

        order.setTongTien(tongTien);
        order.setChiTietDonHang(detailList);

        Orders saved = ordersRepo.save(order);
        return toResponse(saved);
    }

    // 🔍 Lấy đơn hàng theo ID
    public OrdersResponse getById(Integer id) {
        Orders order = ordersRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        return toResponse(order);
    }

    // 📋 Lấy tất cả đơn hàng
    public List<OrdersResponse> getAll() {
        return ordersRepo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // 🗑️ Xóa đơn hàng theo id
    public void deleteOrder(Integer id) {
        ordersRepo.deleteById(id);
    }


    // 🔍 Tìm kiếm đơn hàng theo tên người nhận hoặc số điện thoại
    public List<OrdersResponse> searchOrders(String hoTenNhan, String sdtNhan) {
    List<Orders> orders = ordersRepo.searchOrders(hoTenNhan, sdtNhan);
    return orders.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

// ✏️ Cập nhật trạng thái thanh toán
    @Transactional
public OrdersResponse updatePaymentStatus(Integer id, Orders.PaymentStatus trangThaiTT) {
    Orders order = ordersRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
    order.setTrangThaiTT(trangThaiTT);
    return toResponse(ordersRepo.save(order));
}

// ✏️ Cập nhật trạng thái đơn hàng
@Transactional
public OrdersResponse updateStatus(Integer id, Orders.OrderStatus trangThai) {
    Orders order = ordersRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
    order.setTrangThai(trangThai);
    return toResponse(ordersRepo.save(order));
}

    // 🧾 Mapping entity → DTO
    private OrdersResponse toResponse(Orders order) {
        List<OrdersDetailResponse> detailDTOs = ordersDetailRepo.findByDonHang(order).stream()
                .map(detail -> OrdersDetailResponse.builder()
                        .idDonHang(detail.getDonHang().getId())
                        .idSanPham(detail.getSanPham() != null ? detail.getSanPham().getIdSanPham() : null)
                        .tenSanPham(detail.getSanPham() != null ? detail.getSanPham().getTenSanPham() : null)
                        .soLuong(detail.getSoLuong())
                        .donGia(detail.getDonGia())
                        .thanhTien(detail.getThanhTien())
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