# Phase 2: 홈 페이지 프로모션/카테고리 진입 동선 구현 목표

## 📋 개요

홈 페이지에 카테고리 섹션과 프로모션 섹션을 추가하여 사용자가 원하는 상품을 빠르게 찾을 수 있도록 합니다.

## 🎯 구현 목표

### 1. 홈 페이지 레이아웃 재구성

**순서**: 카테고리 → 프로모션 (신상품) → 전체 상품 목록

```
┌─────────────────────────────────────┐
│         카테고리 섹션                │
│   (Grid 레이아웃, 카테고리별 진입)   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│      프로모션 섹션 (신상품)          │
│   (최근 등록된 상품, 가로 스크롤)    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        전체 상품 목록                │
│   (기존 Grid 레이아웃 유지)          │
└─────────────────────────────────────┘
```

### 2. 카테고리 섹션

#### 2.1 카테고리 데이터
- **데이터 소스**: Supabase `products` 테이블에서 `category` 컬럼 사용
- **카테고리 목록**: 
  - `electronics` (전자제품)
  - `clothing` (의류)
  - `books` (도서)
  - `food` (식품)
  - `sports` (스포츠)
  - `beauty` (뷰티)
  - `home` (생활/가정)
- **동적 카테고리**: 실제 데이터베이스에 존재하는 카테고리만 표시

#### 2.2 카테고리 카드 컴포넌트
- **위치**: `components/category-card.tsx`
- **표시 정보**:
  - 카테고리 이름 (한글 표시)
  - 카테고리 아이콘 또는 이미지 (선택사항)
  - 해당 카테고리 상품 개수
- **클릭 동작**: 카테고리별 상품 목록 페이지로 이동 (`/products?category={category}`)

#### 2.3 카테고리 Grid 레이아웃
- **위치**: `components/category-grid.tsx`
- **레이아웃**: 
  - 모바일: 2열
  - 태블릿: 3열
  - 데스크톱: 4-5열
- **스타일**: 깔끔한 카드 디자인, 호버 효과

### 3. 프로모션 섹션 (신상품)

#### 3.1 신상품 데이터
- **쿼리**: `created_at` 기준 최근 등록된 상품
- **개수**: 8-10개
- **정렬**: `created_at DESC`

#### 3.2 신상품 섹션 컴포넌트
- **위치**: `components/promotion-section.tsx` 또는 `components/new-products-section.tsx`
- **레이아웃**: 가로 스크롤 가능한 카드 레이아웃
- **표시**: 
  - 섹션 제목: "신상품"
  - 상품 카드 (기존 `ProductCard` 재사용)
  - "더보기" 링크 (선택사항)

#### 3.3 가로 스크롤 구현
- 모바일: 터치 스크롤
- 데스크톱: 마우스 휠 스크롤
- 스크롤 인디케이터 (선택사항)

### 4. 홈 페이지 구조

#### 4.1 섹션 컴포넌트 분리
```
app/page.tsx
├── CategorySection (카테고리 섹션)
├── PromotionSection (프로모션 섹션 - 신상품)
└── ProductList (전체 상품 목록 - 기존)
```

#### 4.2 데이터 페칭
- **카테고리 목록**: `SELECT DISTINCT category FROM products WHERE is_active = true`
- **신상품**: `SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC LIMIT 8`
- **전체 상품**: 기존 로직 유지

### 5. 카테고리별 상품 목록 페이지 (연동)

#### 5.1 라우팅
- **경로**: `/products?category={category}` 또는 `/products/category/[category]`
- **쿼리 파라미터**: `category` (선택사항)

#### 5.2 필터링
- 카테고리 클릭 시 해당 카테고리 상품만 표시
- "전체" 옵션으로 모든 상품 표시

## 📁 파일 구조

```
app/
  page.tsx                          # 홈 페이지 (재구성)
components/
  category-card.tsx                 # 카테고리 카드 컴포넌트
  category-grid.tsx                 # 카테고리 Grid 레이아웃
  promotion-section.tsx             # 프로모션 섹션 (신상품)
  product-card.tsx                  # 기존 상품 카드 (재사용)
  product-grid.tsx                  # 기존 상품 Grid (재사용)
types/
  category.ts                       # 카테고리 타입 정의 (선택사항)
```

## 🔧 기술 스택

- **Next.js 15**: Server Component 사용
- **Supabase**: 카테고리 및 신상품 데이터 페칭
- **Tailwind CSS v4**: Grid 레이아웃 및 스타일링
- **TypeScript**: 타입 안전성 보장

## ✅ 완료 기준

1. 홈 페이지에 카테고리 섹션이 Grid 레이아웃으로 표시됨
2. 카테고리 클릭 시 해당 카테고리 상품 목록으로 이동 (또는 필터링)
3. 신상품 섹션이 가로 스크롤 형태로 표시됨
4. 홈 페이지 레이아웃이 카테고리 → 프로모션 → 전체 상품 순서로 구성됨
5. 모든 섹션이 반응형으로 작동함
6. 로딩/에러 상태가 적절히 처리됨
7. TypeScript 타입이 올바르게 정의됨

## 📝 구현 순서

1. **카테고리 타입 정의** (`types/category.ts` - 선택사항)
2. **카테고리 카드 컴포넌트 생성** (`components/category-card.tsx`)
3. **카테고리 Grid 컴포넌트 생성** (`components/category-grid.tsx`)
4. **카테고리 데이터 페칭 로직** (Server Component)
5. **프로모션 섹션 컴포넌트 생성** (`components/promotion-section.tsx`)
6. **신상품 데이터 페칭 로직** (Server Component)
7. **홈 페이지 레이아웃 재구성** (`app/page.tsx`)
8. **카테고리별 필터링 연동** (선택사항: `/products?category={category}`)

## 🎨 디자인 가이드라인

### 카테고리 카드
- **스타일**: 깔끔하고 모던한 디자인
- **호버 효과**: 그림자 및 약간의 확대 효과
- **색상**: 카테고리별로 다른 색상 사용 (선택사항)

### 프로모션 섹션
- **제목**: "신상품" 또는 "New Arrivals"
- **레이아웃**: 가로 스크롤 가능한 카드 그리드
- **스크롤**: 부드러운 스크롤 애니메이션

### 섹션 간격
- 각 섹션 사이 적절한 여백 (`py-12` 또는 `py-16`)
- 섹션 제목과 내용 사이 간격

## 🔗 관련 파일

- `app/page.tsx`: 홈 페이지
- `components/product-card.tsx`: 상품 카드 (재사용)
- `components/product-grid.tsx`: 상품 Grid (재사용)
- `lib/supabase/client.ts`: Supabase 클라이언트
- `supabase/migrations/db.sql`: 상품 테이블 스키마

## 📌 참고사항

- 카테고리 이름은 한글로 표시 (영문 카테고리 코드를 한글로 매핑)
- 카테고리별 상품 개수는 동적으로 계산
- 신상품은 최근 30일 이내 등록된 상품으로 제한할 수 있음 (선택사항)
- 프로모션 섹션은 나중에 다른 프로모션 타입(특가, 인기 등)으로 확장 가능하도록 설계

