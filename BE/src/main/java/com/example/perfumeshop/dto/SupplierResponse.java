package com.example.perfumeshop.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierResponse {

    private Integer id;
    private String name;
    private String address;
    private String phone;
    private String email;
    private String note;
}