<div align="center">
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next.JS_15-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="react" />
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
    <img src="https://img.shields.io/badge/-Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="tailwind" />
    <img src="https://img.shields.io/badge/-Clerk-6C47FF?style=for-the-badge&logoColor=white&logo=clerk" alt="clerk" />
    <img src="https://img.shields.io/badge/-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="supabase" />
  </div>

  <h1 align="center">모두쇼핑</h1>
  <h3 align="center">Next.js 15 + Clerk + Supabase 쇼핑몰 MVP</h3>

  <p align="center">
    간편하고 빠른 온라인 쇼핑몰 - 최소 기능으로 빠른 시장 검증
  </p>
</div>

## 📋 목차

1. [소개](#소개)
2. [기술 스택](#기술-스택)
3. [주요 기능](#주요-기능)
4. [시작하기](#시작하기)
5. [추가 설정 및 팁](#추가-설정-및-팁)
6. [프로젝트 구조](#프로젝트-구조)

## 소개

모두쇼핑은 Next.js 15, Clerk, Supabase를 활용한 모던 온라인 쇼핑몰 MVP입니다.

**핵심 특징:**
- ✨ Next.js 15 + React 19 최신 기능 활용
- 🔐 Clerk와 Supabase 네이티브 통합 (2025년 권장 방식)
- 🎨 Tailwind CSS v4 + shadcn/ui
- 📱 완전한 반응형 디자인
- 🌐 한국어 지원 (Clerk 한국어 로컬라이제이션)
- 🛒 상품 조회, 장바구니, 주문 관리 기능
- 📦 주문 내역 조회 및 관리

**프로젝트 목적:**
- 최소 기능으로 빠른 시장 검증
- 간단한 구조와 적은 기능으로도 실제 구매 전환이 일어나는지 확인
- 테스트 결제 기능을 포함한 실동작 쇼핑몰

## 기술 스택

### 프레임워크 & 라이브러리

- **[Next.js 15](https://nextjs.org/)** - React 프레임워크 (App Router, Server Components)
- **[React 19](https://react.dev/)** - UI 라이브러리
- **[TypeScript](https://www.typescriptlang.org/)** - 타입 안정성

### 인증 & 데이터베이스

- **[Clerk](https://clerk.com/)** - 사용자 인증 및 관리
  - Google, 이메일 등 다양한 로그인 방식 지원
  - 한국어 UI 지원
  - Supabase와 네이티브 통합
- **[Supabase](https://supabase.com/)** - PostgreSQL 데이터베이스
  - 실시간 데이터 동기화
  - Row Level Security (RLS) - 개발 환경에서는 비활성화
  - 파일 스토리지

### UI & 스타일링

- **[Tailwind CSS v4](https://tailwindcss.com/)** - 유틸리티 우선 CSS 프레임워크
- **[shadcn/ui](https://ui.shadcn.com/)** - 재사용 가능한 컴포넌트 라이브러리
- **[Radix UI](https://www.radix-ui.com/)** - 접근성 높은 헤드리스 컴포넌트
- **[lucide-react](https://lucide.dev/)** - 아이콘 라이브러리

### 폼 & 검증

- **[React Hook Form](https://react-hook-form.com/)** - 폼 상태 관리
- **[Zod](https://zod.dev/)** - 스키마 검증

### 테스트

- **[Playwright](https://playwright.dev/)** - E2E 테스트

## 주요 기능

### 🛍️ 상품 관리
- 홈페이지: 상품 목록 Grid 레이아웃 표시
- 상품 목록 페이지: 페이지네이션, 정렬, 카테고리 필터링
- 상품 상세 페이지: 재고, 가격, 설명 표시
- 카테고리별 상품 조회

### 🛒 장바구니
- 장바구니에 상품 추가/삭제
- 수량 변경
- 장바구니 배지로 실시간 개수 표시

### 📦 주문 관리
- 주문 생성 흐름 (배송지 정보 입력 포함)
- 주문 테이블 저장 (`orders`, `order_items`)
- 합계 검증 (클라이언트 vs 서버 계산)
- 재고 확인 및 차감

### 👤 마이페이지
- 주문 내역 목록 조회 (사용자별)
- 주문 상세 보기 (`order_items` 포함)
- 주문 상태 확인

### 🔐 인증 시스템
- Clerk를 통한 안전한 사용자 인증
- 소셜 로그인 지원 (Google 등)
- Clerk 사용자 자동으로 Supabase DB에 동기화
- 한국어 UI 지원

### 🗄️ 데이터베이스 통합
- Clerk 토큰 기반 Supabase 인증 (JWT 템플릿 불필요)
- 환경별 Supabase 클라이언트 분리:
  - Client Component용 (`useClerkSupabaseClient`)
  - Server Component용 (`createClerkSupabaseClient`)
  - 관리자 권한용 (`createServiceRoleClient`)
- SQL 마이그레이션 시스템

### 🎨 UI/UX
- shadcn/ui 기반 모던 컴포넌트
- 완전한 반응형 디자인
- 다크/라이트 모드 지원
- 접근성 준수 (WCAG)

### 🏗️ 아키텍처
- Server Actions 우선 사용
- 타입 안전성 보장 (Zod + TypeScript)
- 모듈화된 코드 구조
- Next.js 15 최신 패턴 적용

## 시작하기

### 필수 요구사항

시스템에 다음이 설치되어 있어야 합니다:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (v18 이상)
- [pnpm](https://pnpm.io/) (권장 패키지 매니저)

```bash
# pnpm 설치
npm install -g pnpm
```

### 프로젝트 초기화

다음 단계를 순서대로 진행하세요:

#### 1. 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/jaykimdevop/shopping_mall_mvp_w_boilerplate.git
cd shopping_mall_mvp_w_boilerplate
pnpm install
```

#### 2. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속하여 로그인
2. **"New Project"** 클릭
3. Organization 선택 (없으면 새로 생성)
4. 프로젝트 정보 입력:
   - **Name**: 원하는 프로젝트 이름
   - **Database Password**: 안전한 비밀번호 생성 (기억할 필요 없음, Supabase가 관리)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 서비스용)
   - **Pricing Plan**: Free 또는 Pro 선택
5. **"Create new project"** 클릭하고 프로젝트가 준비될 때까지 대기 (~2분)

#### 3. Clerk 프로젝트 생성

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 접속하여 로그인
2. **"Create application"** 클릭
3. 애플리케이션 정보 입력:
   - **Application name**: 원하는 이름 (예: `모두쇼핑`)
   - **Sign-in options**: Email, Google 등 원하는 인증 방식 선택
4. **"Create application"** 클릭
5. Quick Start 화면에서 **"Continue in Dashboard"** 클릭

#### 4. Clerk + Supabase 통합

> **중요**: 2025년 4월부터 Clerk의 네이티브 Supabase 통합을 사용합니다. JWT Template은 더 이상 필요하지 않습니다.

**4-1. Clerk Dashboard에서 Supabase 통합 활성화**

1. [Clerk Dashboard의 Supabase 통합 페이지](https://dashboard.clerk.com/setup/supabase)로 이동
2. 설정 옵션을 선택하고 **"Activate Supabase integration"** 클릭
3. 표시된 **Clerk domain**을 복사 (예: `your-app.clerk.accounts.dev`)
   - 이 값은 다음 단계에서 사용합니다

**4-2. Supabase Dashboard에서 Clerk Third-Party Auth 추가**

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 프로젝트 선택
2. **Authentication > Sign In / Up** 메뉴로 이동
3. **Third-Party Auth** 섹션에서 **"Add provider"** 클릭
4. **"Clerk"** 선택
5. 복사한 **Clerk domain**을 입력하고 저장

**4-3. 통합 확인**

- [Clerk 공식 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)에서 추가 정보 확인
- [프로젝트 통합 가이드 문서](./docs/CLERK_SUPABASE_INTEGRATION.md) 참고

#### 5. Supabase Storage 생성 및 설정

1. Supabase Dashboard → **Storage** 메뉴
2. **"New bucket"** 클릭
3. 버킷 정보 입력:
   - **Name**: `uploads` (`.env.example`과 동일하게)
   - **Public bucket**: 필요에 따라 선택
     - Public: 누구나 URL로 파일 접근 가능
     - Private: 인증된 사용자만 접근 (RLS 정책 필요)
4. **"Create bucket"** 클릭

#### 6. 데이터베이스 스키마 적용

1. Supabase Dashboard → **SQL Editor** 메뉴
2. **"New query"** 클릭
3. `supabase/migrations/db.sql` 파일 내용을 복사하여 붙여넣기
4. **"Run"** 클릭하여 실행
5. 성공 메시지 확인 (`Success. No rows returned`)

**생성되는 테이블:**
- `users`: Clerk 사용자와 동기화되는 사용자 정보 테이블
- `products`: 상품 정보 테이블
- `cart_items`: 장바구니 아이템 테이블
- `orders`: 주문 정보 테이블
- `order_items`: 주문 상세 아이템 테이블

#### 7. 환경 변수 설정

**7-1. .env 파일 생성**

```bash
cp .env.example .env
```

**7-2. Supabase 환경 변수 설정**

1. Supabase Dashboard → **Settings** → **API**
2. 다음 값들을 복사하여 `.env` 파일에 입력:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="<Project URL>"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon public key>"
   SUPABASE_SERVICE_ROLE_KEY="<service_role secret key>"
   NEXT_PUBLIC_STORAGE_BUCKET="uploads"
   ```

> **⚠️ 주의**: `service_role` 키는 모든 RLS를 우회하는 관리자 권한이므로 절대 공개하지 마세요!

**7-3. Clerk 환경 변수 설정**

1. Clerk Dashboard → **API Keys**
2. 다음 값들을 복사하여 `.env` 파일에 입력:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<Publishable Key>"
   CLERK_SECRET_KEY="<Secret Key>"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
   ```

#### 8. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 개발 명령어

```bash
# 개발 서버 실행 (Turbopack)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅
pnpm lint

# E2E 테스트 실행
pnpm test

# E2E 테스트 UI 모드
pnpm test:ui

# E2E 테스트 리포트 보기
pnpm test:report
```

## 추가 설정 및 팁

### 상품 등록

상품은 Supabase 대시보드에서 직접 등록합니다. 자세한 내용은 [어드민 상품 관리 가이드](./docs/ADMIN_PRODUCT_MANAGEMENT.md)를 참고하세요.

### Clerk 한국어 설정

프로젝트에 이미 Clerk 한국어 로컬라이제이션이 적용되어 있습니다. `app/layout.tsx`의 `ClerkProvider`에서 `koKR` locale이 설정되어 있습니다.

자세한 내용은 [Clerk 한국어 로컬라이제이션 가이드](./docs/CLERK_LOCALIZATION.md)를 참고하세요.

### Supabase RLS (Row Level Security) 정책

프로젝트의 모든 테이블은 개발 단계이므로 RLS가 비활성화되어 있습니다. 프로덕션 배포 전에는 반드시 RLS를 활성화하고 적절한 정책을 적용해야 합니다.

**RLS 정책 예시:**
- `supabase/migrations/20250101000000_clerk_rls_policies_example.sql` 파일 참고
- [통합 가이드 문서](./docs/CLERK_SUPABASE_INTEGRATION.md#rls-정책-설정)에서 상세 설명 확인

**Clerk user ID 기반 RLS 정책 예시:**

```sql
-- 사용자가 자신의 데이터만 조회 가능
CREATE POLICY "Users can view their own data"
ON "public"."your_table"
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id::text
);

-- 사용자가 자신의 데이터만 생성 가능
CREATE POLICY "Users can insert their own data"
ON "public"."your_table"
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = clerk_id::text
);
```

> **참고**: `auth.jwt()->>'sub'`는 Clerk user ID를 반환합니다. 이 값은 테이블의 `clerk_id` 컬럼과 비교해야 합니다.

### 추가 로그인 방식 설정

Clerk에서 추가 로그인 방식을 활성화하려면:

1. Clerk Dashboard → **User & Authentication** → **Social Connections**
2. 원하는 제공자 선택 (Google, GitHub, Discord 등)
3. OAuth 자격 증명 입력 (제공자 개발자 콘솔에서 생성)
4. **Enable** 클릭

### 배포

Vercel 배포 가이드는 [배포 가이드 문서](./docs/DEPLOYMENT.md)를 참고하세요.

## 프로젝트 구조

```
shopping_mall_mvp_w_boilerplate/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── sync-user/    # Clerk → Supabase 사용자 동기화
│   ├── cart/             # 장바구니 페이지
│   ├── checkout/         # 주문 페이지
│   ├── mypage/           # 마이페이지
│   │   └── orders/       # 주문 상세 페이지
│   ├── orders/           # 주문 완료 페이지
│   ├── products/         # 상품 목록/상세 페이지
│   ├── layout.tsx        # Root Layout (Clerk Provider)
│   ├── page.tsx          # 홈페이지
│   └── globals.css       # 전역 스타일 (Tailwind v4 설정)
│
├── actions/               # Server Actions
│   ├── cart.ts           # 장바구니 관련 Server Actions
│   └── order.ts          # 주문 관련 Server Actions
│
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트 (자동 생성)
│   ├── providers/        # Context Providers
│   │   └── sync-user-provider.tsx
│   ├── add-to-cart-button.tsx
│   ├── cart-badge.tsx
│   ├── cart-item.tsx
│   ├── cart-items-list.tsx
│   ├── cart-summary.tsx
│   ├── checkout-form.tsx
│   ├── Navbar.tsx
│   ├── order-detail.tsx
│   ├── order-list.tsx
│   ├── order-status-badge.tsx
│   ├── order-summary.tsx
│   ├── product-card.tsx
│   └── ...
│
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/         # Supabase 클라이언트들
│   │   ├── clerk-client.ts    # Client Component용
│   │   ├── server.ts          # Server Component용
│   │   ├── service-role.ts    # 관리자용
│   │   └── client.ts          # 공개 데이터용
│   └── utils.ts          # 공통 유틸리티 (cn 함수 등)
│
├── hooks/                 # Custom React Hooks
│   └── use-sync-user.ts  # 사용자 동기화 훅
│
├── types/                 # TypeScript 타입 정의
│   ├── cart.ts
│   ├── order.ts
│   ├── product.ts
│   └── category.ts
│
├── supabase/             # Supabase 관련 파일
│   ├── migrations/       # 데이터베이스 마이그레이션
│   │   └── db.sql       # 초기 스키마
│   └── config.toml       # Supabase 프로젝트 설정
│
├── tests/                # E2E 테스트
│   ├── e2e/              # E2E 테스트 파일
│   └── fixtures/         # 테스트 픽스처
│
├── docs/                  # 프로젝트 문서
│   ├── TODO.md           # 개발 TODO
│   ├── prd.md            # 제품 요구사항 문서
│   ├── DEPLOYMENT.md     # 배포 가이드
│   └── ...
│
├── .cursor/              # Cursor AI 규칙
│   └── rules/           # 개발 컨벤션 및 가이드
│
├── middleware.ts         # Next.js 미들웨어 (Clerk)
├── playwright.config.ts  # Playwright 설정
├── vercel.json          # Vercel 배포 설정
├── .env.example         # 환경 변수 예시
└── CLAUDE.md            # AI 에이전트용 프로젝트 가이드
```

### 주요 파일 설명

- **`middleware.ts`**: Clerk 인증 미들웨어 설정
- **`app/layout.tsx`**: ClerkProvider와 SyncUserProvider 설정
- **`lib/supabase/`**: 환경별 Supabase 클라이언트 (매우 중요!)
- **`hooks/use-sync-user.ts`**: Clerk 사용자를 Supabase에 자동 동기화
- **`components/providers/sync-user-provider.tsx`**: 앱 전역에서 사용자 동기화 실행
- **`actions/cart.ts`**: 장바구니 관련 Server Actions
- **`actions/order.ts`**: 주문 관련 Server Actions
- **`CLAUDE.md`**: Claude Code를 위한 프로젝트 가이드

## 추가 리소스

### 공식 문서
- [Next.js 15 문서](https://nextjs.org/docs)
- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)
- [Playwright 문서](https://playwright.dev/)

### 프로젝트 문서
- [제품 요구사항 문서](./docs/prd.md) - 프로젝트 전체 요구사항
- [개발 TODO](./docs/TODO.md) - 개발 진행 상황
- [배포 가이드](./docs/DEPLOYMENT.md) - Vercel 배포 가이드
- [Supabase + Next.js 설정 가이드](./docs/SUPABASE_NEXTJS_SETUP.md) - Supabase 공식 문서 기반 설정 가이드
- [Clerk + Supabase 통합 가이드](./docs/CLERK_SUPABASE_INTEGRATION.md) - 상세한 통합 설정 및 사용법
- [Clerk + Supabase 설정 가이드](./docs/SETUP_GUIDE.md) - 단계별 설정 방법
- [Clerk 한국어 로컬라이제이션 가이드](./docs/CLERK_LOCALIZATION.md) - Clerk 컴포넌트 한국어 설정
- [어드민 상품 관리 가이드](./docs/ADMIN_PRODUCT_MANAGEMENT.md) - Supabase 대시보드에서 상품 등록/수정 방법
- [프로젝트 구조 가이드](./docs/DIR.md)

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
