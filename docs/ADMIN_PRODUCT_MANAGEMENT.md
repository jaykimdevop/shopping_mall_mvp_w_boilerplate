# 어드민 상품 관리 가이드

## 📋 개요

이 문서는 Supabase 대시보드를 사용하여 상품을 수기로 등록, 수정, 삭제하는 방법을 안내합니다.

**중요**: MVP에서는 별도의 어드민 페이지를 제공하지 않으며, 모든 상품 관리는 Supabase 대시보드를 통해 직접 수행합니다.

## 🎯 목표

- Supabase 대시보드에서 상품을 등록하는 방법 안내
- 상품 필드별 입력 가이드 및 제약사항 설명
- 샘플 데이터 참고용 가이드
- 상품 수정 및 삭제 방법 안내

## 📝 상품 테이블 구조

### 테이블명: `products`

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY, 자동 생성 | 상품 고유 ID |
| `name` | TEXT | NOT NULL | 상품명 |
| `description` | TEXT | NULL 허용 | 상품 설명 |
| `price` | DECIMAL(10,2) | NOT NULL, >= 0 | 가격 (원 단위) |
| `category` | TEXT | NULL 허용 | 카테고리 코드 |
| `stock_quantity` | INTEGER | DEFAULT 0, >= 0 | 재고 수량 |
| `is_active` | BOOLEAN | DEFAULT true | 판매 활성화 여부 |
| `created_at` | TIMESTAMP | NOT NULL, 자동 생성 | 등록일시 |
| `updated_at` | TIMESTAMP | NOT NULL, 자동 갱신 | 수정일시 |

## 🚀 Supabase 대시보드에서 상품 등록하기

### 1. Supabase 대시보드 접속

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **Table Editor** 클릭
4. `products` 테이블 선택

### 2. 새 상품 추가

1. **Insert row** 버튼 클릭
2. 필수 필드 입력:
   - **name**: 상품명 (예: "무선 블루투스 이어폰")
   - **price**: 가격 (예: 89000)
3. 선택 필드 입력:
   - **description**: 상품 설명 (예: "고음질 노이즈 캔슬링 기능, 30시간 재생")
   - **category**: 카테고리 코드 (예: "electronics", "clothing", "books" 등)
   - **stock_quantity**: 재고 수량 (예: 150)
   - **is_active**: 판매 활성화 여부 (기본값: true)
4. **Save** 버튼 클릭

### 3. 필드별 입력 가이드

#### name (상품명)
- **필수**: ✅
- **형식**: 텍스트
- **예시**: "무선 블루투스 이어폰", "면 100% 기본 티셔츠"
- **주의사항**: 
  - 최대 길이 제한 없음
  - 명확하고 이해하기 쉬운 이름 사용 권장

#### description (상품 설명)
- **필수**: ❌
- **형식**: 텍스트 (여러 줄 가능)
- **예시**: "고음질 노이즈 캔슬링 기능, 30시간 재생"
- **주의사항**: 
  - 상세한 설명을 입력하면 사용자에게 도움이 됨
  - HTML 태그 사용 불가 (일반 텍스트만)

#### price (가격)
- **필수**: ✅
- **형식**: 숫자 (소수점 2자리까지)
- **예시**: 89000, 25000.50
- **주의사항**: 
  - 0 이상의 값만 입력 가능
  - 원 단위로 입력 (예: 89000 = 89,000원)

#### category (카테고리)
- **필수**: ❌
- **형식**: 텍스트 (영문 소문자 권장)
- **사용 가능한 카테고리 코드**:
  - `electronics`: 전자제품
  - `clothing`: 의류
  - `books`: 도서
  - `food`: 식품
  - `sports`: 스포츠
  - `beauty`: 뷰티
  - `home`: 생활/가정
- **주의사항**: 
  - 카테고리 코드는 대소문자를 구분합니다
  - 새로운 카테고리를 추가할 수 있으나, 한글 이름 매핑은 `types/category.ts`에 추가 필요

#### stock_quantity (재고 수량)
- **필수**: ❌ (기본값: 0)
- **형식**: 정수
- **예시**: 150, 0, 300
- **주의사항**: 
  - 0 이상의 값만 입력 가능
  - 0이면 "품절"로 표시됨
  - 10개 미만이면 "재고 부족"으로 표시됨

#### is_active (판매 활성화)
- **필수**: ❌ (기본값: true)
- **형식**: 불린 (true/false)
- **주의사항**: 
  - `false`로 설정하면 상품 목록에 표시되지 않음
  - 삭제 대신 비활성화하는 것을 권장

## 📋 샘플 데이터 참고

### 전자제품 카테고리
```sql
name: "무선 블루투스 이어폰"
description: "고음질 노이즈 캔슬링 기능, 30시간 재생"
price: 89000
category: "electronics"
stock_quantity: 150
is_active: true
```

### 의류 카테고리
```sql
name: "면 100% 기본 티셔츠"
description: "심플한 디자인, 5가지 컬러"
price: 25000
category: "clothing"
stock_quantity: 300
is_active: true
```

### 도서 카테고리
```sql
name: "클린 코드"
description: "소프트웨어 장인 정신의 바이블"
price: 33000
category: "books"
stock_quantity: 50
is_active: true
```

## ✏️ 상품 수정하기

1. Supabase 대시보드에서 `products` 테이블 열기
2. 수정할 상품 행 클릭
3. 필드 값 수정
4. **Save** 버튼 클릭
5. `updated_at` 필드는 자동으로 갱신됨

## 🗑️ 상품 삭제하기

### 방법 1: 완전 삭제 (권장하지 않음)
1. Supabase 대시보드에서 `products` 테이블 열기
2. 삭제할 상품 행 선택
3. **Delete** 버튼 클릭
4. **주의**: 주문 내역(`order_items`)에 참조된 상품은 삭제할 수 없음

### 방법 2: 비활성화 (권장)
1. `is_active` 필드를 `false`로 변경
2. 상품은 데이터베이스에 유지되지만 목록에 표시되지 않음
3. 주문 내역 참조 문제 없음

## 📊 대량 상품 등록하기

### SQL Editor 사용

1. Supabase 대시보드에서 **SQL Editor** 클릭
2. 다음 SQL 쿼리 실행:

```sql
INSERT INTO products (name, description, price, category, stock_quantity) VALUES
('상품명 1', '상품 설명 1', 10000, 'electronics', 100),
('상품명 2', '상품 설명 2', 20000, 'clothing', 200),
('상품명 3', '상품 설명 3', 30000, 'books', 50);
```

3. 여러 상품을 한 번에 등록 가능

## 🔍 상품 조회 및 필터링

### Table Editor에서 필터링

1. `products` 테이블 상단의 필터 아이콘 클릭
2. 필터 조건 설정:
   - `is_active = true`: 활성화된 상품만
   - `category = 'electronics'`: 특정 카테고리만
   - `stock_quantity < 10`: 재고 부족 상품만
3. 정렬 옵션 사용 가능

### SQL Editor에서 조회

```sql
-- 모든 활성화된 상품 조회
SELECT * FROM products WHERE is_active = true;

-- 특정 카테고리 상품 조회
SELECT * FROM products WHERE category = 'electronics' AND is_active = true;

-- 재고 부족 상품 조회
SELECT * FROM products WHERE stock_quantity < 10 AND is_active = true;

-- 가격순 정렬
SELECT * FROM products WHERE is_active = true ORDER BY price DESC;
```

## ⚠️ 주의사항

### 데이터 무결성
- `price`는 0 이상의 값만 입력 가능
- `stock_quantity`는 0 이상의 값만 입력 가능
- 주문 내역(`order_items`)에 참조된 상품은 삭제할 수 없음

### 카테고리 관리
- 새로운 카테고리를 추가할 경우, `types/category.ts`의 `CATEGORY_NAMES`에 한글 이름 매핑 추가 필요
- 카테고리 코드는 영문 소문자 사용 권장

### 성능 고려사항
- 대량 상품 등록 시 SQL Editor 사용 권장
- `is_active` 인덱스가 있어 필터링이 빠름
- `category` 인덱스가 있어 카테고리별 조회가 빠름

## 🔗 관련 파일

- `supabase/migrations/db.sql`: 상품 테이블 스키마 정의
- `types/product.ts`: Product 타입 정의
- `types/category.ts`: 카테고리 타입 및 한글 이름 매핑

## 📚 추가 리소스

- [Supabase Table Editor 가이드](https://supabase.com/docs/guides/database/tables)
- [Supabase SQL Editor 가이드](https://supabase.com/docs/guides/database/overview)

