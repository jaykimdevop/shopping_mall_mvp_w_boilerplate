# Phase 2: 상품 기능 - 구현 목표

## 홈 페이지 > 상품 목록 (Grid 레이아웃) 구현 목표

### 📋 개요

홈 페이지에 상품 목록을 Grid 레이아웃으로 표시하여 사용자가 바로 상품을 탐색할 수 있도록 합니다.

### 🎯 구현 목표

#### 1. 홈 페이지 상품 목록 표시
- **위치**: `app/page.tsx` (홈 페이지)
- **방식**: 홈 페이지에 직접 상품 목록을 Grid 레이아웃으로 표시
- **데이터 소스**: Supabase `products` 테이블
- **필터링**: `is_active = true`인 상품만 표시

#### 2. 반응형 Grid 레이아웃
- **모바일**: 1열 (grid-cols-1)
- **태블릿**: 2열 (sm:grid-cols-2)
- **데스크톱**: 3-4열 (lg:grid-cols-3, xl:grid-cols-4)
- **간격**: 적절한 gap 설정 (모바일: gap-4, 데스크톱: gap-6)

#### 3. 상품 카드 컴포넌트
- **컴포넌트 위치**: `components/product-card.tsx`
- **표시 정보**:
  - 상품 이미지 (이미지가 없는 경우 플레이스홀더)
  - 상품명 (`name`)
  - 가격 (`price`) - 천 단위 콤마 표시
  - 카테고리 (`category`)
  - 재고 상태 (`stock_quantity`) - 재고 부족 시 표시
  - 설명 (`description`) - 일부만 표시 (최대 2줄, 말줄임표 처리)

#### 4. 상품 클릭 동작
- 상품 카드 클릭 시 상품 상세 페이지로 이동
- 라우팅: `/products/[id]` (Phase 2 후반에 구현 예정)
- 현재는 클릭 가능한 상태만 준비

#### 5. 데이터 페칭
- **방식**: Server Component에서 데이터 페칭
- **함수**: `createClerkSupabaseClient()` 사용
- **쿼리**: 
  ```sql
  SELECT * FROM products 
  WHERE is_active = true 
  ORDER BY created_at DESC
  LIMIT 20
  ```
- **에러 처리**: 에러 발생 시 사용자 친화적 메시지 표시
- **로딩 상태**: Suspense를 사용한 로딩 처리

#### 6. UI/UX 요구사항
- **로딩 상태**: 스켈레톤 UI 또는 로딩 스피너
- **에러 상태**: 에러 메시지 표시
- **빈 상태**: 상품이 없을 때 안내 메시지
- **반응형**: 모든 화면 크기에서 최적화된 레이아웃
- **접근성**: 키보드 네비게이션, 스크린 리더 지원

### 📁 파일 구조

```
app/
  page.tsx                    # 홈 페이지 (상품 목록 표시)
components/
  product-card.tsx            # 상품 카드 컴포넌트
  product-grid.tsx           # 상품 Grid 레이아웃 컴포넌트 (선택사항)
types/
  product.ts                 # Product 타입 정의
```

### 🔧 기술 스택

- **Next.js 15**: Server Component 사용
- **Supabase**: `createClerkSupabaseClient()`로 데이터 페칭
- **Tailwind CSS v4**: Grid 레이아웃 및 반응형 디자인
- **TypeScript**: 타입 안전성 보장

### ✅ 완료 기준

1. 홈 페이지에서 Supabase에서 상품 데이터를 성공적으로 가져옴
2. 반응형 Grid 레이아웃이 모든 화면 크기에서 올바르게 표시됨
3. 상품 카드에 모든 필수 정보가 표시됨
4. 상품 클릭 시 상세 페이지로 이동 가능 (라우팅 준비)
5. 로딩, 에러, 빈 상태가 적절히 처리됨
6. TypeScript 타입이 올바르게 정의됨

### 📝 구현 순서

1. **Product 타입 정의** (`types/product.ts`)
2. **상품 카드 컴포넌트 생성** (`components/product-card.tsx`)
3. **홈 페이지에 상품 목록 표시** (`app/page.tsx`)
4. **반응형 Grid 레이아웃 적용**
5. **로딩/에러/빈 상태 처리**
6. **스타일링 및 접근성 개선**

### 🎨 디자인 가이드라인

- **카드 스타일**: 깔끔하고 모던한 디자인
- **이미지**: 16:9 비율, object-fit: cover
- **가격 표시**: 굵은 폰트, 강조 색상
- **재고 부족**: 빨간색 텍스트 또는 배지
- **호버 효과**: 카드에 그림자 및 약간의 확대 효과

### 🔗 관련 파일

- `app/page.tsx`: 홈 페이지
- `lib/supabase/server.ts`: Supabase 클라이언트
- `supabase/migrations/db.sql`: 상품 테이블 스키마

