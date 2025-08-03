package com.shopping.mapper;

import com.shopping.model.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProductMapper {
    
    // 상품 생성
    int insertProduct(Product product);
    
    // 상품 조회
    Product findById(Long id);
    
    // 모든 상품 조회 (카테고리 정보 포함)
    List<Product> findAll();
    
    // 카테고리별 상품 조회
    List<Product> findByCategoryId(Long categoryId);
    
    // 상품명으로 검색
    List<Product> findByNameContaining(String name);
    
    // 상품 정보 업데이트
    int updateProduct(Product product);
    
    // 재고 업데이트
    int updateStock(@Param("id") Long id, @Param("quantity") Integer quantity);
    
    // 상품 삭제
    int deleteProduct(Long id);
    
    // 페이징된 상품 목록
    List<Product> findAllWithPaging(@Param("offset") int offset, @Param("limit") int limit);
    
    // 전체 상품 수
    int countAll();
}