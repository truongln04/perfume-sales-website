package com.example.perfumeshop.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

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
    @JoinColumn(name = "id_tai_khoan", nullable = false, unique = true)
    private Account taiKhoan;

    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartDetail> chiTietGioHang = new java.util.ArrayList<>();

    @PrePersist
public void prePersist() {
    if (ngayTao == null) {
        ngayTao = LocalDateTime.now();
    }
}
}

