import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productAPI.getAll(),
          categoryAPI.getAll()
        ]);
        
        // 처음 6개 상품을 추천 상품으로 표시
        setFeaturedProducts(productsResponse.data.slice(0, 6));
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      {/* 히어로 섹션 */}
      <Carousel className="mb-5">
        <Carousel.Item>
          <div className="bg-primary text-white text-center py-5 rounded">
            <h1>Welcome to Our Shopping Mall</h1>
            <p>최고의 상품을 최저가로 만나보세요!</p>
            <Button as={Link} to="/products" variant="light" size="lg">
              상품 둘러보기
            </Button>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="bg-success text-white text-center py-5 rounded">
            <h1>Special Offers</h1>
            <p>특별 할인 혜택을 놓치지 마세요!</p>
            <Button as={Link} to="/products" variant="light" size="lg">
              할인 상품 보기
            </Button>
          </div>
        </Carousel.Item>
      </Carousel>

      {/* 카테고리 섹션 */}
      <section className="mb-5">
        <h2 className="mb-4">카테고리</h2>
        <Row>
          {categories.map((category) => (
            <Col md={4} className="mb-3" key={category.id}>
              <Card className="h-100 text-center">
                <Card.Body>
                  <Card.Title>{category.name}</Card.Title>
                  <Card.Text>{category.description}</Card.Text>
                  <Button 
                    as={Link} 
                    to={`/products?category=${category.id}`} 
                    variant="outline-primary"
                  >
                    보러가기
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* 추천 상품 섹션 */}
      <section>
        <h2 className="mb-4">추천 상품</h2>
        <Row>
          {featuredProducts.map((product) => (
            <Col lg={4} md={6} className="mb-4" key={product.id}>
              <Card className="h-100">
                <Card.Img 
                  variant="top" 
                  src={product.imageUrl} 
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text className="text-muted small">
                    {product.categoryName}
                  </Card.Text>
                  <Card.Text className="flex-grow-1">
                    {product.description}
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
                    <div className="d-grid gap-2">
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
          ))}
        </Row>
      </section>
    </Container>
  );
};

export default Home;