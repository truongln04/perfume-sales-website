package com.example.perfumeshop.dto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierRequest {

    private String tenNcc;


    private String diaChi;


    private String sdt;

    private String email;

    private String ghiChu;
}