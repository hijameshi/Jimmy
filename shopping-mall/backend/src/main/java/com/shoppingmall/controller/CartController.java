package com.shoppingmall.controller;

import com.shoppingmall.dto.CartRequest;
import com.shoppingmall.entity.CartItem;
import com.shoppingmall.entity.User;
import com.shoppingmall.service.CartService;
import com.shoppingmall.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username).orElse(null);
        return user != null ? user.getId() : null;
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCartItems() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<CartItem> cartItems = cartService.getCartItems(userId);
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@Valid @RequestBody CartRequest cartRequest) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            cartService.addToCart(userId, cartRequest.getProductId(), cartRequest.getQuantity());
            Map<String, String> response = new HashMap<>();
            response.put("message", "상품이 장바구니에 추가되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "장바구니 추가에 실패했습니다.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@Valid @RequestBody CartRequest cartRequest) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            cartService.updateQuantity(userId, cartRequest.getProductId(), cartRequest.getQuantity());
            Map<String, String> response = new HashMap<>();
            response.put("message", "장바구니가 업데이트되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "장바구니 업데이트에 실패했습니다.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            cartService.removeFromCart(userId, productId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "상품이 장바구니에서 제거되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "상품 제거에 실패했습니다.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            cartService.clearCart(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "장바구니가 비워졌습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "장바구니 비우기에 실패했습니다.");
            return ResponseEntity.badRequest().body(error);
        }
    }
}