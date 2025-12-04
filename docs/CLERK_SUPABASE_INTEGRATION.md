# Clerk + Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 네이티브 방식으로 통합하는 방법을 설명합니다. 2025년 4월 이후 권장되는 방식입니다.

## 📋 목차

1. [개요](#개요)
2. [설정 단계](#설정-단계)
3. [코드 구조](#코드-구조)
4. [RLS 정책 설정](#rls-정책-설정)
5. [사용 예시](#사용-예시)
6. [문제 해결](#문제-해결)

## 개요

### 통합 방식

이 프로젝트는 **Clerk를 Supabase의 Third-Party Auth Provider로 설정**하는 네이티브 통합 방식을 사용합니다.

**장점:**
- ✅ JWT 템플릿 불필요 (2025년 4월 이후 deprecated)
- ✅ Supabase JWT secret을 Clerk와 공유할 필요 없음
- ✅ 각 요청마다 새 JWT 생성 불필요 (Clerk 세션 토큰 직접 사용)
- ✅ 보안성 향상

### 작동 원리

1. Clerk가 사용자 인증 처리
2. Clerk 세션 토큰에 `"role": "authenticated"` 클레임 자동 추가
3. Supabase 클라이언트가 Clerk 세션 토큰을 `accessToken`으로 사용
4. Supabase가 Clerk 토큰을 검증하고 `auth.jwt()->>'sub'`로 Clerk user ID 추출
5. RLS 정책이 Clerk user ID 기반으로 데이터 접근 제어

## 설정 단계

### 1. Clerk Dashboard 설정

1. [Clerk Dashboard의 Supabase 통합 페이지](https://dashboard.clerk.com/setup/supabase)로 이동
2. 설정 옵션을 선택하고 **"Activate Supabase integration"** 클릭
3. 표시된 **Clerk domain**을 복사 (예: `your-app.clerk.accounts.dev`)

### 2. Supabase Dashboard 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 프로젝트 선택
2. **Authentication > Sign In / Up** 메뉴로 이동
3. **Third-Party Auth** 섹션에서 **"Add provider"** 클릭
4. **"Clerk"** 선택
5. 복사한 **Clerk domain**을 입력하고 저장

### 3. 로컬 개발 환경 설정 (선택사항)

로컬 개발이나 Supabase CLI를 사용하는 경우, `supabase/config.toml` 파일에 다음 설정 추가:

```toml
[auth.third_party.clerk]
enabled = true
domain = "your-app.clerk.accounts.dev"
```

## 코드 구조

### Supabase 클라이언트 파일들

프로젝트의 `lib/supabase/` 디렉토리에는 용도별로 분리된 클라이언트가 있습니다:

#### 1. `clerk-client.ts` - Client Component용

```typescript
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  // Clerk 세션 토큰으로 인증된 요청 수행
}
```

**특징:**
- React Hook으로 제공
- `useAuth().getToken()`으로 Clerk 세션 토큰 자동 주입
- Client Component에서만 사용 가능

#### 2. `server.ts` - Server Component/Server Action용

```typescript
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = createClerkSupabaseClient();
  // 서버 사이드에서 Clerk 인증 사용
}
```

**특징:**
- Server Component와 Server Action에서 사용
- `auth().getToken()`으로 Clerk 세션 토큰 자동 주입
- 서버 사이드 전용

#### 3. `service-role.ts` - 관리자 권한 작업용

```typescript
import { getServiceRoleClient } from '@/lib/supabase/service-role';

export async function POST() {
  const supabase = getServiceRoleClient();
  // RLS 우회, 모든 데이터 접근 가능
}
```

**특징:**
- RLS 정책 우회
- 서버 사이드 전용
- 사용자 동기화 등 관리 작업에 사용

#### 4. `client.ts` - 공개 데이터용

```typescript
import { supabase } from '@/lib/supabase/client';

// 인증 불필요한 공개 데이터 접근
const { data } = await supabase.from('public_posts').select('*');
```

**특징:**
- anon key만 사용
- RLS 정책이 `to anon`인 데이터만 접근 가능
- 인증 불필요

## RLS 정책 설정

### 기본 원리

RLS 정책에서 Clerk user ID는 `auth.jwt()->>'sub'`로 접근할 수 있습니다.

### 예시: 사용자별 데이터 접근 제한

```sql
-- 사용자가 자신의 데이터만 조회 가능
CREATE POLICY "Users can view their own data"
ON "public"."tasks"
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 사용자가 자신의 데이터만 생성 가능
CREATE POLICY "Users can insert their own data"
ON "public"."tasks"
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 사용자가 자신의 데이터만 수정 가능
CREATE POLICY "Users can update their own data"
ON "public"."tasks"
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 사용자가 자신의 데이터만 삭제 가능
CREATE POLICY "Users can delete their own data"
ON "public"."tasks"
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
);
```

### 예시: 조직 기반 접근 제한

```sql
-- 조직 관리자만 삽입 가능
CREATE POLICY "Only organization admins can insert"
ON "public"."secured_table"
FOR INSERT
TO authenticated
WITH CHECK (
  (
    (SELECT auth.jwt()->>'org_role') = 'org:admin'
    OR
    (SELECT auth.jwt()->'o'->>'rol') = 'admin'
  )
  AND
  organization_id = (
    SELECT COALESCE(
      auth.jwt()->>'org_id',
      auth.jwt()->'o'->>'id'
    )
  )
);
```

### 예시: 2FA 검증 확인

```sql
-- 2FA를 통과한 사용자만 접근 가능
CREATE POLICY "Only users with 2FA can read"
ON "public"."secured_table"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->'fva'->>1) != '-1'
);
```

### 현재 프로젝트의 RLS 설정

현재 `users` 테이블은 개발 단계이므로 RLS가 비활성화되어 있습니다. 프로덕션 배포 전에는 다음 정책을 활성화해야 합니다:

```sql
-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 정보만 조회 가능
CREATE POLICY "Users can view their own profile"
ON "public"."users"
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id::text
);

-- 사용자가 자신의 정보만 수정 가능
CREATE POLICY "Users can update their own profile"
ON "public"."users"
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id::text
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = clerk_id::text
);
```

## 사용 예시

### Client Component에서 데이터 조회

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useEffect, useState } from 'react';

export default function TasksPage() {
  const supabase = useClerkSupabaseClient();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function loadTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      
      if (!error) {
        setTasks(data || []);
      }
    }
    
    loadTasks();
  }, [supabase]);

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Server Component에서 데이터 조회

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function TasksPage() {
  const supabase = createClerkSupabaseClient();
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    throw error;
  }

  return (
    <div>
      {tasks?.map(task => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Server Action에서 데이터 생성

```tsx
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function createTask(name: string) {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });

  if (error) {
    throw new Error('Failed to create task');
  }

  return data;
}
```

## 문제 해결

### 1. "Unauthorized" 오류 발생

**원인:**
- Clerk를 Supabase의 Third-Party Auth Provider로 설정하지 않음
- Clerk 세션 토큰에 `role: "authenticated"` 클레임이 없음

**해결:**
1. [Clerk Dashboard의 Supabase 통합 페이지](https://dashboard.clerk.com/setup/supabase)에서 통합 활성화 확인
2. [Supabase Dashboard](https://supabase.com/dashboard)에서 Clerk provider 추가 확인
3. Clerk 세션 토큰에 `role` 클레임이 포함되어 있는지 확인

### 2. RLS 정책이 작동하지 않음

**원인:**
- RLS가 비활성화되어 있음
- RLS 정책이 올바르게 작성되지 않음
- `auth.jwt()->>'sub'`가 올바른 Clerk user ID를 반환하지 않음

**해결:**
1. RLS 활성화 확인:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. RLS 정책 확인:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'your_table';
   ```

3. JWT 내용 확인:
   ```sql
   SELECT auth.jwt()->>'sub' as clerk_user_id;
   ```

### 3. "JWT expired" 오류

**원인:**
- Clerk 세션 토큰이 만료됨

**해결:**
- Clerk SDK가 자동으로 토큰을 갱신하므로, 일반적으로 재시도하면 해결됩니다.
- 문제가 지속되면 Clerk 세션 상태를 확인하세요.

### 4. 로컬 개발 환경에서 통합이 작동하지 않음

**원인:**
- `supabase/config.toml`에 Clerk 설정이 없음

**해결:**
```toml
[auth.third_party.clerk]
enabled = true
domain = "your-app.clerk.accounts.dev"
```

## 참고 자료

- [Clerk 공식 문서: Supabase 통합](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase 공식 문서: Clerk Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Clerk 세션 토큰 클레임](https://clerk.com/docs/backend-requests/resources/session-tokens)

## 마이그레이션 가이드

### JWT 템플릿 방식에서 네이티브 통합으로 전환

기존에 JWT 템플릿 방식을 사용하던 경우:

1. **Clerk Dashboard에서 JWT 템플릿 제거** (선택사항)
2. **Supabase Dashboard에서 Clerk Third-Party Auth 추가**
3. **코드는 변경 불필요** - 이미 `accessToken` 함수를 사용하고 있다면 그대로 작동합니다.

주의: JWT 템플릿 방식은 2025년 4월 1일부터 deprecated되었습니다.

