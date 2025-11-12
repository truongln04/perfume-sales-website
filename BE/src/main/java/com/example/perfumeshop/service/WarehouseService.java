package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.WarehouseResponse;
import com.example.perfumeshop.entity.Warehouse;
import com.example.perfumeshop.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository repository;

    public List<WarehouseResponse> getAll() {
        return repository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    public List<WarehouseResponse> searchByTenSanPham(String keyword) {
        return repository.searchByTenSanPham(keyword).stream()
            .map(this::toResponse)
            .toList();
    }

    private WarehouseResponse toResponse(Warehouse kho) {
        WarehouseResponse item = new WarehouseResponse();
        item.setIdSanPham(kho.getIdSanPham());
        item.setTenSanPham(kho.getSanPham().getTenSanPham());
        item.setSoLuongNhap(kho.getSoLuongNhap());
        item.setSoLuongBan(kho.getSoLuongBan());
        return item;
    }
}
