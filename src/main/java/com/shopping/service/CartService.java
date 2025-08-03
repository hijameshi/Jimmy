package com.shopping.service;

import com.shopping.mapper.CartItemMapper;
import com.shopping.model.CartItem;
import com.shopping.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartItemMapper cartItemMapper;

    @Autowired
    private ProductService productService;

    public CartItem addToCart(Long userId, Long productId, Integer quantity) {
        // 상품 존재 여부 확인
        Product product = productService.findById(productId);
        
        // 재고 확인
        if (!productService.isStockAvailable(productId, quantity)) {
            throw new RuntimeException("재고가 부족합니다.");
        }

        // 이미 장바구니에 있는 상품인지 확인
        CartItem existingItem = cartItemMapper.findByUserIdAndProductId(userId, productId);
        
        if (existingItem != null) {
            // 기존 아이템의 수량 업데이트
            int newQuantity = existingItem.getQuantity() + quantity;
            
            // 총 수량에 대한 재고 확인
            if (!productService.isStockAvailable(productId, newQuantity)) {
                throw new RuntimeException("재고가 부족합니다.");
            }
            
            cartItemMapper.updateQuantity(existingItem.getId(), newQuantity);
            existingItem.setQuantity(newQuantity);
            return existingItem;
        } else {
            // 새로운 아이템 추가
            CartItem cartItem = new CartItem(userId, productId, quantity);
            cartItemMapper.insertCartItem(cartItem);
            return cartItem;
        }
    }

    public List<CartItem> getCartItems(Long userId) {
        return cartItemMapper.findByUserId(userId);
    }

    public CartItem updateCartItemQuantity(Long cartItemId, Integer quantity, Long userId) {
        CartItem cartItem = cartItemMapper.findByUserIdAndProductId(userId, null);
        if (cartItem == null) {
            throw new RuntimeException("장바구니 아이템을 찾을 수 없습니다.");
        }

        // 재고 확인
        if (!productService.isStockAvailable(cartItem.getProductId(), quantity)) {
            throw new RuntimeException("재고가 부족합니다.");
        }

        cartItemMapper.updateQuantity(cartItemId, quantity);
        cartItem.setQuantity(quantity);
        return cartItem;
    }

    public void removeFromCart(Long cartItemId) {
        cartItemMapper.deleteCartItem(cartItemId);
    }

    public void clearCart(Long userId) {
        cartItemMapper.deleteByUserId(userId);
    }

    public CartItem getCartItem(Long userId, Long productId) {
        return cartItemMapper.findByUserIdAndProductId(userId, productId);
    }

    public boolean isItemInCart(Long userId, Long productId) {
        return cartItemMapper.existsByUserIdAndProductId(userId, productId);
    }

    public int getCartItemCount(Long userId) {
        List<CartItem> items = cartItemMapper.findByUserId(userId);
        return items.stream().mapToInt(CartItem::getQuantity).sum();
    }

    public double getCartTotal(Long userId) {
        List<CartItem> items = cartItemMapper.findByUserId(userId);
        return items.stream()
                .mapToDouble(item -> item.getProduct().getPrice().doubleValue() * item.getQuantity())
                .sum();
    }
}