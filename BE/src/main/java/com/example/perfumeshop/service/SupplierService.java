package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.SupplierRequest;
import com.example.perfumeshop.dto.SupplierResponse;
import com.example.perfumeshop.entity.Supplier;
import com.example.perfumeshop.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository repository;

    // ✅ Thêm nhà cung cấp
    public SupplierResponse createSupplier(SupplierRequest request) {
        validate(request, null);
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .note(request.getNote())
                .build();
        return toResponse(repository.save(supplier));
    }

    // ✅ Cập nhật nhà cung cấp
    public SupplierResponse updateSupplier(Integer id, SupplierRequest request) {
        Supplier supplier = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));

        validate(request, id);

        supplier.setName(request.getName());
        supplier.setAddress(request.getAddress());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setNote(request.getNote());

        return toResponse(repository.save(supplier));
    }

    public void deleteSupplier(Integer id) {
        repository.deleteById(id);
    }

    public List<SupplierResponse> getAllSuppliers() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SupplierResponse> searchSuppliers(String keyword) {
        return repository.searchByNameOrPhoneOrEmail(keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SupplierResponse getSupplierById(Integer id) {
        Supplier supplier = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));
        return toResponse(supplier);
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .address(supplier.getAddress())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .note(supplier.getNote())
                .build();
    }

    // ✅ Validate dữ liệu
    private void validate(SupplierRequest request, Integer idUpdate) {
    // 🔹 Nếu tất cả đều trống
    boolean allEmpty = Stream.of(
            request.getName(),
            request.getAddress(),
            request.getPhone(),
            request.getEmail(),
            request.getNote()
    ).allMatch(value -> value == null || value.trim().isEmpty());

    if (allEmpty) {
        throw new RuntimeException("Vui lòng nhập đầy đủ thông tin nhà cung cấp");
    }
    
    // 🔹 Kiểm tra Tên
    if (request.getName() == null || request.getName().trim().isEmpty()) {
        throw new RuntimeException("Vui lòng nhập tên nhà cung cấp");
    }
    if (!request.getName().matches("^[a-zA-ZÀ-ỹ0-9 ]{3,255}$")) {
        throw new RuntimeException("Tên nhà cung cấp phải từ 3-255 ký tự và không chứa ký tự đặc biệt");
    }

    // 🔹 Trùng tên
    if (idUpdate == null) { // thêm mới
        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Tên nhà cung cấp đã tồn tại");
        }
    } else { // sửa
        Supplier old = repository.findById(idUpdate).orElse(null);
        if (repository.existsByNameIgnoreCase(request.getName()) &&
                (old == null || !old.getName().equalsIgnoreCase(request.getName()))) {
            throw new RuntimeException("Tên nhà cung cấp đã tồn tại");
        }
    }

    // 🔹 Kiểm tra SĐT
    if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
        throw new RuntimeException("Vui lòng nhập số điện thoại");
    }
    if (!request.getPhone().matches("^0[0-9]{9}$")) {
        throw new RuntimeException("Số điện thoại không hợp lệ (Phải đúng 10 số và bắt đầu bằng số 0)");
    }

    // 🔹 Trùng SĐT
    if (idUpdate == null) {
        if (repository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
    } else {
        Supplier old = repository.findById(idUpdate).orElse(null);
        if (repository.existsByPhone(request.getPhone()) &&
                (old == null || !old.getPhone().equals(request.getPhone()))) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
    }

    // 🔹 Kiểm tra Email
    if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
        throw new RuntimeException("Vui lòng nhập email");
    }
    if (!request.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
        throw new RuntimeException("Email không hợp lệ");
    }

    // 🔹 Trùng Email
    if (idUpdate == null) {
        if (repository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
    } else {
        Supplier old = repository.findById(idUpdate).orElse(null);
        if (repository.existsByEmailIgnoreCase(request.getEmail()) &&
                (old == null || !old.getEmail().equalsIgnoreCase(request.getEmail()))) {
            throw new RuntimeException("Email đã tồn tại");
        }
    }

    // 🔹 Kiểm tra Địa chỉ
    if (request.getAddress() == null || request.getAddress().trim().isEmpty()) {
        throw new RuntimeException("Vui lòng nhập địa chỉ");
    }
    if (!request.getAddress().matches("^[a-zA-ZÀ-ỹ0-9 ,.?!-]{3,255}$")) {
            throw new RuntimeException("Địa chỉ phải từ 3-255 ký tự và không chứa ký tự đặc biệt không hợp lệ");
    }

    // 🔹 Kiểm tra Ghi chú 
    if (request.getNote() == null || request.getNote().trim().isEmpty()) {
         throw new RuntimeException("Vui lòng nhập ghi chú");
    }
    if (!request.getNote().matches("^[a-zA-ZÀ-ỹ0-9 ,.?!-]{3,255}$")) {
            throw new RuntimeException("Ghi chú phải từ 3-255 ký tự và không chứa ký tự đặc biệt không hợp lệ");
    }
    }
}