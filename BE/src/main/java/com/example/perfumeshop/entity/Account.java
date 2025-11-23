package com.example.perfumeshop.entity;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tai_khoan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tai_khoan")
    private Integer idTaiKhoan;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "ten_hien_thi", length = 100)
    private String tenHienThi;

    @Column(name = "sdt", length = 10)
    private String sdt;

    @Column(name = "google_id", length = 255)
    private String googleId;

    @Column(name = "anh_dai_dien", columnDefinition = "MEDIUMTEXT")
    private String anhDaiDien;

    @Column(name = "mat_khau", length = 255)
    private String matKhau;

    @Enumerated(EnumType.STRING)
    @Column(name = "vai_tro", nullable = false)
    @Builder.Default
    private VaiTro vaiTro = VaiTro.KHACHHANG;

    @OneToMany(mappedBy = "taiKhoan") 
    @JsonManagedReference 
    @Builder.Default 
    private java.util.List<Orders> donHangs = new java.util.ArrayList<>();

    public enum VaiTro {
        ADMIN,
        NHANVIEN,
        KHACHHANG
    }
}
