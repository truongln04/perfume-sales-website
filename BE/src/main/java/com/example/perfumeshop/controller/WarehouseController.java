package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.WarehouseResponse;
import com.example.perfumeshop.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouse")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService service;

    @GetMapping
    public List<WarehouseResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/search-by-name")
    public List<WarehouseResponse> searchByTenSanPham(@RequestParam String keyword) {
        return service.searchByTenSanPham(keyword);
    }
}
