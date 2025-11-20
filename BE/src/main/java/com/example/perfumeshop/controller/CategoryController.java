package com.example.perfumeshop.controller;

import com.example.perfumeshop.service.CategoryService;
import com.example.perfumeshop.service.ProductService;
import com.example.perfumeshop.dto.CategoryRequest;
import com.example.perfumeshop.dto.CategoryResponse;
import com.example.perfumeshop.dto.ProductResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    public ResponseEntity<?> getProductsByCategory(
            @PathVariable("id") Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size);

            // Dùng phương thức phân trang (tốt hơn)
            Page<ProductResponse> result = productService.getProductsByCategoryId(categoryId, pageable);

            return ResponseEntity.ok(result);

            // Nếu bạn chưa muốn dùng phân trang, dùng dòng dưới thay thế:
            // List<ProductResponse>
            // List<ProductResponse> result = productService.getProductsByCategoryId(categoryId);
            // return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("Lỗi khi lấy sản phẩm của danh mục ID = " + categoryId + ": " + e.getMessage());
        }
    }
}