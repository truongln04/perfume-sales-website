package com.example.perfumeshop.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "chi_tiet_gio_hang")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ctgh")
    private Integer idCtgh;

    @ManyToOne
    @JoinColumn(name = "id_gh", nullable = false)
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "id_san_pham", nullable = false)
    private Product sanPham;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "don_gia", nullable = false)
    private Long donGia;
}
