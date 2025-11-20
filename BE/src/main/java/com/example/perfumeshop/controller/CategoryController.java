package com.example.perfumeshop.controller;

import com.example.perfumeshop.service.CategoryService;
import com.example.perfumeshop.dto.CategoryRequest;
import com.example.perfumeshop.dto.CategoryResponse;
import com.example.perfumeshop.dto.ProductResponse;
import com.example.perfumeshop.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {
   private final CategoryService service;
   private final ProductService productService;

    @PostMapping
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        return service.createCategory(request);
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Integer id, @Valid @RequestBody CategoryRequest request) {
        return service.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.deleteCategory(id);
    }

    @GetMapping
    public List<CategoryResponse> getAll() {
        return service.getAllCategories();
    }

    @GetMapping("/search")
    public List<CategoryResponse> search(@RequestParam String keyword) {
        return service.searchCategories(keyword);
    }

    @GetMapping("/{id}")
    public CategoryResponse getById(@PathVariable Integer id) {
        return service.getCategoryById(id);
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable("id") Integer categoryId) {
        List<ProductResponse> products = productService.getProductsByCategoryId(categoryId);
        return ResponseEntity.ok(products);
    }
}