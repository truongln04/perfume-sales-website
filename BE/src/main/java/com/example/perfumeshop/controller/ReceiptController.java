package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.ReceiptRequest;
import com.example.perfumeshop.dto.ReceiptResponse;
import com.example.perfumeshop.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/receipts")
public class ReceiptController {

    @Autowired
    private ReceiptService receiptService;

    // Tạo mới phiếu nhập
    @PostMapping
    public ResponseEntity<ReceiptResponse> create(@RequestBody ReceiptRequest request) {
        ReceiptResponse response = receiptService.create(request);
        return ResponseEntity.status(201).body(response); // ✅ HTTP 201 Created
    }

    // Lấy tất cả phiếu nhập
    @GetMapping
    public ResponseEntity<List<ReceiptResponse>> getAll() {
        List<ReceiptResponse> list = receiptService.getAll();
        return ResponseEntity.ok(list); // ✅ HTTP 200 OK
    }

    // Lấy phiếu nhập theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ReceiptResponse> getById(@PathVariable Integer id) {
        ReceiptResponse response = receiptService.getById(id);
        return ResponseEntity.ok(response); // ✅ HTTP 200 OK
    }

    // Tìm kiếm phiếu nhập theo ghi chú hoặc ngày nhập
@GetMapping("/search")
public ResponseEntity<List<ReceiptResponse>> search(@RequestParam String keyword) {
    List<ReceiptResponse> list = receiptService.search(keyword);
    return ResponseEntity.ok(list); // 200 OK
}


    // Cập nhật phiếu nhập
    @PutMapping("/{id}")
    public ResponseEntity<ReceiptResponse> update(@PathVariable Integer id, @RequestBody ReceiptRequest request) {
        ReceiptResponse response = receiptService.update(id, request);
        return ResponseEntity.ok(response); // ✅ HTTP 200 OK
    }

    // Xóa phiếu nhập
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        receiptService.delete(id);
        return ResponseEntity.noContent().build(); // ✅ HTTP 204 No Content
    }
}
