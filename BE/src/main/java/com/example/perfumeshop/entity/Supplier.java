package com.example.perfumeshop.entity;

import jakarta.persistence.*;
import lombok.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "nha_cung_cap")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ncc")
    private Integer idNcc;


    @Column(name = "ten_ncc", nullable = false, length = 150)
    private String tenNcc;

    @Column(name = "dia_chi", length = 255)
    private String diaChi;

    @Column(name = "sdt", length = 15)
    private String sdt;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;
}