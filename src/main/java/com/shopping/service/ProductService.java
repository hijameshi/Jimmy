package com.shopping.service;

import com.shopping.mapper.ProductMapper;
import com.shopping.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductMapper productMapper;

    public Product createProduct(Product product) {
        productMapper.insertProduct(product);
        return product;
    }

    public Product findById(Long id) {
        Product product = productMapper.findById(id);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다.");
        }
        return product;
    }

    public List<Product> findAllProducts() {
        return productMapper.findAll();
    }

    public List<Product> findProductsByCategory(Long categoryId) {
        return productMapper.findByCategoryId(categoryId);
    }

    public List<Product> searchProductsByName(String name) {
        return productMapper.findByNameContaining(name);
    }

    public Product updateProduct(Product product) {
        Product existingProduct = productMapper.findById(product.getId());
        if (existingProduct == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다.");
        }

        productMapper.updateProduct(product);
        return product;
    }

    public void deleteProduct(Long id) {
        Product product = productMapper.findById(id);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다.");
        }
        productMapper.deleteProduct(id);
    }

    public void updateStock(Long productId, Integer quantity) {
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다.");
        }

        if (quantity < 0) {
            throw new RuntimeException("재고는 0보다 작을 수 없습니다.");
        }

        productMapper.updateStock(productId, quantity);
    }

    public void decreaseStock(Long productId, Integer quantity) {
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다.");
        }

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("재고가 부족합니다.");
        }

        int newStock = product.getStockQuantity() - quantity;
        productMapper.updateStock(productId, newStock);
    }

    public void increaseStock(Long productId, Integer quantity) {
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다.");
        }

        int newStock = product.getStockQuantity() + quantity;
        productMapper.updateStock(productId, newStock);
    }

    public List<Product> findProductsWithPaging(int page, int size) {
        int offset = page * size;
        return productMapper.findAllWithPaging(offset, size);
    }

    public int getTotalProductCount() {
        return productMapper.countAll();
    }

    public boolean isStockAvailable(Long productId, Integer quantity) {
        Product product = productMapper.findById(productId);
        return product != null && product.getStockQuantity() >= quantity;
    }
}