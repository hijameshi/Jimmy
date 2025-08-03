package com.shopping.mapper;

import com.shopping.model.Order;
import com.shopping.model.OrderItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMapper {
    
    // 주문 생성
    int insertOrder(Order order);
    
    // 주문 아이템 생성
    int insertOrderItem(OrderItem orderItem);
    
    // 주문 조회
    Order findById(Long id);
    
    // 사용자의 주문 목록 조회
    List<Order> findByUserId(Long userId);
    
    // 모든 주문 조회 (관리자용)
    List<Order> findAll();
    
    // 주문 상태 업데이트
    int updateOrderStatus(@Param("id") Long id, @Param("status") Order.OrderStatus status);
    
    // 주문 아이템 조회
    List<OrderItem> findOrderItemsByOrderId(Long orderId);
    
    // 주문 삭제
    int deleteOrder(Long id);
}