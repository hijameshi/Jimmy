import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';

const Cart = () => {
  const { cartItems, updateCartItem, removeFromCart, getCartTotal, loading } = useCart();
  const [orderLoading, setOrderLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('이 상품을 장바구니에서 제거하시겠습니까?')) {
      const result = await removeFromCart(productId);
      if (result.success) {
        alert(result.message);
      }
    }
  };

  const handleOrder = async () => {
    if (!shippingAddress.trim()) {
      alert('배송주소를 입력해주세요.');
      return;
    }

    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    setOrderLoading(true);
    try {
      const response = await orderAPI.create({ shippingAddress });
      alert('주문이 완료되었습니다!');
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.message || '주문 처리 중 오류가 발생했습니다.');
    } finally {
      setOrderLoading(false);
    }
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
      <h1 className="mb-4">장바구니</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <h4>장바구니가 비어있습니다.</h4>
          <p className="text-muted">상품을 둘러보고 장바구니에 담아보세요!</p>
          <Button as={Link} to="/products" variant="primary">
            상품 둘러보기
          </Button>
        </div>
      ) : (
        <Row>
          <Col lg={8}>
            <Card>
              <Card.Header>
                <h5>장바구니 상품 ({cartItems.length}개)</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>상품</th>
                      <th>가격</th>
                      <th>수량</th>
                      <th>소계</th>
                      <th>삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              className="me-3"
                            />
                            <div>
                              <h6 className="mb-0">{item.productName}</h6>
                            </div>
                          </div>
                        </td>
                        <td>₩{formatPrice(item.productPrice)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td>₩{formatPrice(item.productPrice * item.quantity)}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId)}
                          >
                            삭제
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5>주문 요약</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <span>상품 금액</span>
                  <span>₩{formatPrice(getCartTotal())}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>배송비</span>
                  <span>무료</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>총 결제 금액</strong>
                  <strong className="text-primary">₩{formatPrice(getCartTotal())}</strong>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>배송주소 *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="배송받을 주소를 입력해주세요"
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleOrder}
                    disabled={orderLoading || !shippingAddress.trim()}
                  >
                    {orderLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        주문 처리 중...
                      </>
                    ) : (
                      '주문하기'
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;