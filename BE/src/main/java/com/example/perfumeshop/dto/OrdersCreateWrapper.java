package com.example.perfumeshop.dto;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import lombok.AllArgsConstructor;
@Data
@NoArgsConstructor  
@AllArgsConstructor
public class OrdersCreateWrapper {
    private OrdersRequest request;
    private List<OrdersDetailRequest> chiTietDonHang;

}
