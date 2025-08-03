package com.shopping.controller;

import com.shopping.model.Product;
import com.shopping.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            List<Product> products = productService.findAllProducts();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("total", products.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.findById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("product", product);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable Long categoryId) {
        try {
            List<Product> products = productService.findProductsByCategory(categoryId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("total", products.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String keyword) {
        try {
            List<Product> products = productService.searchProductsByName(keyword);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("total", products.size());
            response.put("keyword", keyword);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/paged")
    public ResponseEntity<?> getProductsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<Product> products = productService.findProductsWithPaging(page, size);
            int totalCount = productService.getTotalProductCount();
            int totalPages = (int) Math.ceil((double) totalCount / size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("currentPage", page);
            response.put("totalPages", totalPages);
            response.put("totalItems", totalCount);
            response.put("hasNext", page < totalPages - 1);
            response.put("hasPrevious", page > 0);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}