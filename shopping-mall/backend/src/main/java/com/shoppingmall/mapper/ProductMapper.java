package com.shoppingmall.mapper;

import com.shoppingmall.entity.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ProductMapper {
    
    // 상품 생성
    void insertProduct(Product product);
    
    // 상품 조회
    Optional<Product> findById(Long id);
    
    // 상품 목록 조회 (카테고리 정보 포함)
    List<Product> findAll();
    
    // 카테고리별 상품 조회
    List<Product> findByCategoryId(Long categoryId);
    
    // 상품명으로 검색
    List<Product> findByNameContaining(String name);
    
    // 상품 정보 업데이트
    void updateProduct(Product product);
    
    // 상품 삭제
    void deleteById(Long id);
    
    // 재고 업데이트
    void updateStock(@Param("id") Long id, @Param("quantity") Integer quantity);
    
    // 재고 감소
    void decreaseStock(@Param("id") Long id, @Param("quantity") Integer quantity);
}