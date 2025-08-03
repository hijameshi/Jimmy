package com.shopping.controller;

import com.shopping.model.CartItem;
import com.shopping.service.CartService;
import com.shopping.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserIdFromAuth(Authentication authentication) {
        return (Long) authentication.getDetails();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());

            CartItem cartItem = cartService.addToCart(userId, productId, quantity);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "상품이 장바구니에 추가되었습니다.");
            response.put("cartItem", cartItem);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<?> getCartItems(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<CartItem> cartItems = cartService.getCartItems(userId);
            double total = cartService.getCartTotal(userId);
            int itemCount = cartService.getCartItemCount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cartItems", cartItems);
            response.put("total", total);
            response.put("itemCount", itemCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            Integer quantity = request.get("quantity");

            CartItem cartItem = cartService.updateCartItemQuantity(cartItemId, quantity, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "장바구니가 업데이트되었습니다.");
            response.put("cartItem", cartItem);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartItemId) {
        try {
            cartService.removeFromCart(cartItemId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "상품이 장바구니에서 제거되었습니다.");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            cartService.clearCart(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "장바구니가 비워졌습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getCartItemCount(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            int count = cartService.getCartItemCount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", count);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}