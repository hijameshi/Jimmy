import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Collapse, Table } from 'react-bootstrap';
import { orderAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getUserOrders();
        setOrders(response.data);
      } catch (error) {
        console.error('주문 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderDetails = async (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));

    // 주문 상세 정보가 없으면 가져오기
    if (!expandedOrders[orderId]) {
      try {
        const response = await orderAPI.getOrderItems(orderId);
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, orderItems: response.data }
              : order
          )
        );
      } catch (error) {
        console.error('주문 상세 조회 실패:', error);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { bg: 'warning', text: '처리중' },
      'CONFIRMED': { bg: 'info', text: '주문확인' },
      'SHIPPED': { bg: 'primary', text: '배송중' },
      'DELIVERED': { bg: 'success', text: '배송완료' },
      'CANCELLED': { bg: 'danger', text: '취소됨' }
    };

    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <h4>주문 내역이 없습니다.</h4>
          <p className="text-muted">상품을 주문해보세요!</p>
        </div>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="mb-3">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">주문번호: #{order.id}</h6>
                  <small className="text-muted">
                    {formatDate(order.createdAt)}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-3">
                  {getStatusBadge(order.status)}
                  <strong>₩{formatPrice(order.totalAmount)}</strong>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    {expandedOrders[order.id] ? '접기' : '상세보기'}
                  </Button>
                </div>
              </div>
            </Card.Header>
            
            <Collapse in={expandedOrders[order.id]}>
              <div>
                <Card.Body>
                  <div className="mb-3">
                    <strong>배송주소:</strong>
                    <p className="mb-0">{order.shippingAddress}</p>
                  </div>

                  {order.orderItems && (
                    <div>
                      <strong>주문 상품:</strong>
                      <Table responsive className="mt-2">
                        <thead className="table-light">
                          <tr>
                            <th>상품</th>
                            <th>가격</th>
                            <th>수량</th>
                            <th>소계</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderItems.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    className="me-3"
                                  />
                                  <span>{item.productName}</span>
                                </div>
                              </td>
                              <td>₩{formatPrice(item.price)}</td>
                              <td>{item.quantity}개</td>
                              <td>₩{formatPrice(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </div>
            </Collapse>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Orders;