package com.example.perfumeshop.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.perfumeshop.dto.CategoryRequest;
import com.example.perfumeshop.dto.CategoryResponse;
import com.example.perfumeshop.entity.Category;
import com.example.perfumeshop.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setTenDanhMuc(request.getTenDanhMuc());
        category.setMoTa(request.getMoTa());
        Category saved = repository.save(category);
        return toResponse(saved);
    }

    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category existing = repository.findById(id).orElse(null);
        if (existing != null) {
            existing.setTenDanhMuc(request.getTenDanhMuc());
            existing.setMoTa(request.getMoTa());
            Category updated = repository.save(existing);
            return toResponse(updated);
        }
        return null;
    }

    public void deleteCategory(Integer id) {
        repository.deleteById(id);
    }

    public List<CategoryResponse> getAllCategories() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> searchCategories(String keyword) {
        return repository.findByTenDanhMucContainingIgnoreCase(keyword)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Integer id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElse(null);
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setIdDanhMuc(category.getIdDanhMuc());
        response.setTenDanhMuc(category.getTenDanhMuc());
        response.setMoTa(category.getMoTa());
        return response;
    }
}