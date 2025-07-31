# 🛒 쇼핑몰 웹서비스

React와 Spring Boot를 사용하여 구축한 현대적인 쇼핑몰 웹 애플리케이션입니다.

## 🚀 기술 스택

### 백엔드
- **Spring Boot 3.2.0** - Java 웹 애플리케이션 프레임워크
- **MyBatis 3.0.3** - SQL 매핑 프레임워크
- **Spring Security** - 인증 및 보안
- **JWT (JSON Web Token)** - 토큰 기반 인증
- **H2 Database** - 인메모리 데이터베이스
- **Maven** - 의존성 관리 및 빌드 도구

### 프론트엔드
- **React 18** - 사용자 인터페이스 라이브러리
- **React Router** - 클라이언트 사이드 라우팅
- **React Bootstrap** - UI 컴포넌트 라이브러리
- **Axios** - HTTP 클라이언트
- **Context API** - 상태 관리

## 📋 주요 기능

### 🔐 사용자 관리
- 회원가입 및 로그인
- JWT 토큰 기반 인증
- 사용자 프로필 관리
- 관리자 권한 구분

### 🛍️ 상품 관리
- 상품 목록 조회
- 상품 상세 정보
- 카테고리별 상품 분류
- 상품 검색 기능
- 관리자 상품 관리 (CRUD)

### 🛒 장바구니
- 장바구니 상품 추가/수정/삭제
- 수량 조절
- 실시간 가격 계산

### 📦 주문 관리
- 주문 생성 및 처리
- 주문 내역 조회
- 주문 상태 관리
- 재고 자동 차감

## 🏗️ 프로젝트 구조

```
shopping-mall/
├── backend/                    # Spring Boot 백엔드
│   ├── src/main/java/com/shoppingmall/
│   │   ├── config/            # 설정 클래스
│   │   ├── controller/        # REST API 컨트롤러
│   │   ├── dto/              # 데이터 전송 객체
│   │   ├── entity/           # 엔티티 클래스
│   │   ├── mapper/           # MyBatis 매퍼 인터페이스
│   │   ├── security/         # 보안 설정
│   │   └── service/          # 비즈니스 로직
│   ├── src/main/resources/
│   │   ├── mapper/           # MyBatis XML 매퍼
│   │   ├── application.yml   # 애플리케이션 설정
│   │   ├── schema.sql        # 데이터베이스 스키마
│   │   └── data.sql          # 초기 데이터
│   └── pom.xml               # Maven 설정
│
└── frontend/                  # React 프론트엔드
    ├── src/
    │   ├── components/       # 재사용 가능한 컴포넌트
    │   ├── context/         # React Context (상태 관리)
    │   ├── pages/           # 페이지 컴포넌트
    │   ├── services/        # API 서비스
    │   └── App.js           # 메인 App 컴포넌트
    └── package.json         # npm 설정
```

## 🚀 실행 방법

### 백엔드 실행

1. 백엔드 디렉토리로 이동:
```bash
cd shopping-mall/backend
```

2. Maven을 사용하여 애플리케이션 실행:
```bash
mvn spring-boot:run
```

백엔드 서버는 `http://localhost:8080`에서 실행됩니다.

### 프론트엔드 실행

1. 프론트엔드 디렉토리로 이동:
```bash
cd shopping-mall/frontend
```

2. 의존성 설치 (이미 설치되어 있음):
```bash
npm install
```

3. 개발 서버 시작:
```bash
npm start
```

프론트엔드 서버는 `http://localhost:3000`에서 실행됩니다.

## 🗄️ 데이터베이스

H2 인메모리 데이터베이스를 사용하며, 애플리케이션 시작 시 자동으로 테이블이 생성되고 초기 데이터가 삽입됩니다.

### H2 Console 접속
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:shoppingmall`
- Username: `sa`
- Password: `password`

### 테스트 계정
- **일반 사용자**: `testuser` / `user123`
- **관리자**: `admin` / `admin123`

## 📱 주요 페이지

1. **홈페이지** (`/`) - 추천 상품 및 카테고리 소개
2. **상품 목록** (`/products`) - 전체 상품 목록 및 검색
3. **상품 상세** (`/products/:id`) - 상품 상세 정보
4. **장바구니** (`/cart`) - 장바구니 관리 및 주문
5. **주문 내역** (`/orders`) - 사용자 주문 내역
6. **프로필** (`/profile`) - 사용자 정보
7. **로그인/회원가입** (`/login`, `/signup`)

## 🔒 API 보안

- JWT 토큰 기반 인증
- Spring Security를 통한 엔드포인트 보호
- CORS 설정으로 프론트엔드와 백엔드 통신 허용

## 🎨 UI/UX 특징

- **반응형 디자인** - 모바일, 태블릿, 데스크톱 지원
- **Bootstrap 5** - 현대적이고 일관된 UI
- **실시간 장바구니 업데이트** - Context API를 통한 상태 관리
- **로딩 상태 표시** - 사용자 경험 개선
- **에러 처리** - 친화적인 에러 메시지

## 🚧 향후 개선 사항

- [ ] 상품 이미지 업로드 기능
- [ ] 결제 시스템 연동
- [ ] 상품 리뷰 및 평점 시스템
- [ ] 위시리스트 기능
- [ ] 이메일 알림 시스템
- [ ] 관리자 대시보드
- [ ] 상품 재고 알림
- [ ] 쿠폰 및 할인 시스템

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🤝 기여하기

1. 이 저장소를 포크합니다.
2. 새로운 기능 브랜치를 생성합니다. (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다. (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다. (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다.

---

📧 문의사항이 있으시면 언제든지 연락해 주세요!