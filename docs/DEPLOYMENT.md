# 배포 가이드

이 문서는 모두쇼핑 MVP를 Vercel에 배포하는 방법을 설명합니다.

## 사전 요구사항

1. [Vercel 계정](https://vercel.com)
2. [GitHub 계정](https://github.com) (저장소 연동용)
3. Clerk 프로젝트 설정 완료
4. Supabase 프로젝트 설정 완료

---

## 1. Vercel 프로젝트 생성

### 1.1 GitHub 저장소 연결

1. [Vercel 대시보드](https://vercel.com/dashboard)에서 "Add New Project" 클릭
2. GitHub 저장소 선택: `jaykimdevop/shopping_mall_mvp_w_boilerplate`
3. Framework Preset: **Next.js** (자동 감지됨)
4. Root Directory: `.` (기본값)

### 1.2 빌드 설정

Vercel이 자동으로 감지하지만, 수동 설정이 필요한 경우:

- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

---

## 2. 환경변수 설정

Vercel 프로젝트 설정 > Environment Variables에서 다음 변수들을 추가합니다:

### 필수 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk 비밀 키 | `sk_test_...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 역할 키 | `eyJ...` |

### 선택 환경변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_STORAGE_BUCKET` | Supabase Storage 버킷명 | `uploads` |

### Clerk URL 설정

Clerk 리다이렉트 URL도 설정해야 합니다:

| 변수명 | 값 |
|--------|-----|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` |

---

## 3. Clerk 도메인 설정

Vercel 배포 후 생성되는 도메인을 Clerk에 등록해야 합니다.

### 3.1 Clerk 대시보드 설정

1. [Clerk 대시보드](https://dashboard.clerk.com) 접속
2. 프로젝트 선택 > **Domains** 메뉴
3. **Production** 환경에 Vercel 도메인 추가:
   - `your-project.vercel.app`
   - 커스텀 도메인 (있는 경우)

### 3.2 Allowed Origins 설정

1. Clerk 대시보드 > **JWT Templates** (또는 **Settings**)
2. Allowed Origins에 배포 URL 추가

---

## 4. Supabase 설정

### 4.1 Production 환경 설정

Supabase 프로젝트가 Production 환경인지 확인합니다.

### 4.2 RLS 정책 검토

> ⚠️ **중요**: 현재 개발 환경에서는 RLS가 비활성화되어 있습니다.
> Production 배포 전 반드시 RLS 정책을 검토하고 활성화하세요.

RLS 활성화 예시:

```sql
-- users 테이블 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자 본인 데이터만 조회 가능
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_id = auth.jwt()->>'sub');

-- 장바구니 정책
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (clerk_id = auth.jwt()->>'sub');
```

---

## 5. 배포 실행

### 5.1 자동 배포

GitHub에 push하면 Vercel이 자동으로 배포합니다:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 5.2 수동 배포

Vercel CLI 사용:

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

---

## 6. 배포 후 확인사항

### 6.1 기능 테스트 체크리스트

- [ ] 홈페이지 로드
- [ ] 상품 목록 표시
- [ ] 상품 상세 페이지
- [ ] 회원가입/로그인 (Clerk)
- [ ] 장바구니 담기
- [ ] 주문 프로세스
- [ ] 마이페이지 접근

### 6.2 성능 확인

Vercel Analytics에서 다음 지표 확인:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

### 6.3 에러 모니터링

Vercel 대시보드 > Logs에서 에러 확인

---

## 7. 커스텀 도메인 설정 (선택)

### 7.1 Vercel에서 도메인 추가

1. 프로젝트 설정 > Domains
2. 커스텀 도메인 입력
3. DNS 레코드 설정 안내에 따라 설정

### 7.2 DNS 설정

도메인 등록기관에서 다음 레코드 추가:

| 타입 | 이름 | 값 |
|------|------|-----|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

---

## 8. 문제 해결

### 빌드 실패

```bash
# 로컬에서 빌드 테스트
pnpm build
```

### 환경변수 문제

- `NEXT_PUBLIC_` 접두사가 붙은 변수는 클라이언트에서 접근 가능
- 비밀 키는 절대 `NEXT_PUBLIC_` 접두사 사용 금지

### Clerk 인증 오류

- Clerk 대시보드에서 도메인이 올바르게 등록되었는지 확인
- 환경변수가 Production 환경에 설정되었는지 확인

### Supabase 연결 오류

- Supabase 프로젝트가 활성 상태인지 확인
- 환경변수 URL과 키가 올바른지 확인

---

## 9. 롤백

문제 발생 시 이전 배포로 롤백:

1. Vercel 대시보드 > Deployments
2. 이전 성공한 배포 선택
3. "..." 메뉴 > "Promote to Production" 클릭

---

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Clerk Next.js 통합](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase Next.js 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

