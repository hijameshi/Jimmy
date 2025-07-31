-- 카테고리 데이터
INSERT INTO categories (name, description) VALUES
('전자제품', '스마트폰, 노트북, 태블릿 등'),
('의류', '남성복, 여성복, 아동복'),
('도서', '소설, 전문서적, 만화'),
('스포츠', '운동용품, 스포츠웨어'),
('홈&리빙', '가구, 인테리어 소품');

-- 관리자 계정 (비밀번호: admin123)
INSERT INTO users (username, password, email, full_name, phone, address, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin@shoppingmall.com', '관리자', '010-0000-0000', '서울시 강남구', 'ADMIN');

-- 테스트 사용자 계정 (비밀번호: user123)
INSERT INTO users (username, password, email, full_name, phone, address, role) VALUES
('testuser', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'user@test.com', '테스트 사용자', '010-1234-5678', '서울시 서초구', 'USER');

-- 상품 데이터
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES
('iPhone 15 Pro', '최신 아이폰 15 Pro 모델', 1200000.00, 50, 1, 'https://via.placeholder.com/300x300?text=iPhone+15+Pro'),
('MacBook Air M2', '13인치 MacBook Air M2 칩', 1500000.00, 30, 1, 'https://via.placeholder.com/300x300?text=MacBook+Air'),
('Nike 에어맥스', '나이키 에어맥스 운동화', 150000.00, 100, 4, 'https://via.placeholder.com/300x300?text=Nike+AirMax'),
('삼성 갤럭시 S24', '삼성 갤럭시 S24 Ultra', 1300000.00, 40, 1, 'https://via.placeholder.com/300x300?text=Galaxy+S24'),
('무선 이어폰', '블루투스 무선 이어폰', 80000.00, 200, 1, 'https://via.placeholder.com/300x300?text=Wireless+Earbuds'),
('청바지', '클래식 데님 청바지', 60000.00, 150, 2, 'https://via.placeholder.com/300x300?text=Jeans'),
('후드티', '편안한 후드 티셔츠', 45000.00, 120, 2, 'https://via.placeholder.com/300x300?text=Hoodie'),
('자바 프로그래밍 책', '자바 완벽 가이드', 35000.00, 80, 3, 'https://via.placeholder.com/300x300?text=Java+Book'),
('요가매트', '프리미엄 요가매트', 40000.00, 90, 4, 'https://via.placeholder.com/300x300?text=Yoga+Mat'),
('LED 스탠드', '조명 조절 가능한 LED 스탠드', 70000.00, 60, 5, 'https://via.placeholder.com/300x300?text=LED+Stand');