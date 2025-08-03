import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Paper,
  Grid,
  IconButton,
  TextField,
  Divider,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Delete, Add, Remove, ShoppingCartCheckout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

const Cart = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderDialog, setOrderDialog] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const { cartItems, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const result = await updateCartItem(cartItemId, newQuantity);
    if (!result.success) {
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    const result = await removeFromCart(cartItemId);
    setMessage(result.message);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClearCart = async () => {
    const result = await clearCart();
    setMessage(result.message);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCheckout = () => {
    setOrderDialog(true);
  };

  const handleCreateOrder = async () => {
    if (!shippingAddress.trim()) {
      setMessage('배송 주소를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/orders', {
        shippingAddress: shippingAddress.trim()
      });

      if (response.data.success) {
        setMessage('주문이 완료되었습니다!');
        setOrderDialog(false);
        setShippingAddress('');
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || '주문 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const total = getCartTotal();

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" py={8}>
          <Typography variant="h4" gutterBottom>
            장바구니
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            장바구니가 비어있습니다.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
          >
            쇼핑 계속하기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {message && (
        <Alert severity={message.includes('성공') || message.includes('완료') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        장바구니 ({cartItems.length}개 상품)
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Box
                      component="img"
                      src={item.product.imageUrl || 'https://via.placeholder.com/150x120?text=No+Image'}
                      alt={item.product.name}
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
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.product.description?.length > 100 
                        ? `${item.product.description.substring(0, 100)}...`
                        : item.product.description
                      }
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₩{formatPrice(item.product.price)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1) {
                              handleQuantityChange(item.id, value);
                            }
                          }}
                          inputProps={{ 
                            min: 1,
                            style: { textAlign: 'center', width: '50px' }
                          }}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        소계: ₩{formatPrice(item.product.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => handleRemoveItem(item.id)}
                >
                  삭제
                </Button>
              </CardActions>
            </Card>
          ))}

          <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/products')}
            >
              쇼핑 계속하기
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearCart}
            >
              장바구니 비우기
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              주문 요약
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>상품 수량:</Typography>
              <Typography>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}개</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography>상품 금액:</Typography>
              <Typography>₩{formatPrice(total)}</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6">총 결제 금액:</Typography>
              <Typography variant="h6" color="primary">
                ₩{formatPrice(total)}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<ShoppingCartCheckout />}
              onClick={handleCheckout}
            >
              주문하기
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Order Dialog */}
      <Dialog open={orderDialog} onClose={() => setOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>주문 정보 입력</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="배송 주소"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="배송받을 주소를 상세히 입력해주세요."
            sx={{ mt: 1 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              총 결제 금액: ₩{formatPrice(total)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialog(false)}>취소</Button>
          <Button 
            onClick={handleCreateOrder} 
            variant="contained"
            disabled={loading}
          >
            {loading ? '주문 중...' : '주문 완료'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;