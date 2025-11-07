package com.example.perfumeshop.entity;

import jakarta.persistence.*;
import lombok.*;

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
    private Integer id;

    @Column(name = "ten_ncc", nullable = false, length = 150)
    private String name;

    @Column(name = "dia_chi", length = 255)
    private String address;

    @Column(name = "sdt", length = 15)
    private String phone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String note;
}