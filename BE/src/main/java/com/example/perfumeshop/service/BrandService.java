package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.BrandRequest;
import com.example.perfumeshop.dto.BrandResponse;
import com.example.perfumeshop.entity.Brand;
import com.example.perfumeshop.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService  {
        private final BrandRepository repository;

    public BrandResponse createBrand(BrandRequest request) {
        Brand brand = Brand.builder()
                .name(request.getName())
                .country(request.getCountry())
                .logo(request.getLogo())
                .build();
        return toResponse(repository.save(brand));
    }

    public BrandResponse updateBrand(Integer id, BrandRequest request) {
        Brand brand = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));
        brand.setName(request.getName());
        brand.setCountry(request.getCountry());
        brand.setLogo(request.getLogo());
        return toResponse(repository.save(brand));
    }

    public void deleteBrand(Integer id) {
        repository.deleteById(id);
    }

    public List<BrandResponse> getAllBrands() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BrandResponse> searchBrands(String keyword) {
        return repository.searchByNameOrCountry(keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BrandResponse getBrandById(Integer id) {
        Brand brand = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));
        return toResponse(brand);
    }

    private BrandResponse toResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .country(brand.getCountry())
                .logo(brand.getLogo())
                .build();
    }
}