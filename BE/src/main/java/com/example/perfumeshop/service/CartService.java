package com.example.perfumeshop.service;

import com.example.perfumeshop.dto.CartRequest;
import com.example.perfumeshop.dto.CartDetailRequest;
import com.example.perfumeshop.dto.CartResponse;
import com.example.perfumeshop.dto.CartDetailResponse;
import com.example.perfumeshop.entity.Cart;
import com.example.perfumeshop.entity.CartDetail;
import com.example.perfumeshop.entity.Account;
import com.example.perfumeshop.entity.Product;
import com.example.perfumeshop.repository.CartRepository;
import com.example.perfumeshop.repository.AccountRepository;
import com.example.perfumeshop.repository.ProductRepository;

import jakarta.transaction.Transactional;

import com.example.perfumeshop.repository.CartDetailRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
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

    @Autowired
    private CartDetailRepository cartDetailRepository;

    // Lấy giỏ hàng theo user và trả về DTO
    public CartResponse getCartByUser(Integer idTaiKhoan) {
        Cart cart = cartRepository.findByTaiKhoan_IdTaiKhoan(idTaiKhoan);
        if (cart == null) {
        // Có thể trả về response rỗng hoặc tạo giỏ hàng mới
        CartResponse empty = new CartResponse();
        empty.setIdTaiKhoan(idTaiKhoan);
        empty.setChiTietGioHang(List.of()); // danh sách rỗng
        return empty;
    }
        return toResponse(cart);
    }

    // Thêm sản phẩm vào giỏ hàng từ CartRequest
    public CartResponse addToCart(CartRequest request) {
        Account account = accountRepository.findById(request.getIdTaiKhoan()).orElseThrow();

        // tìm giỏ hàng của user, nếu chưa có thì tạo mới
        Cart cart = cartRepository.findByTaiKhoan_IdTaiKhoan(request.getIdTaiKhoan());
        if (cart == null) {
            cart = new Cart();
            cart.setTaiKhoan(account);
            cart.setNgayTao(LocalDateTime.now());
            cart = cartRepository.save(cart);
        }

        for (CartDetailRequest item : request.getChiTietGioHang()) {
            Product product = productRepository.findById(item.getIdSanPham()).orElseThrow();

            CartDetail existing = cartDetailRepository.findByCart_IdGhAndSanPham_IdSanPham(
                    cart.getIdGh(), item.getIdSanPham());

            if (existing != null) {
                existing.setSoLuong(existing.getSoLuong() + item.getSoLuong());
                existing.setDonGia(item.getDonGia());
                cartDetailRepository.save(existing);
            } else {
                CartDetail detail = new CartDetail();
                detail.setCart(cart);
                detail.setSanPham(product);
                detail.setSoLuong(item.getSoLuong());
                detail.setDonGia(item.getDonGia());
                cartDetailRepository.save(detail);
            }
        }

        return toResponse(cartRepository.findById(cart.getIdGh()).orElseThrow());
    }

    // Cập nhật số lượng sản phẩm trong giỏ
    public CartResponse updateQuantity(Integer idCtgh, Integer soLuong) {
        CartDetail detail = cartDetailRepository.findById(idCtgh).orElseThrow();
        detail.setSoLuong(soLuong);
        cartDetailRepository.save(detail);
        return toResponse(detail.getCart());
    }

    // Xóa sản phẩm khỏi giỏ
    public void removeItem(Integer idCtgh) {
        cartDetailRepository.deleteById(idCtgh);
    }

    // Xóa toàn bộ giỏ hàng
    @Transactional
    public void clearCart(Integer idTaiKhoan) {
        Cart cart = cartRepository.findByTaiKhoan_IdTaiKhoan(idTaiKhoan);
        if (cart != null) {
            cartDetailRepository.deleteByCart(cart);
        }
    }

    // Convert Entity -> DTO Response
    private CartResponse toResponse(Cart cart) {
        CartResponse res = new CartResponse();
        res.setIdGh(cart.getIdGh());
        res.setIdTaiKhoan(cart.getTaiKhoan().getIdTaiKhoan());
        res.setNgayTao(cart.getNgayTao());

        List<CartDetailResponse> details = cart.getChiTietGioHang().stream().map(detail -> {
            CartDetailResponse d = new CartDetailResponse();
            d.setIdCtgh(detail.getIdCtgh());
            d.setIdSanPham(detail.getSanPham().getIdSanPham());
            d.setTenSanPham(detail.getSanPham().getTenSanPham());
            d.setHinhAnh(detail.getSanPham().getHinhAnh());
            d.setSoLuong(detail.getSoLuong());
            d.setDonGia(detail.getDonGia());
            return d;
        }).collect(Collectors.toList());

        res.setChiTietGioHang(details);
        return res;
    }
}