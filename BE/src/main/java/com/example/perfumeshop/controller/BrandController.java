package com.example.perfumeshop.controller;
import com.example.perfumeshop.dto.BrandRequest;
import com.example.perfumeshop.dto.BrandResponse;
import com.example.perfumeshop.service.BrandService;
import com.example.perfumeshop.service.ProductService;
import com.example.perfumeshop.dto.ProductResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/brands")
public class BrandController {
    private final BrandService service;
    private final ProductService productService;

    @PostMapping
    public BrandResponse create(@Valid @RequestBody BrandRequest request) {
        return service.createBrand(request);
    }

    @PutMapping("/{id}")
    public BrandResponse update(@PathVariable Integer id, @Valid @RequestBody BrandRequest request) {
        return service.updateBrand(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.deleteBrand(id);
    }

    @GetMapping
    public List<BrandResponse> getAll() {
        return service.getAllBrands();
    }

    @GetMapping("/search")
    public List<BrandResponse> search(@RequestParam String keyword) {
        return service.searchBrands(keyword);
    }

    @GetMapping("/{id}")
    public BrandResponse getById(@PathVariable Integer id) {
        return service.getBrandById(id);
 
    }    
    @GetMapping("/{id}/products")
    public List<ProductResponse> getProductsByBrandId(@PathVariable Integer id) {
        return productService.getProductsByBrandId(id);
    }
}