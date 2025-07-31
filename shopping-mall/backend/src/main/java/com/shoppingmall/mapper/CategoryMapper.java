package com.shoppingmall.mapper;

import com.shoppingmall.entity.Category;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CategoryMapper {
    
    // 카테고리 생성
    void insertCategory(Category category);
    
    // 카테고리 조회
    Optional<Category> findById(Long id);
    
    // 모든 카테고리 조회
    List<Category> findAll();
    
    // 카테고리 업데이트
    void updateCategory(Category category);
    
    // 카테고리 삭제
    void deleteById(Long id);
}