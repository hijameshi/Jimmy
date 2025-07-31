package com.shoppingmall.mapper;

import com.shoppingmall.entity.CartItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CartMapper {
    
    // 장바구니에 아이템 추가
    void insertCartItem(CartItem cartItem);
    
    // 사용자의 장바구니 아이템 조회 (상품 정보 포함)
    List<CartItem> findByUserId(Long userId);
    
    // 특정 장바구니 아이템 조회
    Optional<CartItem> findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
    
    // 장바구니 아이템 수량 업데이트
    void updateQuantity(@Param("userId") Long userId, @Param("productId") Long productId, @Param("quantity") Integer quantity);
    
    // 장바구니 아이템 삭제
    void deleteByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
    
    // 사용자의 모든 장바구니 아이템 삭제
    void deleteByUserId(Long userId);
}