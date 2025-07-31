package com.shoppingmall.service;

import com.shoppingmall.entity.Category;
import com.shoppingmall.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    public Category createCategory(Category category) {
        categoryMapper.insertCategory(category);
        return category;
    }

    public Optional<Category> findById(Long id) {
        return categoryMapper.findById(id);
    }

    public List<Category> findAll() {
        return categoryMapper.findAll();
    }

    public void updateCategory(Category category) {
        categoryMapper.updateCategory(category);
    }

    public void deleteById(Long id) {
        categoryMapper.deleteById(id);
    }
}