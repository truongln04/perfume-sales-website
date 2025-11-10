package com.example.perfumeshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kho")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {

    @Id
    @Column(name = "id_san_pham")
    private Integer idSanPham;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_san_pham", insertable = false, updatable = false)
    private Product sanPham;

    @Column(name = "so_luong_nhap")
    private Integer soLuongNhap;

    @Column(name = "so_luong_ban")
    private Integer soLuongBan;

    @Column(name = "ton_hien_tai")
    private Integer tonHienTai;
}
