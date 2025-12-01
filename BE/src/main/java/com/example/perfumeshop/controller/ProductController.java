package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.ProductRequest;
import com.example.perfumeshop.dto.ProductResponse;
import com.example.perfumeshop.service.ProductService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @GetMapping
    public List<ProductResponse> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody ProductRequest req) {
        ProductResponse response = service.create(req);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Integer id) {
        ProductResponse response = service.getById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Integer id, @RequestBody ProductRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.deleteProduct(id);
    }

    @GetMapping("/search")
    public List<ProductResponse> search(@RequestParam String keyword) {
        return service.search(keyword);
    }

    
    @GetMapping("/active")
public List<ProductResponse> getActiveProducts() {
    return service.getActiveProducts();
}



}
