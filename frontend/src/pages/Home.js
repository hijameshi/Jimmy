import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ShoppingCart } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/api/products');
      if (response.data.success) {
        // 최신 상품 8개만 표시
        setProducts(response.data.products.slice(0, 8));
      }
    } catch (error) {
      console.error('상품 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    const result = await addToCart(productId, 1);
    setMessage(result.message);
    setTimeout(() => setMessage(''), 3000);
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

  return (
    <Container maxWidth="lg">
      {message && (
        <Alert severity={message.includes('성공') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 8, mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          환영합니다!
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          최고의 상품을 합리적인 가격에 만나보세요
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/products"
          sx={{ mt: 2 }}
        >
          상품 둘러보기
        </Button>
      </Box>

      {/* Featured Products */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
        인기 상품
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h3" noWrap>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description?.length > 100 
                    ? `${product.description.substring(0, 100)}...`
                    : product.description
                  }
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ₩{formatPrice(product.price)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  재고: {product.stockQuantity}개
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  size="small"
                  component={Link}
                  to={`/products/${product.id}`}
                >
                  상세보기
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stockQuantity === 0}
                >
                  담기
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            등록된 상품이 없습니다.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Home;