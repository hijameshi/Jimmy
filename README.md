# 쇼핑몰 프로그램

React, Spring Boot, MyBatis, MariaDB를 사용한 풀스택 쇼핑몰 애플리케이션입니다.

## 🛠 기술 스택

### 백엔드
- **Spring Boot 3.2.0** - 웹 애플리케이션 프레임워크
- **MyBatis 3.0.3** - SQL 매핑 프레임워크
- **MariaDB** - 관계형 데이터베이스
- **Spring Security** - 인증 및 보안
- **JWT** - 토큰 기반 인증
- **Maven** - 빌드 도구

### 프론트엔드
- **React 18.2.0** - 사용자 인터페이스 라이브러리
- **Material-UI (MUI) 5.13.0** - React UI 컴포넌트 라이브러리
- **React Router 6.11.0** - 클라이언트 사이드 라우팅
- **Axios 1.4.0** - HTTP 클라이언트
- **React Query 3.39.3** - 서버 상태 관리

## 🚀 주요 기능

### 사용자 기능
- 회원가입 및 로그인 (JWT 토큰 기반)
- 상품 목록 조회 및 검색
- 상품 상세 정보 확인
- 장바구니 관리 (추가, 수정, 삭제)
- 주문 생성 및 관리
- 주문 내역 조회
- 주문 취소

### 관리자 기능
- 상품 관리
- 주문 상태 관리

## 📁 프로젝트 구조

```
shopping-mall/
├── src/main/java/com/shopping/          # Spring Boot 백엔드
│   ├── config/                          # 설정 클래스
│   ├── controller/                      # REST API 컨트롤러
│   ├── mapper/                          # MyBatis 매퍼 인터페이스
│   ├── model/                           # 엔티티 클래스
│   ├── security/                        # 보안 관련 클래스
│   ├── service/                         # 비즈니스 로직 서비스
│   └── util/                            # 유틸리티 클래스
├── src/main/resources/
│   ├── mappers/                         # MyBatis XML 매퍼
│   ├── application.yml                  # 애플리케이션 설정
│   └── schema.sql                       # 데이터베이스 스키마
├── frontend/                            # React 프론트엔드
│   ├── src/
│   │   ├── components/                  # 재사용 가능한 컴포넌트
│   │   ├── contexts/                    # React Context (상태 관리)
│   │   ├── pages/                       # 페이지 컴포넌트
│   │   └── services/                    # API 서비스
│   └── public/
└── pom.xml                              # Maven 설정
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- `users` - 사용자 정보
- `categories` - 상품 카테고리
- `products` - 상품 정보
- `cart_items` - 장바구니 아이템
- `orders` - 주문 정보
- `order_items` - 주문 상품 상세

## 🏃‍♂️ 실행 방법

### 사전 요구사항
- Java 17 이상
- Node.js 16 이상
- MariaDB 10.5 이상
- Maven 3.6 이상

### 1. 데이터베이스 설정

MariaDB에 접속하여 데이터베이스를 생성하고 초기 데이터를 삽입합니다:

```sql
-- src/main/resources/schema.sql 파일의 내용을 실행
```

### 2. 백엔드 실행

```bash
# 프로젝트 루트 디렉토리에서
mvn clean install
mvn spring-boot:run
```

백엔드 서버는 `http://localhost:8080`에서 실행됩니다.

### 3. 프론트엔드 실행

```bash
# frontend 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

프론트엔드 서버는 `http://localhost:3000`에서 실행됩니다.

## 📝 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/check-username` - 사용자명 중복 확인
- `POST /api/auth/check-email` - 이메일 중복 확인

### 상품
- `GET /api/products` - 전체 상품 조회
- `GET /api/products/{id}` - 상품 상세 조회
- `GET /api/products/search` - 상품 검색
- `GET /api/products/category/{categoryId}` - 카테고리별 상품 조회

### 장바구니 (인증 필요)
- `GET /api/cart` - 장바구니 조회
- `POST /api/cart/add` - 장바구니에 상품 추가
- `PUT /api/cart/{id}` - 장바구니 아이템 수량 변경
- `DELETE /api/cart/{id}` - 장바구니 아이템 삭제
- `DELETE /api/cart/clear` - 장바구니 비우기

### 주문 (인증 필요)
- `GET /api/orders` - 주문 내역 조회
- `GET /api/orders/{id}` - 주문 상세 조회
- `POST /api/orders` - 주문 생성
- `PUT /api/orders/{id}/cancel` - 주문 취소

## 🔐 인증 시스템

- JWT 토큰 기반 인증
- 토큰 만료 시간: 24시간
- 역할 기반 접근 제어 (USER, ADMIN)

## 🎨 UI/UX 특징

- Material-UI를 활용한 모던한 디자인
- 반응형 웹 디자인 (모바일 친화적)
- 직관적인 사용자 인터페이스
- 실시간 장바구니 카운트 업데이트
- 로딩 상태 및 에러 처리

## 🔧 개발 도구

### 백엔드 개발
```bash
# 테스트 실행
mvn test

# 패키징
mvn package
```

### 프론트엔드 개발
```bash
# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

## 📦 배포

### 백엔드 배포
```bash
# JAR 파일 생성
mvn clean package

# JAR 파일 실행
java -jar target/shopping-mall-0.0.1-SNAPSHOT.jar
```

### 프론트엔드 배포
```bash
# 프로덕션 빌드
cd frontend
npm run build

# build 폴더의 내용을 웹 서버에 배포
```

## 🤝 기여 방법

1. 프로젝트를 포크합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**즐거운 쇼핑 되세요! 🛒**