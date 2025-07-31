package com.shoppingmall.mapper;

import com.shoppingmall.entity.Order;
import com.shoppingmall.entity.OrderItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface OrderMapper {
    
    // 주문 생성
    void insertOrder(Order order);
    
    // 주문 아이템 생성
    void insertOrderItem(OrderItem orderItem);
    
    // 주문 조회
    Optional<Order> findById(Long id);
    
    // 사용자의 주문 목록 조회
    List<Order> findByUserId(Long userId);
    
    // 모든 주문 조회 (관리자용)
    List<Order> findAll();
    
    // 주문 상태 업데이트
    void updateOrderStatus(@Param("id") Long id, @Param("status") String status);
    
    // 주문의 아이템 목록 조회
    List<OrderItem> findOrderItemsByOrderId(Long orderId);
}