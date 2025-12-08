## 1차 업데이트: 보일러플레이트 기본 인프라 + 기본 쇼핑몰 기능 구축

- [x] Phase 1: 기본 인프라
  - [x] Next.js 프로젝트 셋업 (pnpm, App Router, React 19)
  - [x] Clerk 연동 (로그인/회원가입, 미들웨어 보호)
  - [x] 기본 레이아웃/네비게이션 구성 (`app/layout.tsx`, `components/Navbar.tsx`)
  - [x] Supabase 프로젝트 연결 및 환경변수 세팅 (`.env.local`)
  - [x] DB 스키마 준비: `products`, `cart_items`, `orders`, `order_items` (개발 환경 RLS 비활성화)
  - [x] 마이그레이션 작성/적용 (`supabase/migrations/*`)

- [x] Phase 2: 상품 기능
  - [x] 홈 페이지: 상품 목록 Grid 레이아웃 표시 (기본 구현 완료)
  - [x] 홈 페이지: 프로모션/카테고리 진입 동선 (구현 완료)
  - [x] 상품 목록 페이지: 페이지네이션/정렬/카테고리 필터 (구현 완료)
  - [x] 상품 상세 페이지: 재고/가격/설명 표시 (구현 완료)
  - [x] 어드민 상품 등록은 대시보드에서 수기 관리(문서화 완료)

- [x] Phase 3: 장바구니 & 주문
  - [x] 장바구니 담기/삭제/수량 변경 (`cart_items` 연동)
  - [x] 주문 생성 흐름(주소/메모 입력 포함)
  - [x] 주문테이블 저장(`orders`, `order_items`) 및 합계 검증

- [ ] Phase 4: 결제 통합 (Toss Payments 테스트 모드)
  - [ ] 결제위젯 연동 및 클라이언트 플로우 구축
  - [ ] 결제 성공/실패 콜백 처리
  - [ ] 결제 완료 후 주문 상태 업데이트(`orders.status`)

- [x] Phase 5: 마이페이지
  - [x] 주문 내역 목록 조회 (사용자별 `orders`)
  - [x] 주문 상세 보기 (`order_items` 포함)

- [x] Phase 6: 테스트 & 배포
  - [x] 전체 사용자 플로우 E2E 점검 (Playwright 테스트 구축)
  - [x] 주요 버그 수정 및 예외처리 강화
  - [x] Vercel 배포 설정 및 환경변수 구성 (`vercel.json`, `docs/DEPLOYMENT.md`)

- [x] 공통 작업 & 문서화
  - [x] 오류/로딩/비어있는 상태 UI 정비 (상품 목록에 적용 완료)
  - [x] 타입 안전성 강화 (Zod + react-hook-form 적용 구간)
  - [x] README/PRD 반영, 운영 가이드 업데이트 (`README.md`, `docs/OPERATION.md`)
  - [x] 접근성/반응형/다크모드 점검 (상품 목록에 적용 완료)

- [x] 환경/리포지토리 기초 세팅
  - [x] `.gitignore` / `.cursorignore` 정비
  - [x] `eslint.config.mjs` / 포맷터 설정 확정 (Biome 설정 완료)
  - [x] 아이콘/OG 이미지/파비콘 추가 (`public/`, `app/layout.tsx` 메타데이터)
  - [x] SEO 관련 파일 (`robots.ts`, `sitemap.ts`, `manifest.ts`)

---

## 2차 업데이트: 비회원 기본 기능

- [x] Phase 7: 비회원 장바구니 기능
  - [x] 데이터베이스 스키마 수정 (`cart_items`, `orders` 테이블에 비회원 지원 컬럼 추가)
  - [x] 비회원 장바구니 타입 정의 (`types/cart.ts`)
  - [x] 로컬 스토리지 유틸리티 생성 (`lib/storage.ts`)
  - [x] 로컬 스토리지 장바구니 훅 생성 (`hooks/use-guest-cart.ts`)
  - [x] 장바구니 Server Actions 수정: 비회원 지원 (`actions/cart.ts`)
  - [x] 장바구니 컴포넌트 수정: 비회원 장바구니 표시 및 관리
    - [x] `components/add-to-cart-button.tsx`
    - [x] `components/cart-badge.tsx`
    - [x] `components/cart-items-list.tsx`
    - [x] `components/cart-summary.tsx`
    - [x] `components/guest-cart-item.tsx` (신규)

- [x] Phase 8: 비회원 주문 기능
  - [x] 주문 타입 정의 수정: 비회원 주문 필드 추가 (`types/order.ts`)
  - [x] 비회원 주문 생성 기능 구현 (`actions/order.ts`)
  - [x] 비회원 주문 조회 기능 구현 (주문 번호 + 이메일/전화번호)
    - [x] `actions/order.ts` - `getGuestOrder` 함수
    - [x] `components/guest-order-lookup.tsx` (신규)
    - [x] `app/orders/guest/page.tsx` (신규)
  - [x] 체크아웃 페이지 및 폼 수정: 비회원 체크아웃 지원
    - [x] `app/checkout/page.tsx`
    - [x] `components/checkout-content.tsx` (신규)
    - [x] `components/guest-checkout-form.tsx` (신규)
    - [x] `components/order-summary.tsx`
  - [x] 비회원 주문 완료 페이지 (`app/orders/guest/complete/page.tsx`)

- [x] Phase 9: 로그인 시 장바구니 동기화
  - [x] 장바구니 동기화 훅 생성 (`hooks/use-sync-cart.ts`)
  - [x] SyncUserProvider에 장바구니 동기화 추가 (`components/providers/sync-user-provider.tsx`)
  - [x] 네비게이션 바 업데이트: 비회원 주문 조회 링크 추가 (`components/Navbar.tsx`)

---

## 3차 업데이트: 디자인 리뉴얼 (Coloshop Design)

- [x] Phase 10: 디자인 시스템 구축
  - [x] 색상 팔레트 정의 (Primary: #00A2FF, Dark: #1e1e27, Light Purple: #b5aec4)
  - [x] Poppins 폰트 적용 (Google Fonts)
  - [x] CSS 변수 및 Tailwind 테마 설정 (`app/globals.css`)

- [x] Phase 11: 레이아웃 컴포넌트 리디자인
  - [x] 네비게이션 바 1단 구조 (상단바 제거, 언어 선택 메인 내비로 이동)
  - [x] 푸터 컴포넌트 신규 생성 (`components/Footer.tsx`)
  - [x] 모바일 햄버거 메뉴 구현

- [x] Phase 12: 홈페이지 섹션 구현
  - [x] 히어로 슬라이더 (`components/hero-slider.tsx`)
  - [x] 카테고리 배너 3컬럼 (`components/category-banner.tsx`)
  - [x] 상품 그리드 New Arrivals 스타일 (`components/product-card.tsx`, `components/product-grid.tsx` 수정)
  - [x] Deal of the Week 섹션 (`components/deal-of-week.tsx`)
  - [x] 베스트셀러 상품 슬라이더 (`components/product-slider.tsx`)
  - [x] 혜택 섹션 4컬럼 (`components/benefits-section.tsx`)
  - [x] 뉴스레터 구독 섹션 (`components/newsletter-section.tsx`)

- [x] Phase 13: 상세 페이지 스타일링
  - [x] 상품 목록 페이지: 카테고리 필터 탭, 정렬 버튼 그룹 (`app/products/page.tsx`)
  - [x] 상품 상세 페이지: 이미지 갤러리, 탭 UI (`app/products/[id]/page.tsx`)
  - [x] 장바구니 페이지 스타일 업데이트 (`app/cart/page.tsx`)

- [x] Phase 14: UI 컴포넌트 스타일 오버라이드
  - [x] 버튼 스타일 (Primary: #00A2FF, Secondary: #1e1e27)
  - [x] 카드 호버 효과 (그림자 + 테두리 + 스케일)
  - [x] 수량 선택 컴포넌트 스타일 (`components/quantity-selector.tsx`)

- [x] Phase 15: 다크모드 대응
  - [x] 모든 신규 컴포넌트에 다크모드 변형 추가 (`app/globals.css` .dark 섹션)
  - [x] 테마 토글 버튼 추가 (`components/theme-toggle.tsx`)

---

## 4차 업데이트: 관리자 페이지 & 코드 정리

- [x] Phase 16: 관리자 인증 및 권한 시스템
  - [x] Clerk publicMetadata를 활용한 관리자 역할 정의 (`role: admin`)
    - 관리자 설정: Clerk Dashboard > Users > publicMetadata에 `{ "role": "admin" }` 추가
  - [x] 관리자 전용 미들웨어 가드 생성 (`middleware.ts` - 로그인 필수)
  - [x] 관리자 레이아웃 생성 (`app/admin/layout.tsx`)
    - 서버 컴포넌트에서 `currentUser()`로 `publicMetadata.role` 직접 확인
    - 사이드바 네비게이션 (대시보드, 상품/주문/배너/회원/배송 관리)
    - 사이드바 하단: 사용자 프로필(UserButton + 이름/이메일), 테마 토글, 쇼핑몰 바로가기
  - [x] 관리자 접근 권한 체크 훅 생성 (`hooks/use-admin.ts`)
  - [x] 관리자 대시보드 페이지 생성 (`app/admin/page.tsx`) - 기본 구조
  - [x] Navbar에 관리자 대시보드 버튼 추가 (관리자만 표시)
  - [x] 로그인/회원가입 페이지 생성 (`app/sign-in`, `app/sign-up`)
  - [x] 사용자 타입 정의 (`types/user.ts`)
  - [x] 조건부 레이아웃 컴포넌트 생성 (`components/conditional-layout.tsx`)
    - `/admin` 경로에서 Navbar/Footer 숨김 처리

- [x] Phase 17: 관리자 대시보드
  - [x] 대시보드 메인 페이지 (`app/admin/page.tsx`)
  - [x] 통계 카드 컴포넌트 (총 주문수, 매출, 상품수, 회원수) - DB 연동 완료
  - [x] 최근 주문 목록 위젯 - 상태별 배지, 고객명, 금액 표시
  - [x] 재고 부족 상품 알림 위젯 - 재고 10개 이하 표시, 품절 강조
  - [x] Server Actions 생성 (`actions/admin/dashboard.ts`)
  - [ ] 일별/월별 매출 차트 (선택사항 - 추후 구현)

- [x] Phase 18: 상품 관리 페이지
  - [x] DB 스키마 수정: `products` 테이블에 `image_url` 컬럼 추가
    - 마이그레이션 파일: `supabase/migrations/20251205180000_add_image_url_to_products.sql`
    - 타입 정의 업데이트: `types/product.ts` (CreateProductInput, UpdateProductInput 등 추가)
  - [x] 상품 목록 페이지 (`app/admin/products/page.tsx`)
    - 검색, 필터링, 정렬 기능
    - 활성/비활성 상태 토글
    - 일괄 삭제 기능
    - 페이지네이션
  - [x] 상품 등록 페이지 (`app/admin/products/new/page.tsx`)
    - 상품 정보 입력 폼 (react-hook-form + Zod)
    - 이미지 업로드 (Supabase Storage 연동)
    - 공통 폼 컴포넌트: `components/admin/product-form.tsx`
  - [x] 상품 수정 페이지 (`app/admin/products/[id]/edit/page.tsx`)
  - [x] 상품 Server Actions 생성 (`actions/admin/product.ts`)
    - `getAdminProducts`, `getProductById`, `getCategories`
    - `createProduct`, `updateProduct`, `deleteProduct`, `deleteProducts`
    - `toggleProductStatus`, `uploadProductImage`, `deleteProductImage`
  - [x] 상품 카드 이미지 표시 업데이트
    - `components/product-card.tsx`, `components/product-slider.tsx`
    - `app/products/[id]/page.tsx`
  - [x] 유틸리티 함수 추가: `lib/utils.ts` - `formatCurrency()`
  - [x] Next.js 이미지 설정: `next.config.ts` - Supabase Storage 도메인 허용
  - [x] AI 상품 이미지 생성 기능 (Gemini Imagen API)
    - [x] Gemini API 클라이언트 설정 (`lib/gemini.ts`)
    - [x] AI 이미지 생성 Server Actions (`actions/admin/ai-image.ts`)
    - [x] AI 이미지 생성 공통 UI 컴포넌트 (`components/admin/ai-image-generator.tsx`)
    - [x] 상품 폼에 "AI로 이미지 생성" 버튼 추가 (`components/admin/product-form.tsx`)
    - [x] 흰색 배경, 1024x1024px (1:1 정사각형) 이미지 생성
    - [x] 기본 프롬프트 제공 (관리자가 수정 가능)
    - [x] 생성된 이미지 `generated_images` 테이블에 보관 (재사용 가능)
    - [x] 환경변수: `GEMINI_API_KEY`
    - [x] 다양한 이미지 사이즈 고려 (썸네일, 상품 카드, 상세 페이지)

- [x] Phase 19: 주문 관리 페이지
  - [x] 주문 목록 페이지 (`app/admin/orders/page.tsx`)
    - 상태별 필터링 (pending, confirmed, shipped, delivered, cancelled)
    - 날짜 범위 필터링
    - 검색 기능 (주문번호, 고객명)
    - 정렬 기능 (최신순, 오래된순, 금액순)
    - 페이지네이션
  - [x] 주문 상세 페이지 (`app/admin/orders/[id]/page.tsx`)
    - 주문 정보, 배송지, 주문 아이템 표시
    - 주문 상태 변경 기능
    - 주문 메모 추가/수정 기능
  - [x] 주문 상태 배지 컴포넌트 (`components/admin/order-status-badge.tsx`)
    - 상태별 색상 구분 (pending: 노랑, confirmed: 파랑, shipped: 보라, delivered: 초록, cancelled: 빨강)
  - [x] 주문 Server Actions 생성 (`actions/admin/order.ts`)
    - `getAdminOrders`, `getOrderById`, `updateOrderStatus`, `cancelOrder`, `updateOrderNote`, `getOrderStatusCounts`
  - [x] 주문 타입 정의 추가 (`types/order.ts`)
    - `AdminOrderQueryOptions`, `OrderWithCustomer`, `PaginatedOrdersResponse`, `ORDER_STATUS_LABELS`, `ORDER_STATUS_LIST`

- [x] Phase 20: 배너/슬라이더 관리 페이지 (AI 이미지 생성 포함)
  - [x] DB 스키마 생성 (`supabase/migrations/20251206000000_create_banners_and_generated_images.sql`)
    - [x] `banners` 테이블 (id, title, subtitle, description, cta_text, cta_link, bg_color, image_url, product_id, sort_order, is_active)
    - [x] `generated_images` 테이블 (id, product_id, image_url, prompt, image_type, is_used, created_at)
    - [x] 인덱스 및 트리거 설정
    - [x] RLS 비활성화 (개발 환경)
  - [x] 배너 타입 정의 (`types/banner.ts`)
    - [x] Banner, CreateBannerInput, UpdateBannerInput, BannerWithProduct
    - [x] GeneratedImage, GeneratedImageType 타입
    - [x] 기본 프롬프트 상수 (DEFAULT_PRODUCT_IMAGE_PROMPT, DEFAULT_BANNER_IMAGE_PROMPT)
    - [x] 이미지 사이즈 상수 (IMAGE_SIZES)
    - [x] 배경색 프리셋 (BANNER_BG_COLOR_PRESETS)
  - [x] 배너 목록 페이지 (`app/admin/banners/page.tsx`)
    - [x] 드래그 앤 드롭 순서 변경 (`banner-list-client.tsx`)
    - [x] 활성/비활성 상태 토글
    - [x] 배너 미리보기 (이미지 또는 그라데이션)
    - [x] 삭제 확인 다이얼로그
  - [x] 배너 등록/수정 페이지 (`app/admin/banners/new/page.tsx`, `[id]/edit/page.tsx`)
    - [x] 상품 선택 (검색 기능)
    - [x] 프로모션 정보 입력 (제목, 부제목, 설명, CTA 버튼)
    - [x] AI 배너 이미지 생성 기능
      - [x] "AI로 배너 이미지 생성" 버튼 클릭 시에만 생성 (자동 생성 없음)
      - [x] 1792x1024px (16:9 가로형) 이미지 생성 (Imagen 3.0)
      - [x] 기본 프롬프트 제공 (관리자가 수정 가능)
      - [x] 마음에 들 때까지 재생성 가능
      - [x] "이 이미지로 확정" 버튼으로 최종 선택
    - [x] 이전에 생성한 이미지 갤러리에서 재사용 가능
    - [x] 배경색 선택 옵션 (8가지 그라데이션 프리셋)
    - [x] 이미지 업로드 기능
  - [x] 배너 폼 컴포넌트 (`components/admin/banner-form.tsx`)
  - [x] 배너 Server Actions 생성 (`actions/admin/banner.ts`)
    - [x] `getBanners`, `getActiveBanners`, `getBannerById`
    - [x] `createBanner`, `updateBanner`, `deleteBanner`, `deleteBanners`
    - [x] `reorderBanners`, `toggleBannerStatus`
    - [x] `uploadBannerImage`, `deleteBannerImage`
  - [x] 히어로 슬라이더 컴포넌트 수정
    - [x] `components/hero-slider.tsx` - 서버 컴포넌트로 변경, DB 연동
    - [x] `components/hero-slider-client.tsx` - 클라이언트 캐러셀 UI
    - [x] 하드코딩된 데이터 → DB에서 동적으로 로드
    - [x] 활성화된 배너만 표시, sort_order 순서대로
    - [x] 배너가 없으면 기본 슬라이드 표시
    - [x] 이미지 배너 또는 그라데이션 배경 지원

- [x] Phase 21: 회원 관리 페이지
  - [x] DB 스키마 수정: `users` 테이블에 회원 등급 관련 컬럼 추가
    - `email`: TEXT (Clerk에서 동기화)
    - `tier`: TEXT (회원 등급: 'normal' | 'vip')
    - `updated_at`: TIMESTAMP (자동 업데이트 트리거)
    - 마이그레이션 파일: `supabase/migrations/20251208000000_add_user_tier.sql`
  - [x] 타입 정의 확장 (`types/user.ts`)
    - `UserTier`, `USER_TIERS`, `USER_TIER_LABELS` 추가
    - `AdminUser`, `AdminUserDetail`, `AdminUserQueryOptions` 추가
    - `PaginatedUsersResponse`, `UserOrderStats`, `UserOrderSummary` 추가
  - [x] 회원 Server Actions 생성 (`actions/admin/user.ts`)
    - `getAllUsers`: 회원 목록 조회 (Clerk API + Supabase 조인)
    - `getUserDetail`: 회원 상세 조회 (주문 내역 포함)
    - `updateUserRole`: 역할 변경 (Clerk publicMetadata 업데이트)
    - `updateUserTier`: 등급 변경 (Supabase users 테이블 업데이트)
    - `getUserOrderStats`: 회원별 주문 통계 조회
    - `getTotalUserCount`, `getUserCountByTier`: 회원 수 통계
  - [x] 회원 목록 페이지 (`app/admin/users/page.tsx`)
    - Clerk + Supabase users 테이블 연동
    - 검색 (이름, 이메일)
    - 필터링 (역할: 전체/관리자/일반, 등급: 전체/VIP/일반)
    - 정렬 (가입일순, 이름순, 주문 횟수순, 구매액순)
    - 페이지네이션 (10개씩)
    - 역할/등급 인라인 변경 기능
  - [x] 회원 상세 페이지 (`app/admin/users/[id]/page.tsx`)
    - 프로필 카드 (이미지, 이름, 이메일, 역할/등급 배지, 가입일, 마지막 로그인)
    - 통계 카드 (총 주문, 총 구매액, 평균 주문액)
    - 역할/등급 관리 섹션 (드롭다운으로 변경)
    - 최근 주문 내역 테이블 (최대 10개, 전체 보기 링크)
  - [x] UI 컴포넌트 생성
    - `components/admin/user-role-badge.tsx`: 역할 배지 (관리자: 보라색, 일반: 회색)
    - `components/admin/user-tier-badge.tsx`: 등급 배지 (VIP: 금색, 일반: 테두리만)
  - [x] 사용자 동기화 업데이트 (`app/api/sync-user/route.ts`)
    - 이메일 필드 동기화 추가

- [x] Phase 22: 배송 관리 페이지
  - [x] DB 스키마 수정: `orders` 테이블에 배송 관련 컬럼 추가
    - `tracking_number` (운송장 번호)
    - `shipping_carrier` (배송 업체)
    - `shipped_at`, `delivered_at` (배송/도착 일시)
    - 마이그레이션 파일: `supabase/migrations/20251208100000_add_shipping_columns.sql`
  - [x] 배송 목록 페이지 (`app/admin/shipping/page.tsx`)
    - 배송 상태별 필터링 (배송 대기, 배송 중, 배송 완료)
    - 검색 (주문번호, 수령인명, 운송장 번호)
    - 배송 업체별 필터, 날짜 범위 필터
    - 인라인 운송장 번호 입력
    - 운송장 번호 일괄 입력 기능 (`components/admin/bulk-tracking-modal.tsx`)
  - [x] 배송 상세/수정 기능
    - 운송장 번호 입력/삭제 (`app/admin/orders/[id]/page.tsx` 배송 정보 섹션 추가)
    - 배송 상태 변경 (shipped → delivered)
    - 배송 조회 링크 (각 택배사 조회 페이지 연결)
  - [x] 배송 Server Actions 생성 (`actions/admin/shipping.ts`)
    - `getShippingList`, `getShippingStatusCounts`
    - `updateTrackingNumber`, `bulkUpdateTracking`, `removeTrackingNumber`
    - `markAsDelivered`, `cancelDelivery`
  - [x] 타입 정의 확장 (`types/order.ts`)
    - `ShippingCarrier`, `SHIPPING_CARRIERS`, `SHIPPING_CARRIER_LABELS`
    - `SHIPPING_TRACKING_URLS` (배송 조회 URL 패턴)
    - `ShippingStatus`, `AdminShippingQueryOptions`, `ShippingOrder`

- [ ] Phase 23: 코드 정리 및 최적화
  - [ ] 디버깅 로그 정리 (`actions/cart.ts`, `actions/order.ts`)
  - [ ] 테스트 페이지 제거 또는 개발 환경 전용으로 분리
  - [ ] 레거시 파일 정리 (`lib/supabase.ts` 제거 또는 deprecated 표시)
  - [ ] TypeScript 타입 자동 생성 (`pnpm supabase gen types typescript`)
  - [ ] 관리자 페이지 E2E 테스트 작성