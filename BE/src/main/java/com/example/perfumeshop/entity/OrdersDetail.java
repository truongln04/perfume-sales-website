package com.example.perfumeshop.entity;

import java.io.Serializable;
import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chi_tiet_don_hang")
@IdClass(OrdersDetail.OrdersDetailId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdersDetail implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "id_don_hang")
    private Integer idDonHang;

    @Id
    @Column(name = "id_san_pham")
    private Integer idSanPham;

    @ManyToOne
    @JoinColumn(
        name = "id_don_hang",
        referencedColumnName = "id_don_hang",
        insertable = false,
        updatable = false,
        foreignKey = @ForeignKey(name = "fk_ctdh_donhang")
    )
    private Orders donHang;

    @ManyToOne
    @JoinColumn(
        name = "id_san_pham",
        referencedColumnName = "id_san_pham",
        insertable = false,
        updatable = false,
        foreignKey = @ForeignKey(name = "fk_ctdh_sanpham")
    )
    private Product sanPham;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "don_gia", precision = 12, scale = 0)
    private BigDecimal donGia;

    @Column(name = "thanh_tien", precision = 14, scale = 0)
    private BigDecimal thanhTien;

    // ✅ Khóa chính tổng hợp bên trong entity
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrdersDetailId implements Serializable {
        private Integer idDonHang;
        private Integer idSanPham;
    }
}