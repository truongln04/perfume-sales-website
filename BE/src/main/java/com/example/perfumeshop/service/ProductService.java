package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.ProductRequest;
import com.example.perfumeshop.dto.ProductResponse;
import com.example.perfumeshop.entity.Product;
import com.example.perfumeshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;

    public List<ProductResponse> getAll() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse create(ProductRequest req) {
        Product entity = toEntity(req);
        return toResponse(repo.save(entity));
    }

    public ProductResponse update(Integer id, ProductRequest req) {
        Product entity = repo.findById(id).orElseThrow();
        BeanUtils.copyProperties(req, entity, "idSanPham", "ngayTao");
        return toResponse(repo.save(entity));
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }

    public List<ProductResponse> search(String keyword) {
        return repo.findByTenSanPhamContainingIgnoreCase(keyword).stream()
            .map(this::toResponse).collect(Collectors.toList());
    }

    private Product toEntity(ProductRequest req) {
        Product entity = new Product();
        BeanUtils.copyProperties(req, entity);
        return entity;
    }

    private ProductResponse toResponse(Product entity) {
        ProductResponse res = new ProductResponse();
        BeanUtils.copyProperties(entity, res);
        res.setGiaSauKm(entity.getGiaSauKm());
        return res;
    }
}
