package com.shoppingmall.service;

import com.shoppingmall.entity.CartItem;
import com.shoppingmall.mapper.CartMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartMapper cartMapper;

    public void addToCart(Long userId, Long productId, Integer quantity) {
        CartItem cartItem = new CartItem(userId, productId, quantity);
        cartMapper.insertCartItem(cartItem);
    }

    public List<CartItem> getCartItems(Long userId) {
        return cartMapper.findByUserId(userId);
    }

    public Optional<CartItem> getCartItem(Long userId, Long productId) {
        return cartMapper.findByUserIdAndProductId(userId, productId);
    }

    public void updateQuantity(Long userId, Long productId, Integer quantity) {
        cartMapper.updateQuantity(userId, productId, quantity);
    }

    public void removeFromCart(Long userId, Long productId) {
        cartMapper.deleteByUserIdAndProductId(userId, productId);
    }

    public void clearCart(Long userId) {
        cartMapper.deleteByUserId(userId);
    }
}