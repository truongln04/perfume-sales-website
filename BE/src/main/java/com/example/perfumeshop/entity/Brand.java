package com.example.perfumeshop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Integer idthuonghieu;

    @Column(name = "ten_thuong_hieu", nullable = false, length = 100)
    private String tenthuonghieu;

    @Column(name = "quoc_gia", length = 100)
    private String quocgia;

    @Column(name = "logo", columnDefinition = "TEXT")
    private String logo;
}
