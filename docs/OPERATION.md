# 운영 가이드

모두쇼핑 쇼핑몰의 운영 및 관리 가이드입니다.

## 목차

1. [상품 관리](#상품-관리)
2. [주문 관리](#주문-관리)
3. [사용자 관리](#사용자-관리)
4. [재고 관리](#재고-관리)
5. [모니터링 및 로그](#모니터링-및-로그)
6. [문제 해결](#문제-해결)

---

## 상품 관리

### 상품 등록

상품은 Supabase 대시보드에서 직접 등록합니다.

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → **Table Editor** 메뉴
3. `products` 테이블 선택
4. **Insert** → **Insert row** 클릭
5. 다음 정보 입력:
   - `name`: 상품명 (필수)
   - `description`: 상품 설명
   - `price`: 가격 (숫자, 필수)
   - `stock_quantity`: 재고 수량 (숫자, 필수)
   - `category`: 카테고리 (예: "상의", "하의", "신발" 등)
   - `is_active`: 활성화 여부 (`true`로 설정)
   - `image_url`: 상품 이미지 URL (선택사항)
6. **Save** 클릭

자세한 내용은 [어드민 상품 관리 가이드](./ADMIN_PRODUCT_MANAGEMENT.md)를 참고하세요.

### 상품 수정

1. Supabase Dashboard → **Table Editor** → `products` 테이블
2. 수정할 상품 행 클릭
3. 필드 수정 후 **Save** 클릭

### 상품 비활성화

상품을 일시적으로 판매 중지하려면:

1. 상품 수정 페이지로 이동
2. `is_active` 필드를 `false`로 변경
3. **Save** 클릭

비활성화된 상품은 상품 목록에 표시되지 않지만, 기존 주문 내역에는 남아있습니다.

### 상품 삭제

> ⚠️ **주의**: 상품을 삭제하면 해당 상품과 연결된 주문 내역(`order_items`)에 영향을 줄 수 있습니다. 
> Foreign Key 제약 조건에 따라 주문 내역이 삭제될 수 있으므로 신중하게 진행하세요.

1. Supabase Dashboard → **Table Editor** → `products` 테이블
2. 삭제할 상품 행 선택
3. **Delete** 클릭
4. 확인 대화상자에서 확인

---

## 주문 관리

### 주문 조회

#### Supabase Dashboard에서 조회

1. Supabase Dashboard → **Table Editor** → `orders` 테이블
2. 주문 목록 확인:
   - `id`: 주문 번호
   - `clerk_id`: 주문한 사용자 ID
   - `total_amount`: 총 주문 금액
   - `status`: 주문 상태
   - `created_at`: 주문 일시

#### 주문 상세 조회

1. `orders` 테이블에서 주문 선택
2. `order_items` 테이블에서 해당 `order_id`로 필터링하여 주문 상세 아이템 확인

### 주문 상태 변경

주문 상태는 다음 값들을 가질 수 있습니다:

- `pending`: 결제 대기 (기본값)
- `confirmed`: 주문 확정
- `shipped`: 배송 중
- `delivered`: 배송 완료
- `cancelled`: 주문 취소

#### 상태 변경 방법

1. Supabase Dashboard → **Table Editor** → `orders` 테이블
2. 상태를 변경할 주문 선택
3. `status` 필드 수정
4. **Save** 클릭

### 주문 취소

1. 주문 상태를 `cancelled`로 변경
2. 재고 복구 (필요한 경우):
   - `order_items` 테이블에서 해당 주문의 상품과 수량 확인
   - `products` 테이블에서 각 상품의 `stock_quantity`를 증가시킴

---

## 사용자 관리

### 사용자 조회

1. Supabase Dashboard → **Table Editor** → `users` 테이블
2. 사용자 목록 확인:
   - `clerk_id`: Clerk 사용자 ID
   - `name`: 사용자 이름
   - `created_at`: 가입 일시

### 사용자 정보 수정

1. `users` 테이블에서 사용자 선택
2. 필드 수정 후 **Save** 클릭

> **참고**: 사용자 인증 정보는 Clerk에서 관리됩니다. Supabase의 `users` 테이블은 추가 정보만 저장합니다.

---

## 재고 관리

### 재고 확인

1. Supabase Dashboard → **Table Editor** → `products` 테이블
2. `stock_quantity` 컬럼 확인

### 재고 수정

1. 상품 수정 페이지로 이동
2. `stock_quantity` 필드 수정
3. **Save** 클릭

### 재고 부족 알림

현재 시스템에는 자동 재고 부족 알림 기능이 없습니다. 정기적으로 재고를 확인하고 수동으로 보충해야 합니다.

---

## 모니터링 및 로그

### Supabase 로그 확인

1. Supabase Dashboard → **Logs** 메뉴
2. 다음 로그 확인:
   - **API Logs**: API 요청 로그
   - **Postgres Logs**: 데이터베이스 쿼리 로그
   - **Auth Logs**: 인증 관련 로그

### Vercel 로그 확인

배포된 환경의 경우:

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Logs** 탭에서 실시간 로그 확인

### 에러 모니터링

현재 시스템에는 자동 에러 모니터링이 없습니다. 다음을 정기적으로 확인하세요:

- Supabase 로그에서 에러 확인
- Vercel 로그에서 에러 확인
- 사용자 피드백 수집

---

## 문제 해결

### 일반적인 문제

#### 상품이 표시되지 않음

1. `products` 테이블에서 `is_active`가 `true`인지 확인
2. Supabase 연결 상태 확인
3. 브라우저 캐시 삭제 후 재시도

#### 주문이 생성되지 않음

1. 사용자가 로그인되어 있는지 확인
2. 장바구니에 상품이 있는지 확인
3. 재고가 충분한지 확인
4. Supabase 로그에서 에러 확인

#### 재고가 차감되지 않음

1. 주문 생성 시 재고 차감 로직 확인 (`actions/order.ts`)
2. Supabase 로그에서 에러 확인
3. 수동으로 재고 수정

### 데이터베이스 문제

#### Foreign Key 제약 조건 오류

테이블 간 관계가 올바르게 설정되어 있는지 확인:

- `cart_items.clerk_id` → `users.clerk_id`
- `cart_items.product_id` → `products.id`
- `orders.clerk_id` → `users.clerk_id`
- `order_items.order_id` → `orders.id`
- `order_items.product_id` → `products.id`

#### 데이터 무결성 문제

1. Supabase Dashboard → **Table Editor**에서 데이터 확인
2. 잘못된 데이터 수정 또는 삭제
3. 필요시 마이그레이션 파일 재실행

### 성능 문제

#### 느린 쿼리

1. Supabase Dashboard → **Logs** → **Postgres Logs**에서 느린 쿼리 확인
2. 인덱스 추가 고려:
   - `products.category`에 인덱스
   - `orders.clerk_id`에 인덱스
   - `cart_items.clerk_id`에 인덱스

#### 이미지 로딩 느림

1. 이미지 최적화 (Next.js Image 컴포넌트 사용)
2. CDN 사용 고려
3. 이미지 크기 최적화

---

## 백업 및 복구

### 데이터베이스 백업

Supabase는 자동 백업을 제공합니다:

1. Supabase Dashboard → **Settings** → **Database**
2. **Backups** 섹션에서 백업 확인
3. 필요시 수동 백업 다운로드

### 수동 백업

1. Supabase Dashboard → **SQL Editor**
2. 다음 쿼리 실행하여 데이터 내보내기:
   ```sql
   -- 예시: products 테이블 백업
   COPY products TO '/tmp/products_backup.csv' CSV HEADER;
   ```

### 데이터 복구

1. Supabase Dashboard → **SQL Editor**
2. 백업 파일에서 데이터 복원
3. 또는 Supabase Dashboard의 백업에서 복원

---

## 보안

### 환경변수 관리

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 Vercel 환경변수 설정 사용
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요

### RLS (Row Level Security)

현재 개발 환경에서는 RLS가 비활성화되어 있습니다. 프로덕션 배포 전에는 반드시 RLS를 활성화하세요.

자세한 내용은 [Clerk + Supabase 통합 가이드](./CLERK_SUPABASE_INTEGRATION.md#rls-정책-설정)를 참고하세요.

---

## 정기 점검 항목

### 일일 점검

- [ ] 주문 확인 및 처리
- [ ] 재고 확인
- [ ] 에러 로그 확인

### 주간 점검

- [ ] 사용자 피드백 검토
- [ ] 성능 모니터링
- [ ] 데이터베이스 백업 확인

### 월간 점검

- [ ] 데이터 정리 (불필요한 데이터 삭제)
- [ ] 보안 업데이트 확인
- [ ] 성능 최적화 검토

---

## 문의 및 지원

문제가 발생하거나 도움이 필요한 경우:

1. 프로젝트 문서 확인
2. Supabase/Clerk 공식 문서 참고
3. GitHub Issues에 문제 보고

---

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Clerk 공식 문서](https://clerk.com/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [프로젝트 배포 가이드](./DEPLOYMENT.md)
- [어드민 상품 관리 가이드](./ADMIN_PRODUCT_MANAGEMENT.md)

