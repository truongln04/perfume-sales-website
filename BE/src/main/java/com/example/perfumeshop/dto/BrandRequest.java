package com.example.perfumeshop.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandRequest {
    @NotBlank(message = "Tên thương hiệu không được để trống")
    @Size(max = 100, message = "Tên thương hiệu tối đa 100 ký tự")
    private String name;

    @Size(max = 100, message = "Quốc gia tối đa 100 ký tự")
    private String country;

    private String logo;
}
