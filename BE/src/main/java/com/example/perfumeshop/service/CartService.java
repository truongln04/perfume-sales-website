package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.CartRequest;
import com.example.perfumeshop.dto.CartResponse;
import com.example.perfumeshop.entity.Cart;
import com.example.perfumeshop.entity.Account;
import com.example.perfumeshop.entity.Product;
import com.example.perfumeshop.repository.CartRepository;
import com.example.perfumeshop.repository.AccountRepository;
import com.example.perfumeshop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ProductRepository productRepository;

    // Lấy giỏ hàng theo user và trả về DTO
    public List<CartResponse> getCartByUser(Integer idTaiKhoan) {
        List<Cart> carts = cartRepository.findByTaiKhoan_IdTaiKhoan(idTaiKhoan);
        return carts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Thêm sản phẩm vào giỏ hàng từ CartRequest
    public CartResponse addToCart(CartRequest request) {
        Cart existing = cartRepository.findByTaiKhoan_IdTaiKhoanAndSanPham_IdSanPham(
                request.getIdTaiKhoan(), request.getIdSanPham());

        Product product = productRepository.findById(request.getIdSanPham()).orElseThrow();
        Account account = accountRepository.findById(request.getIdTaiKhoan()).orElseThrow();

        if (existing != null) {
            existing.setSoLuong(existing.getSoLuong() + request.getSoLuong()); // cộng dồn
            // ✅ cập nhật lại giá nếu cần (ví dụ khi khuyến mãi thay đổi)
            existing.setDonGia(request.getDonGia());
            Cart updated = cartRepository.save(existing);
            return toResponse(updated);
        }

        Cart cart = new Cart();
        cart.setTaiKhoan(account);
        cart.setSanPham(product);
        cart.setSoLuong(request.getSoLuong());
        // ✅ lưu giá sau khuyến mãi từ request
        cart.setDonGia(request.getDonGia());

        Cart saved = cartRepository.save(cart);
        return toResponse(saved);
    }

    // Cập nhật số lượng
    public CartResponse updateQuantity(Integer idGh, Integer soLuong) {
        Cart cart = cartRepository.findById(idGh).orElseThrow();
        cart.setSoLuong(soLuong);
        Cart updated = cartRepository.save(cart);
        return toResponse(updated);
    }

    // Xóa sản phẩm khỏi giỏ
    public void removeItem(Integer idGh) {
        cartRepository.deleteById(idGh);
    }

    // Xóa toàn bộ giỏ hàng
    public void clearCart(Integer idTaiKhoan) {
        List<Cart> list = cartRepository.findByTaiKhoan_IdTaiKhoan(idTaiKhoan);
        cartRepository.deleteAll(list);
    }

    // Convert Entity -> DTO Response
    private CartResponse toResponse(Cart cart) {
        CartResponse res = new CartResponse();
        res.setIdGh(cart.getIdGh());
        res.setIdTaikhoan(cart.getTaiKhoan().getIdTaiKhoan());
        res.setIdSanPham(cart.getSanPham().getIdSanPham());
        res.setTenSanPham(cart.getSanPham().getTenSanPham());
        res.setHinhAnh(cart.getSanPham().getHinhAnh());
        res.setSoLuong(cart.getSoLuong());
        res.setDonGia(cart.getDonGia());
        return res;
    }

    // Cập nhật số lượng theo user + sản phẩm
    public CartResponse updateByUserAndProduct(CartRequest request) {
        Cart existing = cartRepository.findByTaiKhoan_IdTaiKhoanAndSanPham_IdSanPham(
                request.getIdTaiKhoan(), request.getIdSanPham());

        Product product = productRepository.findById(request.getIdSanPham()).orElseThrow();
        Account account = accountRepository.findById(request.getIdTaiKhoan()).orElseThrow();

        if (existing != null) {
            existing.setSoLuong(request.getSoLuong()); // hoặc cộng dồn: existing.getSoLuong() + request.getSoLuong()
            existing.setDonGia(request.getDonGia());
            Cart updated = cartRepository.save(existing);
            return toResponse(updated);
        }

        Cart cart = new Cart();
        cart.setTaiKhoan(account);
        cart.setSanPham(product);
        cart.setSoLuong(request.getSoLuong());
        cart.setDonGia(request.getDonGia());

        Cart saved = cartRepository.save(cart);
        return toResponse(saved);
    }

}
