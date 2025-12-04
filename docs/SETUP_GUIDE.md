# Clerk + Supabase 설정 가이드

이 문서는 Clerk와 Supabase를 처음 설정하는 단계별 가이드를 제공합니다.

## 📋 목차

1. [Clerk Dashboard 설정](#clerk-dashboard-설정)
2. [Supabase Dashboard 설정](#supabase-dashboard-설정)
3. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
4. [통합 확인](#통합-확인)

## Clerk Dashboard 설정

### 1단계: Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **"Integrations"** 또는 **"Setup"** 클릭
4. **"Supabase"** 섹션 찾기
5. [Supabase 통합 페이지](https://dashboard.clerk.com/setup/supabase)로 이동
6. 설정 옵션을 확인하고 **"Activate Supabase integration"** 클릭

### 2단계: Clerk Domain 확인

통합을 활성화하면 **Clerk domain**이 표시됩니다. 이 값을 복사하세요.

**예시:**
```
your-app-12.clerk.accounts.dev
```

> **참고**: 이 값은 다음 단계에서 Supabase에 입력해야 합니다.

### 3단계: 세션 토큰 클레임 확인 (선택사항)

Clerk 세션 토큰에 `role: "authenticated"` 클레임이 자동으로 추가되는지 확인:

1. Clerk Dashboard → **"Sessions"** 또는 **"JWT Templates"** 메뉴
2. 세션 토큰에 `role` 클레임이 포함되어 있는지 확인
3. 네이티브 통합을 사용하는 경우 자동으로 추가됩니다

## Supabase Dashboard 설정

### 1단계: Third-Party Auth 메뉴 접근

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **"Authentication"** 클릭
4. **"Sign In / Up"** 또는 **"Providers"** 메뉴 클릭
5. 페이지 하단으로 스크롤하여 **"Third-Party Auth"** 섹션 찾기

### 2단계: Clerk Provider 추가

1. **"Add provider"** 또는 **"Add integration"** 버튼 클릭
2. 제공자 목록에서 **"Clerk"** 선택
3. 다음 정보 입력:
   - **Provider Name**: `Clerk` (또는 원하는 이름)
   - **Domain** 또는 **Issuer URL**: 
     ```
     your-app-12.clerk.accounts.dev
     ```
     (Clerk Dashboard에서 복사한 값 입력)

4. **"Save"** 또는 **"Add Provider"** 클릭

### 3단계: 설정 확인

설정이 완료되면:
- Third-Party Auth 목록에 Clerk가 표시됩니다
- 상태가 "Active" 또는 "Enabled"로 표시됩니다

## 로컬 개발 환경 설정

Supabase CLI를 사용하여 로컬에서 개발하는 경우:

### 1단계: config.toml 파일 수정

`supabase/config.toml` 파일을 열고 다음 설정 추가:

```toml
[auth.third_party.clerk]
enabled = true
domain = "your-app-12.clerk.accounts.dev"
```

### 2단계: Supabase CLI 재시작

```bash
# Supabase CLI 중지 (Ctrl+C)
# Supabase CLI 재시작
supabase start
```

## 통합 확인

### 방법 1: Supabase Dashboard에서 확인

1. Supabase Dashboard → **"Authentication"** → **"Third-Party Auth"**
2. Clerk provider가 목록에 표시되고 활성화되어 있는지 확인

### 방법 2: 코드에서 테스트

프로젝트의 테스트 페이지를 사용하여 통합을 확인:

1. 개발 서버 실행:
   ```bash
   pnpm dev
   ```

2. 브라우저에서 `/auth-test` 페이지 접속

3. Clerk로 로그인

4. Supabase 데이터 조회가 정상적으로 작동하는지 확인

### 방법 3: SQL 쿼리로 확인

Supabase SQL Editor에서 다음 쿼리 실행:

```sql
-- 현재 인증된 사용자의 Clerk ID 확인
SELECT auth.jwt()->>'sub' as clerk_user_id;

-- JWT의 모든 클레임 확인
SELECT auth.jwt() as jwt_claims;
```

로그인한 상태에서 실행하면 Clerk user ID가 표시되어야 합니다.

## 문제 해결

### 문제 1: "Unauthorized" 오류

**증상:**
- Supabase 쿼리 실행 시 401 Unauthorized 오류 발생
- RLS 정책이 작동하지 않음

**해결:**
1. Clerk Dashboard에서 Supabase 통합이 활성화되어 있는지 확인
2. Supabase Dashboard에서 Clerk provider가 추가되어 있는지 확인
3. Clerk 세션 토큰에 `role: "authenticated"` 클레임이 있는지 확인

### 문제 2: Clerk Domain을 찾을 수 없음

**증상:**
- Clerk Dashboard에서 Clerk domain이 표시되지 않음

**해결:**
1. [Clerk Dashboard의 Supabase 통합 페이지](https://dashboard.clerk.com/setup/supabase)로 직접 이동
2. 통합을 활성화하면 Clerk domain이 표시됩니다
3. Clerk Frontend API URL을 사용할 수도 있습니다 (Settings → API Keys)

### 문제 3: 로컬 환경에서 통합이 작동하지 않음

**증상:**
- 로컬 개발 환경에서 Clerk 인증이 Supabase와 작동하지 않음

**해결:**
1. `supabase/config.toml` 파일에 Clerk 설정이 있는지 확인
2. Supabase CLI를 재시작
3. 프로덕션 환경에서는 Dashboard 설정만으로 충분합니다

## 다음 단계

통합이 완료되면:

1. [통합 가이드 문서](./CLERK_SUPABASE_INTEGRATION.md)를 읽어 상세한 사용법 확인
2. [RLS 정책 예시 마이그레이션](../supabase/migrations/20250101000000_clerk_rls_policies_example.sql) 참고하여 데이터 보안 설정
3. 프로젝트의 Supabase 클라이언트 파일들 확인:
   - `lib/supabase/clerk-client.ts` - Client Component용
   - `lib/supabase/server.ts` - Server Component용
   - `lib/supabase/service-role.ts` - 관리자 권한용

## 참고 자료

- [Clerk 공식 문서: Supabase 통합](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase 공식 문서: Clerk Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/clerk)
- [프로젝트 통합 가이드](./CLERK_SUPABASE_INTEGRATION.md)

