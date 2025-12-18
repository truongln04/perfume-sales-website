package com.example.perfumeshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class DonHangDTO {

    private LocalDate ngay;       // ngày đặt hàng (nullable nếu chỉ tổng)
    private Long idDonHang;       // id đơn hàng (nullable nếu chỉ tổng)
    private String trangThai;     // trạng thái đơn hàng
    private Long soLuong;         // số lượng sản phẩm trong đơn hoặc số đơn
    private BigDecimal tongTien;  // tổng tiền

    // Constructor tổng (không có ngày, id đơn hàng)
    public DonHangDTO(String trangThai, Long soLuong, BigDecimal tongTien) {
        this.trangThai = trangThai;
        this.soLuong = soLuong;
        this.tongTien = tongTien;
    }

    // Constructor chi tiết (có ngày + id đơn hàng)
    public DonHangDTO(LocalDate ngay, Long idDonHang, String trangThai,
                      Long soLuong, BigDecimal tongTien) {
        this.ngay = ngay;
        this.idDonHang = idDonHang;
        this.trangThai = trangThai;
        this.soLuong = soLuong;
        this.tongTien = tongTien;
    }
}
