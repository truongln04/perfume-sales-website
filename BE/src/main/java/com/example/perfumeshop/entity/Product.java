package com.example.perfumeshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "san_pham")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_san_pham")
    private Integer idSanPham;

    @Column(name = "ten_san_pham", nullable = false, length = 150)
    private String tenSanPham;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "hinh_anh", columnDefinition = "MEDIUMTEXT")
    private String hinhAnh;

    @ManyToOne
    @JoinColumn(name = "id_danh_muc")
    private Category danhMuc;

    @ManyToOne
    @JoinColumn(name = "id_thuong_hieu")
    private Brand thuonghieu;

    @ManyToOne
    @JoinColumn(name = "id_ncc")
    private Supplier nhaCungCap;

   

    @Column(name = "gia_ban", precision = 12, scale = 0)
    private BigDecimal giaBan;

    @Column(name = "km_phan_tram", precision = 5, scale = 2)
    private BigDecimal kmPhanTram;

    // @Column(name = "gia_sau_km", precision = 12, scale = 0, insertable = false, updatable = false)
    // private BigDecimal giaSauKm;
    
    

    @Column(name = "trang_thai")
    private Boolean trangThai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @OneToOne(mappedBy = "sanPham", cascade = CascadeType.ALL)
@JsonIgnore
private Warehouse kho;


    @PrePersist
protected void onCreate() {
    this.ngayTao = LocalDateTime.now();
}

}
