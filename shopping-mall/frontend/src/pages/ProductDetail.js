import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getById(id);
        setProduct(response.data);
      } catch (error) {
        console.error('상품 조회 실패:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, quantity);
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

  if (!product) {
    return (
      <Container>
        <div className="text-center py-5">
          <h4>상품을 찾을 수 없습니다.</h4>
          <Button variant="primary" onClick={() => navigate('/products')}>
            상품 목록으로 돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Img 
              variant="top" 
              src={product.imageUrl} 
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Card>
        </Col>
        <Col md={6}>
          <div className="h-100 d-flex flex-column">
            <div className="mb-3">
              <Badge bg="secondary" className="mb-2">
                {product.categoryName}
              </Badge>
              <h1>{product.name}</h1>
            </div>

            <div className="mb-4">
              <h2 className="text-primary">₩{formatPrice(product.price)}</h2>
            </div>

            <div className="mb-4">
              <h5>상품 설명</h5>
              <p>{product.description}</p>
            </div>

            <div className="mb-4">
              <Row>
                <Col sm={6}>
                  <strong>재고:</strong> {product.stockQuantity}개
                </Col>
                <Col sm={6}>
                  <strong>상태:</strong>{' '}
                  <Badge bg={product.stockQuantity > 0 ? 'success' : 'danger'}>
                    {product.stockQuantity > 0 ? '판매중' : '품절'}
                  </Badge>
                </Col>
              </Row>
            </div>

            {product.stockQuantity > 0 && (
              <div className="mb-4">
                <Form.Group>
                  <Form.Label>수량</Form.Label>
                  <Form.Select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    style={{ width: '100px' }}
                  >
                    {[...Array(Math.min(product.stockQuantity, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            )}

            <div className="mt-auto">
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                >
                  {product.stockQuantity === 0 ? '품절' : '장바구니 담기'}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/products')}
                >
                  상품 목록으로 돌아가기
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Header>
              <h5>상품 정보</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <strong>상품명:</strong> {product.name}
                </Col>
                <Col md={6}>
                  <strong>카테고리:</strong> {product.categoryName}
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={6}>
                  <strong>가격:</strong> ₩{formatPrice(product.price)}
                </Col>
                <Col md={6}>
                  <strong>재고 수량:</strong> {product.stockQuantity}개
                </Col>
              </Row>
              <hr />
              <div>
                <strong>상품 설명:</strong>
                <p className="mt-2">{product.description}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;