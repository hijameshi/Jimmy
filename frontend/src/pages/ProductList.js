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
  Alert,
  Pagination,
  TextField,
  InputAdornment
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const itemsPerPage = 12;

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
      searchProducts(search);
    } else {
      fetchProducts(currentPage);
    }
  }, [currentPage, searchParams]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/paged?page=${page - 1}&size=${itemsPerPage}`);
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('상품 조회 실패:', error);
      setMessage('상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (keyword) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(1); // 검색 결과는 페이징 없이 모두 표시
      }
    } catch (error) {
      console.error('상품 검색 실패:', error);
      setMessage('상품 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ search: searchTerm.trim() });
      setCurrentPage(1);
    } else {
      setSearchParams({});
      fetchProducts(1);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
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

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          상품 목록
        </Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 400 }}>
          <TextField
            fullWidth
            placeholder="상품 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button type="submit" size="small">
                    <Search />
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {searchParams.get('search') && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            '{searchParams.get('search')}'에 대한 검색 결과: {products.length}개
          </Typography>
        )}
      </Box>

      {/* Products Grid */}
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
                {product.category && (
                  <Typography variant="body2" color="text.secondary">
                    카테고리: {product.category.name}
                  </Typography>
                )}
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
            {searchParams.get('search') 
              ? '검색 결과가 없습니다.' 
              : '등록된 상품이 없습니다.'
            }
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && !searchParams.get('search') && (
        <Box display="flex" justifyContent="center" sx={{ mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default ProductList;