package com.example.perfumeshop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
@Entity
@Table(name = "chi_tiet_phieu_nhap")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ctpn")
    private Integer idCTPN;

    @ManyToOne
    @JoinColumn(name = "id_phieu_nhap")
    private Receipt phieuNhap;

    @ManyToOne
    @JoinColumn(name = "id_san_pham")
    private Product sanPham;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "don_gia")
    private BigDecimal donGia;

    // @Column(name = "thanh_tien", insertable = false, updatable = false)
    // private BigDecimal thanhTien;
}
