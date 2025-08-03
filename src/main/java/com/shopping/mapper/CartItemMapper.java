package com.shopping.mapper;

import com.shopping.model.CartItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CartItemMapper {
    
    // 장바구니에 상품 추가
    int insertCartItem(CartItem cartItem);
    
    // 사용자의 장바구니 목록 조회 (상품 정보 포함)
    List<CartItem> findByUserId(Long userId);
    
    // 특정 장바구니 아이템 조회
    CartItem findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
    
    // 장바구니 아이템 수량 업데이트
    int updateQuantity(@Param("id") Long id, @Param("quantity") Integer quantity);
    
    // 장바구니 아이템 삭제
    int deleteCartItem(Long id);
    
    // 사용자의 모든 장바구니 아이템 삭제
    int deleteByUserId(Long userId);
    
    // 장바구니 아이템 존재 여부 확인
    boolean existsByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}