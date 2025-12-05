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

- [ ] Phase 16: 관리자 인증 및 권한 시스템
  - [ ] Clerk 메타데이터를 활용한 관리자 역할 정의 (`role: admin`)
  - [ ] 관리자 전용 미들웨어 가드 생성 (`middleware.ts` 확장)
  - [ ] 관리자 레이아웃 생성 (`app/admin/layout.tsx`)
  - [ ] 관리자 접근 권한 체크 훅 생성 (`hooks/use-admin.ts`)

- [ ] Phase 17: 관리자 대시보드
  - [ ] 대시보드 메인 페이지 (`app/admin/page.tsx`)
  - [ ] 통계 카드 컴포넌트 (총 주문수, 매출, 상품수, 회원수)
  - [ ] 최근 주문 목록 위젯
  - [ ] 재고 부족 상품 알림 위젯
  - [ ] 일별/월별 매출 차트 (선택사항)

- [ ] Phase 18: 상품 관리 페이지
  - [ ] DB 스키마 수정: `products` 테이블에 `image_url` 컬럼 추가
  - [ ] 상품 목록 페이지 (`app/admin/products/page.tsx`)
    - 검색, 필터링, 정렬 기능
    - 활성/비활성 상태 토글
    - 일괄 삭제 기능
  - [ ] 상품 등록 페이지 (`app/admin/products/new/page.tsx`)
    - 상품 정보 입력 폼 (react-hook-form + Zod)
    - 이미지 업로드 (Supabase Storage 연동)
  - [ ] 상품 수정 페이지 (`app/admin/products/[id]/edit/page.tsx`)
  - [ ] 상품 Server Actions 생성 (`actions/admin/product.ts`)
    - `createProduct`, `updateProduct`, `deleteProduct`, `toggleProductStatus`

- [ ] Phase 19: 주문 관리 페이지
  - [ ] 주문 목록 페이지 (`app/admin/orders/page.tsx`)
    - 상태별 필터링 (pending, confirmed, shipped, delivered, cancelled)
    - 날짜 범위 필터링
    - 검색 기능 (주문번호, 고객명, 이메일)
  - [ ] 주문 상세 페이지 (`app/admin/orders/[id]/page.tsx`)
    - 주문 정보, 배송지, 주문 아이템 표시
    - 주문 상태 변경 기능
    - 주문 메모 추가 기능
  - [ ] 주문 Server Actions 생성 (`actions/admin/order.ts`)
    - `getAllOrders`, `updateOrderStatus`, `cancelOrder`, `addOrderNote`

- [ ] Phase 20: 배너/슬라이더 관리 페이지
  - [ ] DB 스키마 생성: `banners` 테이블 (id, title, subtitle, description, cta_text, cta_link, bg_color, image_url, sort_order, is_active)
  - [ ] 배너 타입 정의 (`types/banner.ts`)
  - [ ] 배너 목록 페이지 (`app/admin/banners/page.tsx`)
    - 드래그 앤 드롭 순서 변경
    - 활성/비활성 상태 토글
  - [ ] 배너 등록/수정 페이지 (`app/admin/banners/new/page.tsx`, `app/admin/banners/[id]/edit/page.tsx`)
    - 제목, 부제목, 설명, CTA 버튼 텍스트/링크
    - 배경색 선택 또는 배경 이미지 업로드
  - [ ] 배너 Server Actions 생성 (`actions/admin/banner.ts`)
    - `getBanners`, `createBanner`, `updateBanner`, `deleteBanner`, `reorderBanners`
  - [ ] 히어로 슬라이더 컴포넌트 수정 (`components/hero-slider.tsx`)
    - 하드코딩된 데이터 → DB에서 동적으로 로드

- [ ] Phase 21: 회원 관리 페이지
  - [ ] 회원 목록 페이지 (`app/admin/users/page.tsx`)
    - Clerk + Supabase users 테이블 연동
    - 검색, 필터링 (가입일, 주문 횟수 등)
    - 회원 등급 표시 (일반/VIP)
  - [ ] 회원 상세 페이지 (`app/admin/users/[id]/page.tsx`)
    - 회원 기본 정보 (이름, 이메일, 가입일)
    - 주문 내역 목록
    - 장바구니 현황
  - [ ] 회원 역할/등급 관리 기능
    - Clerk 메타데이터 업데이트 (`role: admin/user`, `tier: vip/normal`)
  - [ ] 회원 Server Actions 생성 (`actions/admin/user.ts`)
    - `getAllUsers`, `getUserDetail`, `updateUserRole`, `updateUserTier`

- [ ] Phase 22: 배송 관리 페이지
  - [ ] DB 스키마 수정: `orders` 테이블에 배송 관련 컬럼 추가
    - `tracking_number` (운송장 번호)
    - `shipping_carrier` (배송 업체)
    - `shipped_at`, `delivered_at` (배송/도착 일시)
  - [ ] 배송 목록 페이지 (`app/admin/shipping/page.tsx`)
    - 배송 상태별 필터링 (배송 대기, 배송 중, 배송 완료)
    - 운송장 번호 일괄 입력 기능
  - [ ] 배송 상세/수정 기능
    - 운송장 번호 입력
    - 배송 상태 변경 (shipped → delivered)
  - [ ] 배송 Server Actions 생성 (`actions/admin/shipping.ts`)
    - `getShippingList`, `updateTrackingNumber`, `updateShippingStatus`, `bulkUpdateTracking`

- [ ] Phase 23: 코드 정리 및 최적화
  - [ ] 디버깅 로그 정리 (`actions/cart.ts`, `actions/order.ts`)
  - [ ] 테스트 페이지 제거 또는 개발 환경 전용으로 분리
  - [ ] 레거시 파일 정리 (`lib/supabase.ts` 제거 또는 deprecated 표시)
  - [ ] TypeScript 타입 자동 생성 (`pnpm supabase gen types typescript`)
  - [ ] 관리자 페이지 E2E 테스트 작성