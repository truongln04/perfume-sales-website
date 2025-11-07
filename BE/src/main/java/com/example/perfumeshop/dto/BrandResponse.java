package com.example.perfumeshop.dto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandResponse {
    private Integer id;
    private String name;
    private String country;
    private String logo;
}
