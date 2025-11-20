package com.example.perfumeshop.entity;


import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gio_hang")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gh")
    private Integer idGh;

    @ManyToOne
    @JoinColumn(name = "id_tai_khoan", nullable = false)
    private Account taiKhoan;

    @ManyToOne
    @JoinColumn(name = "id_san_pham", nullable = false)
    private Product sanPham;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "don_gia")
    private Long donGia;
}

