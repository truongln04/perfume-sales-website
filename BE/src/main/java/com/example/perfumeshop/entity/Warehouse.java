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
    @MapsId
    @JoinColumn(name = "id_san_pham")
    private Product sanPham;
@Builder.Default
    @Column(name = "so_luong_nhap")
    private Integer soLuongNhap = 0;
@Builder.Default
    @Column(name = "so_luong_ban")
    private Integer soLuongBan = 0;
}

