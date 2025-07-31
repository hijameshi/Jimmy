import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container>
      <h1 className="mb-4">프로필</h1>

      <Row>
        <Col md={8} lg={6}>
          <Card>
            <Card.Header>
              <h5>사용자 정보</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>사용자명:</strong>
                </Col>
                <Col sm={8}>
                  {user?.username}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>이름:</strong>
                </Col>
                <Col sm={8}>
                  {user?.fullName}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>이메일:</strong>
                </Col>
                <Col sm={8}>
                  {user?.email}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>권한:</strong>
                </Col>
                <Col sm={8}>
                  <span className={`badge ${user?.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                    {user?.role === 'ADMIN' ? '관리자' : '일반 사용자'}
                  </span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>가입일:</strong>
                </Col>
                <Col sm={8}>
                  {formatDate(user?.createdAt)}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} lg={6}>
          <Card>
            <Card.Header>
              <h5>계정 통계</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <div className="mb-3">
                  <h4 className="text-primary">환영합니다!</h4>
                  <p className="text-muted">
                    {user?.fullName}님의 쇼핑몰 이용을 환영합니다.
                  </p>
                </div>
                
                <div className="row text-center">
                  <div className="col-6">
                    <div className="border-end">
                      <h5 className="text-success">0</h5>
                      <small className="text-muted">총 주문</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <h5 className="text-info">0</h5>
                    <small className="text-muted">장바구니</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;