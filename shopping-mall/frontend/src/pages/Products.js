import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productAPI.getAll(),
          categoryAPI.getAll()
        ]);
        
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);

        // URL 파라미터에서 카테고리 확인
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setSelectedCategory(categoryParam);
          const categoryProducts = await productAPI.getByCategory(categoryParam);
          setProducts(categoryProducts.data);
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const response = await productAPI.search(searchTerm);
        setProducts(response.data);
        setSelectedCategory('');
      } catch (error) {
        console.error('검색 실패:', error);
      }
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    try {
      setSelectedCategory(categoryId);
      if (categoryId === '') {
        const response = await productAPI.getAll();
        setProducts(response.data);
      } else {
        const response = await productAPI.getByCategory(categoryId);
        setProducts(response.data);
      }
      setSearchTerm('');
    } catch (error) {
      console.error('카테고리 필터링 실패:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
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
      <h1 className="mb-4">상품 목록</h1>

      {/* 검색 및 필터 */}
      <Row className="mb-4">
        <Col md={6}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="상품명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-secondary" type="submit">
                검색
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={6}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
          >
            <option value="">모든 카테고리</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* 상품 목록 */}
      <Row>
        {products.length === 0 ? (
          <Col>
            <div className="text-center py-5">
              <h4>상품이 없습니다.</h4>
              <p className="text-muted">다른 검색어나 카테고리를 시도해보세요.</p>
            </div>
          </Col>
        ) : (
          products.map((product) => (
            <Col lg={3} md={4} sm={6} className="mb-4" key={product.id}>
              <Card className="h-100">
                <Card.Img 
                  variant="top" 
                  src={product.imageUrl} 
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-truncate">{product.name}</Card.Title>
                  <Card.Text className="text-muted small">
                    {product.categoryName}
                  </Card.Text>
                  <Card.Text className="flex-grow-1 small">
                    {product.description && product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description
                    }
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="text-primary mb-0">
                        ₩{formatPrice(product.price)}
                      </h5>
                      <small className="text-muted">
                        재고: {product.stockQuantity}개
                      </small>
                    </div>
                    <div className="d-grid gap-1">
                      <Button 
                        as={Link} 
                        to={`/products/${product.id}`} 
                        variant="outline-primary"
                        size="sm"
                      >
                        상세보기
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stockQuantity === 0}
                      >
                        {product.stockQuantity === 0 ? '품절' : '장바구니 담기'}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Products;