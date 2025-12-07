package com.example.perfumeshop.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;

@Data
public class CartResponse {
    private Integer idGh;            // mã giỏ hàng
    private Integer idTaiKhoan;       // mã tài khoản
    private LocalDateTime ngayTao;
    private List<CartDetailResponse> chiTietGioHang;
}
