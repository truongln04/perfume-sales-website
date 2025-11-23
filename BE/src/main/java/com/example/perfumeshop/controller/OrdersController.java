package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.*;
import com.example.perfumeshop.entity.Orders;
import com.example.perfumeshop.service.OrdersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrdersService service;

    // 🧾 Tạo đơn hàng mới (bao gồm chi tiết đơn hàng)
    @PostMapping("/create")
    public OrdersResponse createOrder(@Valid @RequestBody OrdersCreateWrapper wrapper) {
        return service.create(wrapper.getRequest(), wrapper.getChiTietDonHang());
    }

    // 📋 Xem danh sách đơn hàng
    @GetMapping
    public List<OrdersResponse> getAllOrders() {
        return service.getAll();
    }

    // 🔍 Xem chi tiết đơn hàng theo ID
    @GetMapping("/{id}")
    public OrdersResponse getOrderById(@PathVariable Integer id) {
        return service.getById(id);
    }

    // 🔍 Tìm kiếm đơn hàng theo tên người nhận hoặc số điện thoại
    @GetMapping("/search")
    public List<OrdersResponse> searchOrders(@RequestParam(required = false) String hoTenNhan,
                                             @RequestParam(required = false) String sdtNhan) {
        return service.searchOrders(hoTenNhan, sdtNhan);
    }

    // ✏️ Cập nhật trạng thái thanh toán
    @PutMapping("/{id}/payment-status")
public OrdersResponse updatePaymentStatus(@PathVariable Integer id,
                                          @RequestParam Orders.PaymentStatus trangThaiTT) {
    return service.updatePaymentStatus(id, trangThaiTT);
}

    // ✏️ Cập nhật trạng thái đơn hàng
   @PutMapping("/{id}/status")
public OrdersResponse updateOrderStatus(@PathVariable Integer id,
                                        @RequestParam Orders.OrderStatus trangThai,
                                        @RequestParam(required = false) Orders.PaymentStatus paymentStatus) {
    return service.updateStatus(id, trangThai, paymentStatus);
}


    // 🗑️ Xóa đơn hàng
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Integer id) {
        service.deleteOrder(id);
    }
    @GetMapping("/account/{idTaiKhoan}")
    public List<OrdersResponse> getOrdersByAccount(@PathVariable Integer idTaiKhoan) {
        return service.getByAccountId(idTaiKhoan);
    }
}