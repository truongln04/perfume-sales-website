package com.example.perfumeshop.controller;

import com.example.perfumeshop.dto.CartRequest;
import com.example.perfumeshop.dto.CartResponse;
import com.example.perfumeshop.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // Lấy giỏ hàng theo tài khoản
    @GetMapping("/{idTaiKhoan}")
    public CartResponse getCart(@PathVariable Integer idTaiKhoan) {
        return cartService.getCartByUser(idTaiKhoan);
    }

    // Thêm sản phẩm vào giỏ
    @PostMapping("/add")
    public CartResponse addToCart(@RequestBody CartRequest request) {
        return cartService.addToCart(request);
    }

   // Cập nhật số lượng sản phẩm trong giỏ (theo id chi tiết giỏ hàng)
    @PutMapping("/{idCtgh}")
    public CartResponse updateCart(@PathVariable Integer idCtgh,
                                   @RequestParam Integer soLuong) {
        return cartService.updateQuantity(idCtgh, soLuong);
    }

    // Xóa sản phẩm khỏi giỏ (theo id chi tiết giỏ hàng)
    @DeleteMapping("/{idCtgh}")
    public void removeItem(@PathVariable Integer idCtgh) {
        cartService.removeItem(idCtgh);
    }

    // Xóa toàn bộ giỏ hàng của user
    @DeleteMapping("/clear/{idTaiKhoan}")
    public void clearCart(@PathVariable Integer idTaiKhoan) {
        cartService.clearCart(idTaiKhoan);
    }

    // Cập nhật số lượng theo user + sản phẩm
    //@PutMapping("/update")
    //public CartResponse updateCartByUserAndProduct(@RequestBody CartRequest request) {
        //return cartService.updateByUserAndProduct(request);
    //}

}
