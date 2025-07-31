package com.shoppingmall.service;

import com.shoppingmall.entity.Product;
import com.shoppingmall.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductMapper productMapper;

    public Product createProduct(Product product) {
        productMapper.insertProduct(product);
        return product;
    }

    public Optional<Product> findById(Long id) {
        return productMapper.findById(id);
    }

    public List<Product> findAll() {
        return productMapper.findAll();
    }

    public List<Product> findByCategoryId(Long categoryId) {
        return productMapper.findByCategoryId(categoryId);
    }

    public List<Product> searchByName(String name) {
        return productMapper.findByNameContaining(name);
    }

    public void updateProduct(Product product) {
        productMapper.updateProduct(product);
    }

    public void deleteById(Long id) {
        productMapper.deleteById(id);
    }

    public void updateStock(Long id, Integer quantity) {
        productMapper.updateStock(id, quantity);
    }

    public boolean decreaseStock(Long id, Integer quantity) {
        try {
            productMapper.decreaseStock(id, quantity);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}