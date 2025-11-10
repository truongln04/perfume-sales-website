package com.example.perfumeshop.service;

import com.example.perfumeshop.entity.Warehouse;
import com.example.perfumeshop.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository repository;

    public List<Warehouse> getAll() {
        return repository.findAll();
    }

    public List<Warehouse> searchByTenSanPham(String keyword) {
        return repository.searchByTenSanPham(keyword);
    }

   
}
