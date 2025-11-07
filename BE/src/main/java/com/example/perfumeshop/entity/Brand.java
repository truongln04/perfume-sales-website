package com.example.perfumeshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "thuong_hieu")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_thuong_hieu")
    private Integer id;

    @Column(name = "ten_thuong_hieu", nullable = false, length = 100)
    private String name;

    @Column(name = "quoc_gia", length = 100)
    private String country;

    @Column(name = "logo", columnDefinition = "TEXT")
    private String logo;
}
