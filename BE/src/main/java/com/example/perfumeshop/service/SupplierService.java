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
                .tenNcc(request.getTenNcc())
                .diaChi(request.getDiaChi())
                .sdt(request.getSdt())
                .email(request.getEmail())
                .ghiChu(request.getGhiChu())
                .build();
        return toResponse(repository.save(supplier));
    }

    // ✅ Cập nhật nhà cung cấp
    public SupplierResponse updateSupplier(Integer id, SupplierRequest request) {
        Supplier supplier = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));

        validate(request, id);

        supplier.setTenNcc(request.getTenNcc());
        supplier.setDiaChi(request.getDiaChi());
        supplier.setSdt(request.getSdt());
        supplier.setEmail(request.getEmail());
        supplier.setGhiChu(request.getGhiChu());

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
                .idNcc(supplier.getIdNcc())
                .tenNcc(supplier.getTenNcc())
                .diaChi(supplier.getDiaChi())
                .sdt(supplier.getSdt())
                .email(supplier.getEmail())
                .ghiChu(supplier.getGhiChu())
                .build();
    }

    // ✅ Validate dữ liệu
    private void validate(SupplierRequest request, Integer idUpdate) {
        boolean allEmpty = Stream.of(
                request.getTenNcc(),
                request.getDiaChi(),
                request.getSdt(),
                request.getEmail(),
                request.getGhiChu()
        ).allMatch(value -> value == null || value.trim().isEmpty());

        if (allEmpty) {
            throw new RuntimeException("Vui lòng nhập đầy đủ thông tin nhà cung cấp");
        }

        if (request.getTenNcc() == null || request.getTenNcc().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập tên nhà cung cấp");
        }
        if (!request.getTenNcc().matches("^[a-zA-ZÀ-ỹ0-9 ]{3,255}$")) {
            throw new RuntimeException("Tên nhà cung cấp phải từ 3-255 ký tự và không chứa ký tự đặc biệt");
        }

        if (idUpdate == null) {
            if (repository.existsByTenNccIgnoreCase(request.getTenNcc())) {
                throw new RuntimeException("Tên nhà cung cấp đã tồn tại");
            }
        } else {
            Supplier old = repository.findById(idUpdate).orElse(null);
            if (repository.existsByTenNccIgnoreCase(request.getTenNcc()) &&
                    (old == null || !old.getTenNcc().equalsIgnoreCase(request.getTenNcc()))) {
                throw new RuntimeException("Tên nhà cung cấp đã tồn tại");
            }
        }

        if (request.getSdt() == null || request.getSdt().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập số điện thoại");
        }
        if (!request.getSdt().matches("^0[0-9]{9}$")) {
            throw new RuntimeException("Số điện thoại không hợp lệ (Phải đúng 10 số và bắt đầu bằng số 0)");
        }

        if (idUpdate == null) {
            if (repository.existsBySdt(request.getSdt())) {
                throw new RuntimeException("Số điện thoại đã tồn tại");
            }
        } else {
            Supplier old = repository.findById(idUpdate).orElse(null);
            if (repository.existsBySdt(request.getSdt()) &&
                    (old == null || !old.getSdt().equals(request.getSdt()))) {
                throw new RuntimeException("Số điện thoại đã tồn tại");
            }
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập email");
        }
        if (!request.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new RuntimeException("Email không hợp lệ");
        }

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

        if (request.getDiaChi() == null || request.getDiaChi().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập địa chỉ");
        }
        if (!request.getDiaChi().matches("^[a-zA-ZÀ-ỹ0-9 ,.?!-]{3,255}$")) {
            throw new RuntimeException("Địa chỉ phải từ 3-255 ký tự và không chứa ký tự đặc biệt không hợp lệ");
        }

        if (request.getGhiChu() == null || request.getGhiChu().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập ghi chú");
        }
        if (!request.getGhiChu().matches("^[a-zA-ZÀ-ỹ0-9 ,.?!-]{3,255}$")) {
            throw new RuntimeException("Ghi chú phải từ 3-255 ký tự và không chứa ký tự đặc biệt không hợp lệ");
        }
    }
}