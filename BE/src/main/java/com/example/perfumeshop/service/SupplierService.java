package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.SupplierRequest;
import com.example.perfumeshop.dto.SupplierResponse;
import com.example.perfumeshop.entity.Supplier;
import com.example.perfumeshop.repository.ProductRepository;
// import com.example.perfumeshop.repository.*;
import com.example.perfumeshop.repository.SupplierRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository repository;
    private final ProductRepository productRepository;

    // ==================== REGEX PATTERNS – CHUẨN NHƯ CÁC SERVICE KHÁC ====================
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ0-9\\s]{3,40}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0[0-9]{9}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    private static final Pattern ADDRESS_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ0-9 ,.?!-]{3,40}$");
    private static final Pattern NOTE_PATTERN = Pattern.compile("^[a-zA-ZÀ-ỹ0-9\\s]{8,}$");

    // ==================== CREATE SUPPLIER ====================
    public SupplierResponse createSupplier(SupplierRequest request) {
        validateCreateRequest(request);

        Supplier supplier = Supplier.builder()
                .tenNcc(request.getTenNcc().trim())
                .diaChi(request.getDiaChi().trim())
                .sdt(request.getSdt().trim())
                .email(request.getEmail().trim().toLowerCase())
                .ghiChu(request.getGhiChu().trim())
                .build();

        return toResponse(repository.save(supplier));
    }

    // ==================== UPDATE SUPPLIER ====================
    public SupplierResponse updateSupplier(Integer id, SupplierRequest request) {
        Supplier supplier = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));

        validateUpdateRequest(request, id);

        supplier.setTenNcc(request.getTenNcc().trim());
        supplier.setDiaChi(request.getDiaChi().trim());
        supplier.setSdt(request.getSdt().trim());
        supplier.setEmail(request.getEmail().trim().toLowerCase());
        supplier.setGhiChu(request.getGhiChu().trim());

        return toResponse(repository.save(supplier));
    }

    // ==================== DELETE ====================
    @Transactional
    public void deleteSupplier(Integer id) {
        if (!repository.existsById(id)) {
            throw new ValidationException("Không tìm thấy nhà cung cấp để xóa");
        }
         // Kiểm tra có sản phẩm tham chiếu không
    boolean existsProduct = productRepository.existsByNhaCungCap_IdNcc(id);
    if (existsProduct) {
        throw new ValidationException("Không thể xóa nhà cung cấp vì đang có sản phẩm tham chiếu");
    }
         repository.deleteById(id);
    }

    // ==================== GET ALL & SEARCH ====================
    public List<SupplierResponse> getAllSuppliers() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SupplierResponse> searchSuppliers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new ValidationException("Từ khóa tìm kiếm không được để trống");
        }
        return repository.searchByNameOrPhoneOrEmail(keyword.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SupplierResponse getSupplierById(Integer id) {
        Supplier supplier = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));
        return toResponse(supplier);
    }

    // ==================== VALIDATION METHODS – GIỐNG CATEGORY & BRAND SERVICE ====================

    private void validateCreateRequest(SupplierRequest request) {
        // 1. Tên nhà cung cấp
        if (request.getTenNcc() == null || request.getTenNcc().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên nhà cung cấp");
        }
        String tenNcc = request.getTenNcc().trim();
        if (!NAME_PATTERN.matcher(tenNcc).matches()) {
            throw new ValidationException("Tên nhà cung cấp phải từ 3-40 ký tự, chỉ chứa chữ cái, số và khoảng trắng");
        }
        if (repository.existsByTenNccIgnoreCase(tenNcc)) {
            throw new ValidationException("Tên nhà cung cấp '" + tenNcc + "' đã tồn tại");
        }

        // 2. Số điện thoại
        if (request.getSdt() == null || request.getSdt().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập số điện thoại");
        }
        String sdt = request.getSdt().trim();
        if (!PHONE_PATTERN.matcher(sdt).matches()) {
            throw new ValidationException("Số điện thoại phải bắt đầu bằng 0 và đúng 10 chữ số");
        }
        if (repository.existsBySdt(sdt)) {
            throw new ValidationException("Số điện thoại '" + sdt + "' đã được sử dụng");
        }

        // 3. Email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập email");
        }
        String email = request.getEmail().trim();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException("Email không hợp lệ");
        }
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ValidationException("Email '" + email + "' đã được sử dụng");
        }

        // 4. Địa chỉ
        if (request.getDiaChi() == null || request.getDiaChi().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập địa chỉ");
        }
        String diaChi = request.getDiaChi().trim();
        if (!ADDRESS_PATTERN.matcher(diaChi).matches()) {
            throw new ValidationException("Địa chỉ phải từ 3-40 ký tự, chỉ chứa chữ cái, số, khoảng trắng và ký tự ,.?!-");
        }

        // 5. Ghi chú
        if (request.getGhiChu() == null || request.getGhiChu().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập ghi chú");
        }
        String ghiChu = request.getGhiChu().trim();
        if (!NOTE_PATTERN.matcher(ghiChu).matches()) {
            throw new ValidationException("Ghi chú ít nhất 8 ký tự trở lên");
        }
    }

    private void validateUpdateRequest(SupplierRequest request, Integer idUpdate) {
        // 1. Tên nhà cung cấp
        if (request.getTenNcc() == null || request.getTenNcc().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập tên nhà cung cấp");
        }
        String tenNcc = request.getTenNcc().trim();
        if (!NAME_PATTERN.matcher(tenNcc).matches()) {
            throw new ValidationException("Tên nhà cung cấp phải từ 3-40 ký tự, chỉ chứa chữ cái, số và khoảng trắng");
        }
        Supplier old = repository.findById(idUpdate).orElse(null);
        if (old != null && !tenNcc.equalsIgnoreCase(old.getTenNcc())
                && repository.existsByTenNccIgnoreCase(tenNcc)) {
            throw new ValidationException("Tên nhà cung cấp '" + tenNcc + "' đã được sử dụng");
        }

        // 2. Số điện thoại
        if (request.getSdt() == null || request.getSdt().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập số điện thoại");
        }
        String sdt = request.getSdt().trim();
        if (!PHONE_PATTERN.matcher(sdt).matches()) {
            throw new ValidationException("Số điện thoại phải bắt đầu bằng 0 và đúng 10 chữ số");
        }
        if (old != null && !sdt.equals(old.getSdt()) && repository.existsBySdt(sdt)) {
            throw new ValidationException("Số điện thoại '" + sdt + "' đã được sử dụng");
        }

        // 3. Email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập email");
        }
        String email = request.getEmail().trim();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException("Email không hợp lệ");
        }
        if (old != null && !email.equalsIgnoreCase(old.getEmail()) && repository.existsByEmailIgnoreCase(email)) {
            throw new ValidationException("Email '" + email + "' đã được sử dụng");
        }

        // 4. Địa chỉ
        if (request.getDiaChi() == null || request.getDiaChi().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập địa chỉ");
        }
        if (!ADDRESS_PATTERN.matcher(request.getDiaChi().trim()).matches()) {
            throw new ValidationException("Địa chỉ phải từ 3-40 ký tự, chỉ chứa chữ cái, số, khoảng trắng và ký tự ,.?!-");
        }

        // 5. Ghi chú
        if (request.getGhiChu() == null || request.getGhiChu().trim().isEmpty()) {
            throw new ValidationException("Vui lòng nhập ghi chú");
        }
        if (!NOTE_PATTERN.matcher(request.getGhiChu().trim()).matches()) {
            throw new ValidationException("Ghi chú ít nhất 8 ký tự trở lên");
        }
    }

    // ==================== UTILITY ====================
    private SupplierResponse toResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .idNcc(supplier.getIdNcc())
                .tenNcc(supplier.getTenNcc())
                .diaChi(supplier.getDiaChi())
                .sdt(supplier.getSdt())
                .email(supplier.getEmail())
                .ghiChu(supplier.getGhiChu())
                .build();
    }
}