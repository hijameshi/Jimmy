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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Cancel } from '@mui/icons-material';
import api from '../services/api';

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.order);
        setOrderItems(response.data.orderItems || response.data.order.orderItems || []);
      } else {
        setMessage('주문을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('주문 조회 실패:', error);
      setMessage('주문 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const response = await api.put(`/api/orders/${id}/cancel`);
      
      if (response.data.success) {
        setMessage('주문이 취소되었습니다.');
        setCancelDialog(false);
        fetchOrderDetail(); // 주문 정보 새로고침
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || '주문 취소 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
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

  const canCancelOrder = (status) => {
    return status === 'PENDING' || status === 'CONFIRMED';
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

  if (!order) {
    return (
      <Container>
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            주문을 찾을 수 없습니다.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/orders')}
            sx={{ mt: 2 }}
          >
            주문 목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {message && (
        <Alert severity={message.includes('취소') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          sx={{ mb: 2 }}
        >
          주문 목록으로
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  주문번호: #{order.id}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  주문일시: {formatDate(order.createdAt)}
                </Typography>
                <Chip 
                  label={getStatusText(order.status)} 
                  color={getStatusColor(order.status)}
                />
              </Box>
              {canCancelOrder(order.status) && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => setCancelDialog(true)}
                >
                  주문 취소
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              배송 정보
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {order.shippingAddress}
            </Typography>

            {order.updatedAt && order.updatedAt !== order.createdAt && (
              <Typography variant="body2" color="text.secondary">
                최종 수정: {formatDate(order.updatedAt)}
              </Typography>
            )}
          </Paper>

          {/* Order Items */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              주문 상품 ({orderItems.length}개)
            </Typography>
            
            {orderItems.map((item, index) => (
              <Box key={index}>
                <Grid container spacing={2} alignItems="center" sx={{ py: 2 }}>
                  <Grid item xs={12} sm={3}>
                    <Box
                      component="img"
                      src={item.product?.imageUrl || 'https://via.placeholder.com/150x120?text=No+Image'}
                      alt={item.product?.name || '상품'}
                      sx={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                      {item.product?.name || '상품 정보 없음'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.product?.description}
                    </Typography>
                    <Typography variant="body1">
                      수량: {item.quantity}개
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3} textAlign="right">
                    <Typography variant="h6" color="primary">
                      ₩{formatPrice(item.price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      소계: ₩{formatPrice(item.price * item.quantity)}
                    </Typography>
                  </Grid>
                </Grid>
                {index < orderItems.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              주문 요약
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>상품 수량:</Typography>
              <Typography>
                {orderItems.reduce((sum, item) => sum + item.quantity, 0)}개
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography>상품 금액:</Typography>
              <Typography>
                ₩{formatPrice(orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">총 결제 금액:</Typography>
              <Typography variant="h6" color="primary">
                ₩{formatPrice(order.totalAmount)}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {getStatusText(order.status)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>주문 취소</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 이 주문을 취소하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            주문번호: #{order.id}<br/>
            주문 금액: ₩{formatPrice(order.totalAmount)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>
            아니오
          </Button>
          <Button 
            onClick={handleCancelOrder} 
            color="error"
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? '취소 중...' : '네, 취소합니다'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetail;