import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ShoppingBag, Visibility } from '@mui/icons-material';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('주문 조회 실패:', error);
      setMessage('주문 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'SHIPPED': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return '주문 접수';
      case 'CONFIRMED': return '주문 확인';
      case 'SHIPPED': return '배송 중';
      case 'DELIVERED': return '배송 완료';
      case 'CANCELLED': return '주문 취소';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>로딩 중...</Typography>
        </Box>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" py={8}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            주문 내역
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            아직 주문한 상품이 없습니다.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
          >
            쇼핑하러 가기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {message && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        주문 내역 ({orders.length}건)
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      주문번호: #{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      주문일시: {formatDate(order.createdAt)}
                    </Typography>
                    <Chip 
                      label={getStatusText(order.status)} 
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" color="primary" gutterBottom>
                      ₩{formatPrice(order.totalAmount)}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      component={Link}
                      to={`/orders/${order.id}`}
                    >
                      상세보기
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  배송 주소:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {order.shippingAddress}
                </Typography>

                {order.orderItems && order.orderItems.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      주문 상품 ({order.orderItems.length}개):
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <Chip
                          key={index}
                          label={`${item.product?.name || '상품'} x${item.quantity}`}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                      {order.orderItems.length > 3 && (
                        <Chip
                          label={`외 ${order.orderItems.length - 3}개`}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          component={Link}
          to="/products"
        >
          쇼핑 계속하기
        </Button>
      </Box>
    </Container>
  );
};

export default Orders;