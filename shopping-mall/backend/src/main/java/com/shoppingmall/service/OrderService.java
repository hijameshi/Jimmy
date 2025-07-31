package com.shoppingmall.service;

import com.shoppingmall.entity.CartItem;
import com.shoppingmall.entity.Order;
import com.shoppingmall.entity.OrderItem;
import com.shoppingmall.mapper.OrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;

    @Transactional
    public Order createOrder(Long userId, String shippingAddress) {
        // 장바구니 아이템 조회
        List<CartItem> cartItems = cartService.getCartItems(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("장바구니가 비어있습니다.");
        }

        // 총 금액 계산
        BigDecimal totalAmount = cartItems.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 주문 생성
        Order order = new Order(userId, totalAmount, shippingAddress);
        orderMapper.insertOrder(order);

        // 주문 아이템 생성 및 재고 감소
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem(
                order.getId(),
                cartItem.getProductId(),
                cartItem.getQuantity(),
                cartItem.getProductPrice()
            );
            orderMapper.insertOrderItem(orderItem);

            // 재고 감소
            boolean stockDecreased = productService.decreaseStock(
                cartItem.getProductId(), 
                cartItem.getQuantity()
            );
            if (!stockDecreased) {
                throw new RuntimeException("재고가 부족합니다: " + cartItem.getProductName());
            }
        }

        // 장바구니 비우기
        cartService.clearCart(userId);

        return order;
    }

    public Optional<Order> findById(Long id) {
        return orderMapper.findById(id);
    }

    public List<Order> findByUserId(Long userId) {
        return orderMapper.findByUserId(userId);
    }

    public List<Order> findAll() {
        return orderMapper.findAll();
    }

    public void updateOrderStatus(Long id, String status) {
        orderMapper.updateOrderStatus(id, status);
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        return orderMapper.findOrderItemsByOrderId(orderId);
    }
}