package com.example.perfumeshop.controller;
import com.example.perfumeshop.dto.AccountRequest;
import com.example.perfumeshop.dto.AccountResponse;
import com.example.perfumeshop.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService service;

    @PostMapping
    public AccountResponse create(@Valid @RequestBody AccountRequest request) {
        return service.createAccount(request);
    }

    @PutMapping("/{id}")
    public AccountResponse update(@PathVariable Integer id, @Valid @RequestBody AccountRequest request) {
        return service.updateAccount(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.deleteAccount(id);
    }

    @GetMapping
    public List<AccountResponse> getAll() {
        return service.getAllAccounts();
    }

    @GetMapping("/search")
    public List<AccountResponse> search(@RequestParam String keyword) {
        return service.searchAccounts(keyword);
    }

    @GetMapping("/{id}")
    public AccountResponse getById(@PathVariable Integer id) {
        return service.getAccountById(id);
    }
}