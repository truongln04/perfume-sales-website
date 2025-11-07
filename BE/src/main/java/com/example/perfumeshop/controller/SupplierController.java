package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.SupplierRequest;
import com.example.perfumeshop.dto.SupplierResponse;
import com.example.perfumeshop.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService service;

    @PostMapping
    public SupplierResponse create(@Valid @RequestBody SupplierRequest request) {
        return service.createSupplier(request);
    }

    @PutMapping("/{id}")
    public SupplierResponse update(@PathVariable Integer id, @Valid @RequestBody SupplierRequest request) {
        return service.updateSupplier(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.deleteSupplier(id);
    }

    @GetMapping
    public List<SupplierResponse> getAll() {
        return service.getAllSuppliers();
    }

    @GetMapping("/search")
    public List<SupplierResponse> search(@RequestParam String keyword) {
        return service.searchSuppliers(keyword);
    }

    @GetMapping("/{id}")
    public SupplierResponse getById(@PathVariable Integer id) {
        return service.getSupplierById(id);
    }
}