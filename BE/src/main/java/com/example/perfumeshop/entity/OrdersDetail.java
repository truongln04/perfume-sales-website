package com.example.perfumeshop.entity;

import java.io.Serializable;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chi_tiet_don_hang")
@Getter  // ← Thay @Data bằng các cái riêng
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"donHang", "sanPham"})  // ← LOẠI TRỪ FIELD NÀY KHỎI toString()
@EqualsAndHashCode(exclude = {"donHang", "sanPham"})  // ← LOẠI TRỪ KHỎI equals()/hashCode()
public class OrdersDetail implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ctdh")
    private Integer idCtdh;

    @ManyToOne
    @JoinColumn(
        name = "id_don_hang",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ctdh_donhang")
    )
    @JsonBackReference  // ← THÊM NÀY CHO PHÍA CON (không serialize ngược lại)
    private Orders donHang;

    @ManyToOne
    @JoinColumn(
        name = "id_san_pham",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ctdh_sanpham")
    )
    private Product sanPham;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "don_gia", precision = 12, scale = 0)
    private BigDecimal donGia;

    // @Column(name = "thanh_tien", precision = 14, scale = 0)
    // private BigDecimal thanhTien;
}