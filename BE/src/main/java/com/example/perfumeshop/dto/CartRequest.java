package com.example.perfumeshop.dto;
import lombok.*;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor

public class CartRequest {    
    private Integer idTaiKhoan;    
     private List<CartDetailRequest> chiTietGioHang;       
}
