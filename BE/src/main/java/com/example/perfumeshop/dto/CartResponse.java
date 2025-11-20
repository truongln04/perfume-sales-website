package com.example.perfumeshop.dto;

import lombok.Data;

@Data
public class CartResponse {
    private Integer idGh;            // mã giỏ hàng
    private Integer idTaikhoan;       // mã tài khoản
    private Integer idSanPham;       // mã sản phẩm
    private String tenSanPham;       // tên sản phẩm
    private String hinhAnh;       // thương hiệu sản phẩm
    private Integer soLuong;         // số lượng
    private Long donGia;             // đơn giá
             // tổng tiền = soLuong * donGia
}
