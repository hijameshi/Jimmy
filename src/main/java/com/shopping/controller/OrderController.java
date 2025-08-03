package com.shopping.controller;

import com.shopping.model.Order;
import com.shopping.model.OrderItem;
import com.shopping.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    private Long getUserIdFromAuth(Authentication authentication) {
        return (Long) authentication.getDetails();
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            String shippingAddress = request.get("shippingAddress");

            Order order = orderService.createOrder(userId, shippingAddress);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "주문이 생성되었습니다.");
            response.put("order", order);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserOrders(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<Order> orders = orderService.findOrdersByUserId(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orders", orders);
            response.put("total", orders.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId, Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            Order order = orderService.findById(orderId);

            // 본인 주문인지 확인
            if (!order.getUserId().equals(userId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "접근 권한이 없습니다.");
                return ResponseEntity.forbidden().body(response);
            }

            List<OrderItem> orderItems = orderService.getOrderItems(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", order);
            response.put("orderItems", orderItems);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId, Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            orderService.cancelOrder(orderId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "주문이 취소되었습니다.");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String statusStr = request.get("status");
            Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr);

            Order order = orderService.updateOrderStatus(orderId, status);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "주문 상태가 업데이트되었습니다.");
            response.put("order", order);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{orderId}/items")
    public ResponseEntity<?> getOrderItems(@PathVariable Long orderId, Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            Order order = orderService.findById(orderId);

            // 본인 주문인지 확인
            if (!order.getUserId().equals(userId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "접근 권한이 없습니다.");
                return ResponseEntity.forbidden().body(response);
            }

            List<OrderItem> orderItems = orderService.getOrderItems(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderItems", orderItems);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}