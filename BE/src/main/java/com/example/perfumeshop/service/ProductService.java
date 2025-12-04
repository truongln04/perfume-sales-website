package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.ProductRequest;
import com.example.perfumeshop.dto.ProductResponse;
import com.example.perfumeshop.entity.*;
import com.example.perfumeshop.repository.*;

import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

     private final OrdersDetailRepository orderDetailRepo;
     private final ReceiptDetailRepository receiptDetailRepo;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SupplierRepository supplierRepository;

    // ==================== REGEX PATTERNS ====================
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ0-9\\s\\-&'()]{3,100}$");
    private static final Pattern DESCRIPTION_PATTERN = Pattern.compile("^.{10,}$");
    private static final Pattern IMAGE_PATTERN = Pattern.compile(
            "^(https?://.+\\.(png|jpe?g|gif|webp|svg)(\\?.*)?$|data:image/(png|jpe?g|gif|webp|svg);base64,[A-Za-z0-9+/=]+)$",
            Pattern.CASE_INSENSITIVE);

    // ==================== CREATE PRODUCT ====================
    public ProductResponse create(ProductRequest request) {
        validateCreateRequest(request);

        Product product = toEntity(request);

        // Gán danh mục và thương hiệu
        product.setDanhMuc(categoryRepository.findById(request.getIdDanhMuc())
                .orElseThrow(() -> new ValidationException("Không tìm thấy danh mục")));
                
        product.setThuonghieu(brandRepository.findById(request.getIdthuonghieu())
                .orElseThrow(() -> new ValidationException("Không tìm thấy thương hiệu")));

        product.setNhaCungCap(supplierRepository.findById(request.getIdNcc())
                .orElseThrow(() -> new ValidationException("Không tìm thấy nhà cung cấp")));

        Product savedProduct = productRepository.save(product);

        // Tạo kho hàng ban đầu
        Warehouse warehouse = new Warehouse();
        warehouse.setSanPham(savedProduct);
        warehouse.setSoLuongNhap(0);
        warehouse.setSoLuongBan(0);
        warehouseRepository.save(warehouse);

        return toResponse(savedProduct);
    }

    // ==================== UPDATE PRODUCT ====================
    public ProductResponse update(Integer id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Không tìm thấy sản phẩm với ID: " + id));

        validateUpdateRequest(request, product.getTenSanPham());

        BeanUtils.copyProperties(request, product, "idSanPham", "ngayTao");

        if (request.getIdDanhMuc() != null) {
            product.setDanhMuc(categoryRepository.findById(request.getIdDanhMuc())
                    .orElseThrow(() -> new ValidationException("Không tìm thấy danh mục")));
        }
        if (request.getIdthuonghieu() != null) {
            product.setThuonghieu(brandRepository.findById(request.getIdthuonghieu())
                    .orElseThrow(() -> new ValidationException("Không tìm thấy thương hiệu")));
        }

        if (request.getIdNcc() != null) {
            product.setNhaCungCap(supplierRepository.findById(request.getIdNcc())
                    .orElseThrow(() -> new ValidationException("Không tìm thấy nhà cung cấp")));
        }

        return toResponse(productRepository.save(product));
    }

    // ==================== DELETE ====================
@Transactional
public void deleteProduct(Integer id) {
    Product sp = productRepository.findById(id)
            .orElseThrow(() -> new ValidationException("Không tìm thấy sản phẩm với ID: " + id));

    // Kiểm tra sản phẩm có liên quan đến đơn hàng không
    boolean hasOrders = orderDetailRepo.existsBySanPham(sp);
    if (hasOrders) {
        throw new ValidationException(
            "Không thể xóa sản phẩm " + sp.getTenSanPham() +
            " vì đã có đơn hàng liên quan"
        );
    }

    // Kiểm tra sản phẩm có liên quan đến phiếu nhập không
    boolean hasReceipts = receiptDetailRepo.existsBySanPham(sp);
    if (hasReceipts) {
        throw new ValidationException(
            "Không thể xóa sản phẩm " + sp.getTenSanPham() +
            " vì đã có phiếu nhập liên quan"
        );
    }

    productRepository.delete(sp);
}



    // ==================== GET ALL & SEARCH ====================
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new ValidationException("Từ khóa tìm kiếm không được để trống");
        }
        return productRepository.findByTenSanPhamContainingIgnoreCase(keyword.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getById(Integer id) {
        return productRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ValidationException("Không tìm thấy sản phẩm với ID: " + id));
    }

    // ==================== VALIDATION – CHỈ DÙNG CÁC FIELD CHẮC CHẮN CÓ
    // ====================
    private void validateCreateRequest(ProductRequest request) {
        // 1. Tên sản phẩm
        if (request.getTenSanPham() == null || request.getTenSanPham().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên sản phẩm");
        }
        String tenSanPham = request.getTenSanPham().trim();
        if (!NAME_PATTERN.matcher(tenSanPham).matches()) {
            throw new ValidationException(
                    "Tên sản phẩm phải từ 3-100 ký tự, chỉ chứa chữ cái, số, khoảng trắng và ký tự &-'()");
        }
        if (productRepository.existsByTenSanPhamIgnoreCase(tenSanPham)) {
            throw new ValidationException("Tên sản phẩm '" + tenSanPham + "' đã tồn tại");
        }

        // 2. Mô tả
        if (request.getMoTa() == null || request.getMoTa().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập mô tả sản phẩm");
        }
        String moTa = request.getMoTa().trim();
        if (!DESCRIPTION_PATTERN.matcher(moTa).matches()) {
            throw new ValidationException("Mô tả sản phẩm phải có ít nhất 10 ký tự");
        }

        // 4. Danh mục & thương hiệu (bắt buộc)
        if (request.getIdDanhMuc() == null) {
            throw new ValidationException("Vui lòng chọn danh mục");
        }
        if (request.getIdthuonghieu() == null) {
            throw new ValidationException("Vui lòng chọn thương hiệu");
        }

        if (request.getIdNcc() == null) {
            throw new ValidationException("Vui lòng chọn nhà cung cấp");
        }

        // 5. Hình ảnh (bắt buộc)
        if (request.getHinhAnh() == null || request.getHinhAnh().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập hình ảnh sản phẩm");
        }
        if (!IMAGE_PATTERN.matcher(request.getHinhAnh().trim()).matches()) {
            throw new ValidationException("URL hình ảnh không hợp lệ (png, jpg, jpeg, gif, webp, svg)");
        }
    }

    private void validateUpdateRequest(ProductRequest request, String currentTenSanPham) {
        // 1. Tên sản phẩm
        if (request.getTenSanPham() == null || request.getTenSanPham().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên sản phẩm");
        }
        String tenSanPham = request.getTenSanPham().trim();
        if (!NAME_PATTERN.matcher(tenSanPham).matches()) {
            throw new ValidationException(
                    "Tên sản phẩm phải từ 3-100 ký tự, chỉ chứa chữ cái, số, khoảng trắng và ký tự &-'()");
        }
        if (!tenSanPham.equalsIgnoreCase(currentTenSanPham)
                && productRepository.existsByTenSanPhamIgnoreCase(tenSanPham)) {
            throw new ValidationException("Tên sản phẩm '" + tenSanPham + "' đã được sử dụng");
        }

        // 2. Mô tả
        if (request.getMoTa() == null || request.getMoTa().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập mô tả sản phẩm");
        }
        String moTa = request.getMoTa().trim();
        if (!DESCRIPTION_PATTERN.matcher(moTa).matches()) {
            throw new ValidationException("Mô tả sản phẩm phải có ít nhất 10 ký tự");
        }

        // 3. Giá bán
        if (request.getGiaBan() != null && request.getGiaBan().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Giá bán phải lớn hơn 0");
        }

        // 4. Hình ảnh (tùy chọn khi sửa)
        if (request.getHinhAnh() != null && !request.getHinhAnh().trim().isEmpty()) {
            if (!IMAGE_PATTERN.matcher(request.getHinhAnh().trim()).matches()) {
                throw new ValidationException("URL hình ảnh không hợp lệ");
            }
        }
    }

    // ==================== UTILITY ====================
    private Product toEntity(ProductRequest request) {
        Product product = new Product();
        BeanUtils.copyProperties(request, product);
        return product;
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        BeanUtils.copyProperties(product, response);

        if (product.getDanhMuc() != null) {
            response.setIdDanhMuc(product.getDanhMuc().getIdDanhMuc());
            response.setTenDanhMuc(product.getDanhMuc().getTenDanhMuc());
        }
        if (product.getThuonghieu() != null) {
            response.setIdthuonghieu(product.getThuonghieu().getIdthuonghieu());
            response.setTenthuonghieu(product.getThuonghieu().getTenthuonghieu());
        }
        if (product.getNhaCungCap() != null) {
            response.setIdNcc(product.getNhaCungCap().getIdNcc());
            response.setTenNcc(product.getNhaCungCap().getTenNcc());
        }

        Warehouse warehouse = warehouseRepository.findBySanPham(product);
        response.setSoLuongTon(warehouse != null
                ? warehouse.getSoLuongNhap() - warehouse.getSoLuongBan()
                : 0);

        return response;
    }

    // Các method khác giữ nguyên...
    public List<ProductResponse> getProductsByBrandId(Integer brandId) {
        return productRepository.findByThuonghieu_IdthuonghieuAndTrangThai(brandId, true)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategoryId(Integer categoryId) {
        return productRepository.findByDanhMuc_IdDanhMucAndTrangThai(categoryId, true)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByTrangThai(true)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }
}