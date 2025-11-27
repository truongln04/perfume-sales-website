package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.BrandRequest;
import com.example.perfumeshop.dto.BrandResponse;
import com.example.perfumeshop.entity.Brand;
import com.example.perfumeshop.repository.BrandRepository;
import com.example.perfumeshop.repository.ProductRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository repository;
    private final ProductRepository productRepository;

    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ0-9\\s]{3,40}$");
    private static final Pattern COUNTRY_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ]{3,40}$");
    private static final Pattern LOGO_PATTERN = Pattern.compile("^https?://.+\\.(png|jpe?g|gif|webp|svg)(\\?.*)?$",
            Pattern.CASE_INSENSITIVE);

    // ==================== CREATE BRAND ====================
    public BrandResponse createBrand(BrandRequest request) {
        validateCreateRequest(request);

        Brand brand = Brand.builder()
                .tenthuonghieu(request.getTenthuonghieu().trim())
                .quocgia(request.getQuocgia().trim())
                .logo(request.getLogo() != null ? request.getLogo().trim() : null)
                .build();

        return toResponse(repository.save(brand));
    }

    // ==================== UPDATE BRAND ====================
    public BrandResponse updateBrand(Integer id, BrandRequest request) {
        Brand brand = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với ID: " + id));

        validateUpdateRequest(request, brand.getTenthuonghieu());

        brand.setTenthuonghieu(request.getTenthuonghieu().trim());
        brand.setQuocgia(request.getQuocgia().trim());
        brand.setLogo(request.getLogo() != null ? request.getLogo().trim() : null);

        return toResponse(repository.save(brand));
    }

    // ==================== DELETE ====================
    @Transactional
    public void deleteBrand(Integer id) {
        if (!repository.existsById(id)) {
            throw new ValidationException("Không tìm thấy thương hiệu để xóa");
        }
        boolean existsProduct = productRepository.existsByThuonghieu_Idthuonghieu(id);
        if (existsProduct) {
            throw new ValidationException("Không thể xóa thương hiệu vì đang có sản phẩm tham chiếu");
        }
        repository.deleteById(id);
    }

    // ==================== GET ALL & SEARCH ====================
    public List<BrandResponse> getAllBrands() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BrandResponse> searchBrands(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new ValidationException("Từ khóa tìm kiếm không được để trống");
        }
        return repository.searchByNameOrCountry(keyword.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BrandResponse getBrandById(Integer id) {
        Brand brand = repository.findById(id)
                .orElseThrow(() -> new ValidationException("Không tìm thấy thương hiệu với ID: " + id));
        return toResponse(brand);
    }

    // ==================== VALIDATION METHODS ====================

    private void validateCreateRequest(BrandRequest request) {
        // 1. Tên thương hiệu
        if (request.getTenthuonghieu() == null || request.getTenthuonghieu().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên thương hiệu");
        }
        String tenThuongHieu = request.getTenthuonghieu().trim();
        if (!NAME_PATTERN.matcher(tenThuongHieu).matches()) {
            throw new ValidationException("Tên thương hiệu phải từ 3-40 ký tự, chỉ chứa chữ cái và số");
        }
        if (repository.existsByTenthuonghieuIgnoreCase(tenThuongHieu)) {
            throw new ValidationException("Tên thương hiệu '" + tenThuongHieu + "' đã tồn tại");
        }

        // 2. Quốc gia
        if (request.getQuocgia() == null || request.getQuocgia().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập quốc gia");
        }
        String quocGia = request.getQuocgia().trim();
        if (!COUNTRY_PATTERN.matcher(quocGia).matches()) {
            throw new ValidationException("Quốc gia phải từ 3-40 ký tự, chỉ chứa chữ cái");
        }

        // 3. Logo
        if (request.getLogo() == null || request.getLogo().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập logo thương hiệu");
        }
        String logo = request.getLogo().trim();
        if (!LOGO_PATTERN.matcher(logo).matches()) {
            throw new ValidationException("Logo phải là URL hình ảnh hợp lệ");
        }
    }

    private void validateUpdateRequest(BrandRequest request, String currentTenThuongHieu) {
        // 1. Tên thương hiệu
        if (request.getTenthuonghieu() == null || request.getTenthuonghieu().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên thương hiệu");
        }
        String tenThuongHieu = request.getTenthuonghieu().trim();
        if (!NAME_PATTERN.matcher(tenThuongHieu).matches()) {
            throw new ValidationException("Tên thương hiệu phải từ 3-33 ký tự, chỉ chứa chữ cái và số");
        }
        if (!tenThuongHieu.equalsIgnoreCase(currentTenThuongHieu)
                && repository.existsByTenthuonghieuIgnoreCase(tenThuongHieu)) {
            throw new ValidationException(
                    "Tên thương hiệu '" + tenThuongHieu + "' đã được sử dụng bởi thương hiệu khác");
        }

        // 2. Quốc gia
        if (request.getQuocgia() == null || request.getQuocgia().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập quốc gia");
        }
        String quocGia = request.getQuocgia().trim();
        if (!COUNTRY_PATTERN.matcher(quocGia).matches()) {
            throw new ValidationException("Quốc gia phải từ 3-33 ký tự, chỉ chứa chữ cái");
        }

        // 3. Logo (tùy chọn khi sửa)
        if (request.getLogo() == null || request.getLogo().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập logo thương hiệu");
        }
        String logo = request.getLogo().trim();
        if (!LOGO_PATTERN.matcher(logo).matches()) {
            throw new ValidationException("Logo phải là URL hình ảnh hợp lệ (png, jpg, jpeg, gif, webp, svg)");
        }
    }

    // ==================== UTILITY ====================
    private BrandResponse toResponse(Brand brand) {
        return BrandResponse.builder()
                .idthuonghieu(brand.getIdthuonghieu())
                .tenthuonghieu(brand.getTenthuonghieu())
                .quocgia(brand.getQuocgia())
                .logo(brand.getLogo())
                .build();
    }
}