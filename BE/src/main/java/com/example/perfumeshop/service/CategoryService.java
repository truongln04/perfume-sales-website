package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.CategoryRequest;
import com.example.perfumeshop.dto.CategoryResponse;
import com.example.perfumeshop.entity.Category;
import com.example.perfumeshop.repository.*;

import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;
    private final ProductRepository productRepository;

    // ==================== REGEX PATTERNS – CHUẨN NHƯ BRAND SERVICE
    // ====================
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ\\s]{3,40}$");
    private static final Pattern DESCRIPTION_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ0-9\\s]{8,}$");

    // ==================== CREATE CATEGORY ====================
    public CategoryResponse createCategory(CategoryRequest request) {
        validateCreateRequest(request);

        Category category = new Category();
        category.setTenDanhMuc(request.getTenDanhMuc().trim());
        category.setMoTa(request.getMoTa() != null ? request.getMoTa().trim() : null);

        Category saved = repository.save(category);
        return toResponse(saved);
    }

    // ==================== UPDATE CATEGORY ====================
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));

        validateUpdateRequest(request, category.getTenDanhMuc());

        category.setTenDanhMuc(request.getTenDanhMuc().trim());
        category.setMoTa(request.getMoTa() != null ? request.getMoTa().trim() : null);

        Category updated = repository.save(category);
        return toResponse(updated);
    }

    // ==================== DELETE ====================
    @Transactional
public void deleteCategory(Integer id) {
    if (!repository.existsById(id)) {
        throw new ValidationException("Không tìm thấy danh mục để xóa");
    }

    boolean existsProduct = productRepository.existsByDanhMuc_IdDanhMuc(id);
    if (existsProduct) {
        throw new ValidationException("Không thể xóa danh mục vì đang có sản phẩm tham chiếu");
    }

    repository.deleteById(id);
}


    // ==================== GET ALL & SEARCH ====================
    public List<CategoryResponse> getAllCategories() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new ValidationException("Từ khóa tìm kiếm không được để trống");
        }
        return repository.findByTenDanhMucContainingIgnoreCase(keyword.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Integer id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ValidationException("Không tìm thấy danh mục với ID: " + id));
    }

    // ==================== VALIDATION METHODS – GIỐNG BRAND SERVICE
    // ====================
    private void validateCreateRequest(CategoryRequest request) {
        // 1. Tên danh mục: bắt buộc + định dạng
        if (request.getTenDanhMuc() == null || request.getTenDanhMuc().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên danh mục");
        }
        String tenDanhMuc = request.getTenDanhMuc().trim();
        if (!NAME_PATTERN.matcher(tenDanhMuc).matches()) {
            throw new ValidationException("Tên danh mục phải từ 3-40 ký tự, chỉ chứa chữ cái, số và khoảng trắng");
        }
        if (repository.existsByTenDanhMucIgnoreCase(tenDanhMuc)) {
            throw new ValidationException("Tên danh mục '" + tenDanhMuc + "' đã tồn tại");
        }

        // 2. Mô tả: tùy chọn, nhưng nếu có thì không quá 500 ký tự
        if (request.getMoTa() == null || request.getMoTa().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập mô tả");
        }
        String moTa = request.getMoTa().trim();
        if (!DESCRIPTION_PATTERN.matcher(moTa).matches()) {
            throw new ValidationException("Mô tả ít nhất 8 ký tự trở lên");
        }
    }

    private void validateUpdateRequest(CategoryRequest request, String currentTenDanhMuc) {
        // 1. Tên danh mục
        if (request.getTenDanhMuc() == null || request.getTenDanhMuc().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên danh mục");
        }
        String tenDanhMuc = request.getTenDanhMuc().trim();
        if (!NAME_PATTERN.matcher(tenDanhMuc).matches()) {
            throw new ValidationException("Tên danh mục phải từ 3-40 ký tự, chỉ chứa chữ cái, số và khoảng trắng");
        }
        if (!tenDanhMuc.equalsIgnoreCase(currentTenDanhMuc)
                && repository.existsByTenDanhMucIgnoreCase(tenDanhMuc)) {
            throw new ValidationException("Tên danh mục '" + tenDanhMuc + "' đã được sử dụng bởi danh mục khác");
        }

        // 2. Mô tả
        if (request.getMoTa() == null || request.getMoTa().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập mô tả");
        }
        String moTa = request.getMoTa().trim();
        if (!DESCRIPTION_PATTERN.matcher(moTa).matches()) {
            throw new ValidationException("Mô tả ít nhất 8 ký tự trở lên");
        }
    }

    // ==================== UTILITY ====================
    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setIdDanhMuc(category.getIdDanhMuc());
        response.setTenDanhMuc(category.getTenDanhMuc());
        response.setMoTa(category.getMoTa());
        return response;
    }
}