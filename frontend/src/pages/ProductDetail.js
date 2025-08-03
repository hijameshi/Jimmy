import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Alert,
  Paper,
  Chip,
  TextField,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowBack, Add, Remove } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.product);
      } else {
        setMessage('상품을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('상품 조회 실패:', error);
      setMessage('상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    const result = await addToCart(product.id, quantity);
    setMessage(result.message);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
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

  if (!product) {
    return (
      <Container>
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            상품을 찾을 수 없습니다.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            상품 목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {message && (
        <Alert severity={message.includes('성공') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          뒤로 가기
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={product.imageUrl || 'https://via.placeholder.com/500x400?text=No+Image'}
            alt={product.name}
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '500px',
              objectFit: 'cover',
              borderRadius: 2,
              boxShadow: 2
            }}
          />
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            {product.category && (
              <Chip 
                label={product.category.name} 
                color="primary" 
                variant="outlined"
                sx={{ mb: 2 }}
              />
            )}

            <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 3 }}>
              ₩{formatPrice(product.price)}
            </Typography>

            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
            </Paper>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                재고: {product.stockQuantity}개
              </Typography>
              
              {product.stockQuantity > 0 ? (
                <Chip label="구매 가능" color="success" />
              ) : (
                <Chip label="품절" color="error" />
              )}
            </Box>

            {product.stockQuantity > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  수량
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Remove />
                  </IconButton>
                  <TextField
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= product.stockQuantity) {
                        setQuantity(value);
                      }
                    }}
                    inputProps={{ 
                      min: 1, 
                      max: product.stockQuantity,
                      style: { textAlign: 'center', width: '60px' }
                    }}
                    size="small"
                  />
                  <IconButton 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Box>
            )}

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                sx={{ flexGrow: 1 }}
              >
                장바구니에 담기
              </Button>
            </Box>

            {product.createdAt && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                등록일: {new Date(product.createdAt).toLocaleDateString('ko-KR')}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;