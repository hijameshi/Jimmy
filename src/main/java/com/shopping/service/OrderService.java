package com.shopping.service;

import com.shopping.mapper.OrderMapper;
import com.shopping.model.CartItem;
import com.shopping.model.Order;
import com.shopping.model.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;

    public Order createOrder(Long userId, String shippingAddress) {
        // 장바구니 아이템 조회
        List<CartItem> cartItems = cartService.getCartItems(userId);
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("장바구니가 비어있습니다.");
        }

        // 총 금액 계산 및 재고 확인
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            // 재고 확인
            if (!productService.isStockAvailable(item.getProductId(), item.getQuantity())) {
                throw new RuntimeException("상품 '" + item.getProduct().getName() + "'의 재고가 부족합니다.");
            }
            
            BigDecimal itemTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // 주문 생성
        Order order = new Order(userId, totalAmount, shippingAddress);
        orderMapper.insertOrder(order);

        // 주문 아이템 생성 및 재고 감소
        for (CartItem item : cartItems) {
            OrderItem orderItem = new OrderItem(
                order.getId(),
                item.getProductId(),
                item.getQuantity(),
                item.getProduct().getPrice()
            );
            orderMapper.insertOrderItem(orderItem);

            // 재고 감소
            productService.decreaseStock(item.getProductId(), item.getQuantity());
        }

        // 장바구니 비우기
        cartService.clearCart(userId);

        return order;
    }

    public Order findById(Long orderId) {
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new RuntimeException("주문을 찾을 수 없습니다.");
        }
        return order;
    }

    public List<Order> findOrdersByUserId(Long userId) {
        return orderMapper.findByUserId(userId);
    }

    public List<Order> findAllOrders() {
        return orderMapper.findAll();
    }

    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new RuntimeException("주문을 찾을 수 없습니다.");
        }

        // 주문 취소의 경우 재고 복원
        if (status == Order.OrderStatus.CANCELLED && order.getStatus() != Order.OrderStatus.CANCELLED) {
            List<OrderItem> orderItems = orderMapper.findOrderItemsByOrderId(orderId);
            for (OrderItem item : orderItems) {
                productService.increaseStock(item.getProductId(), item.getQuantity());
            }
        }

        orderMapper.updateOrderStatus(orderId, status);
        order.setStatus(status);
        return order;
    }

    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new RuntimeException("주문을 찾을 수 없습니다.");
        }

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("주문을 취소할 권한이 없습니다.");
        }

        if (order.getStatus() == Order.OrderStatus.SHIPPED || 
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("배송 중이거나 배송 완료된 주문은 취소할 수 없습니다.");
        }

        updateOrderStatus(orderId, Order.OrderStatus.CANCELLED);
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        return orderMapper.findOrderItemsByOrderId(orderId);
    }

    public void deleteOrder(Long orderId) {
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new RuntimeException("주문을 찾을 수 없습니다.");
        }

        // 취소되지 않은 주문은 삭제할 수 없음
        if (order.getStatus() != Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("취소된 주문만 삭제할 수 있습니다.");
        }

        orderMapper.deleteOrder(orderId);
    }

    public BigDecimal calculateOrderTotal(Long orderId) {
        List<OrderItem> orderItems = orderMapper.findOrderItemsByOrderId(orderId);
        return orderItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}