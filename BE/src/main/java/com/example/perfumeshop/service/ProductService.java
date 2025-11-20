package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.ProductRequest;
import com.example.perfumeshop.dto.ProductResponse;
import com.example.perfumeshop.entity.Product;
import com.example.perfumeshop.entity.Warehouse;
import com.example.perfumeshop.repository.ProductRepository;
import com.example.perfumeshop.repository.WarehouseRepository;
import com.example.perfumeshop.repository.CategoryRepository;
import com.example.perfumeshop.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public ProductResponse create(ProductRequest request) {
        Product product = toEntity(request);

        // ✅ Gán danh mục và thương hiệu trước khi lưu
        if (request.getIdDanhMuc() != null) {
            product.setDanhMuc(categoryRepository.findById(request.getIdDanhMuc()).orElse(null));
        }

        if (request.getIdthuonghieu() != null) {
            product.setThuonghieu(brandRepository.findById(request.getIdthuonghieu()).orElse(null));
        }

        Product savedProduct = productRepository.save(product);

        // ✅ Tạo kho hàng ban đầu
        Warehouse warehouse = new Warehouse();
        warehouse.setSanPham(savedProduct);
        warehouse.setSoLuongNhap(0);
        warehouse.setSoLuongBan(0);
        warehouseRepository.save(warehouse);

        return toResponse(savedProduct);
    }
    public ProductResponse getById(Integer id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        return toResponse(product);
    }

    public ProductResponse update(Integer id, ProductRequest request) {
        Product product = productRepository.findById(id).orElseThrow();

        BeanUtils.copyProperties(request, product, "idSanPham", "ngayTao");

        // ✅ Cập nhật danh mục và thương hiệu nếu có
        if (request.getIdDanhMuc() != null) {
            product.setDanhMuc(categoryRepository.findById(request.getIdDanhMuc()).orElse(null));
        }

        if (request.getIdthuonghieu() != null) {
            product.setThuonghieu(brandRepository.findById(request.getIdthuonghieu()).orElse(null));
        }

        return toResponse(productRepository.save(product));
    }

    public void delete(Integer id) {
        productRepository.deleteById(id);
    }

    public List<ProductResponse> search(String keyword) {
        return productRepository.findByTenSanPhamContainingIgnoreCase(keyword).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    private Product toEntity(ProductRequest request) {
        Product product = new Product();
        BeanUtils.copyProperties(request, product);
        return product;
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        BeanUtils.copyProperties(product, response);

        // ✅ Gán tên danh mục và thương hiệu
        if (product.getDanhMuc() != null) {
            response.setIdDanhMuc(product.getDanhMuc().getIdDanhMuc());
            response.setTenDanhMuc(product.getDanhMuc().getTenDanhMuc());
        }

        if (product.getThuonghieu() != null) {
            response.setIdthuonghieu(product.getThuonghieu().getIdthuonghieu());
            response.setTenthuonghieu(product.getThuonghieu().getTenthuonghieu());
        }

        // ✅ Gán số lượng tồn từ kho
        Warehouse warehouse = warehouseRepository.findBySanPham(product);
        response.setSoLuongTon(warehouse != null
            ? warehouse.getSoLuongNhap() - warehouse.getSoLuongBan()
            : 0);

        return response;
    }

    public List<ProductResponse> getProductsByBrandId(Integer brandId) {
        return productRepository.findByThuonghieu_Idthuonghieu(brandId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    // Trong ProductService.java
    public List<ProductResponse> getProductsByCategoryId(Integer categoryId) {
        return productRepository.findByDanhMuc_IdDanhMuc(categoryId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
}
