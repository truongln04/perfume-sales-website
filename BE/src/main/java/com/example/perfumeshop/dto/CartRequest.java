package com.example.perfumeshop.dto;
import lombok.Data;

@Data

public class CartRequest {    
    private Integer idTaiKhoan;    
    private Integer idSanPham;       
    private Integer soLuong;
    private Long donGia;        
}
