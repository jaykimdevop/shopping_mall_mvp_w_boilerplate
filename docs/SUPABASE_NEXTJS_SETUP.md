# Supabase + Next.js 설정 가이드

이 문서는 Supabase 공식 문서의 모범 사례를 기반으로 Next.js 프로젝트에 Supabase를 연결하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [패키지 설치](#패키지-설치)
3. [환경 변수 설정](#환경-변수-설정)
4. [Supabase 클라이언트 설정](#supabase-클라이언트-설정)
5. [Middleware 설정](#middleware-설정)
6. [사용 예시](#사용-예시)
7. [참고 자료](#참고-자료)

## 개요

이 프로젝트는 Supabase 공식 문서의 모범 사례를 따릅니다:

- ✅ `@supabase/ssr` 패키지 사용 (공식 권장)
- ✅ `createBrowserClient`와 `createServerClient` 사용
- ✅ Cookie 기반 세션 관리 지원
- ✅ Middleware에서 세션 갱신
- ✅ Clerk 통합 유지 (Third-Party Auth)

## 패키지 설치

필요한 패키지가 이미 설치되어 있습니다:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.49.8",
    "@supabase/ssr": "^0.8.0"
  }
}
```

새 프로젝트를 시작하는 경우:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 서버 사이드 전용
```

환경 변수는 [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)에서 확인할 수 있습니다.

## Supabase 클라이언트 설정

프로젝트는 용도별로 분리된 클라이언트를 제공합니다:

### 1. Client Component용 (`lib/supabase/clerk-client.ts`)

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  
  // Clerk 세션 토큰으로 인증된 요청
  const { data } = await supabase.from('table').select('*');
}
```

**특징:**
- `@supabase/ssr`의 `createBrowserClient` 사용
- Clerk 세션 토큰을 `accessToken`으로 제공
- React Hook으로 제공

### 2. Server Component용 (`lib/supabase/server.ts`)

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = await createClerkSupabaseClient();
  
  // 서버 사이드에서 Clerk 인증 사용
  const { data } = await supabase.from('table').select('*');
}
```

**특징:**
- `@supabase/ssr`의 `createServerClient` 사용
- Cookie 기반 세션 관리 지원
- Clerk 세션 토큰을 `accessToken`으로 제공
- `await` 필요 (Next.js 15 패턴)

### 3. 공개 데이터용 (`lib/supabase/client.ts`)

```tsx
import { supabase } from '@/lib/supabase/client';

// 인증 불필요한 공개 데이터 접근
const { data } = await supabase.from('public_posts').select('*');
```

**특징:**
- `@supabase/ssr`의 `createBrowserClient` 사용
- anon key만 사용
- RLS 정책이 `to anon`인 데이터만 접근 가능

### 4. 관리자 권한용 (`lib/supabase/service-role.ts`)

```tsx
import { getServiceRoleClient } from '@/lib/supabase/service-role';

export async function POST() {
  const supabase = getServiceRoleClient();
  
  // RLS 우회, 모든 데이터 접근 가능
  const { data } = await supabase.from('table').select('*');
}
```

**특징:**
- Service Role Key 사용
- RLS 정책 우회
- 서버 사이드 전용

## Middleware 설정

`middleware.ts`에서 Clerk 인증과 Supabase 세션 관리를 함께 처리합니다:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Supabase 세션 갱신 (공식 문서 권장 패턴)
  await updateSupabaseSession(request);
});
```

**역할:**
- Clerk 인증 처리
- Supabase 세션 갱신
- Cookie 기반 세션 관리

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
import { Suspense } from 'react';

async function TasksData() {
  const supabase = await createClerkSupabaseClient();
  const { data: tasks } = await supabase.from('tasks').select();
  
  return <pre>{JSON.stringify(tasks, null, 2)}</pre>;
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading tasks...</div>}>
      <TasksData />
    </Suspense>
  );
}
```

### Server Action에서 데이터 생성

```tsx
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function createTask(name: string) {
  const supabase = await createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });

  if (error) {
    throw new Error('Failed to create task');
  }

  return data;
}
```

## 참고 자료

### 공식 문서

- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Server-Side Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase SSR Package](https://github.com/supabase/auth-helpers/tree/main/packages/ssr)

### 프로젝트 문서

- [Clerk + Supabase 통합 가이드](./CLERK_SUPABASE_INTEGRATION.md)
- [Clerk + Supabase 설정 가이드](./SETUP_GUIDE.md)

### 주요 변경 사항

#### 2025년 업데이트

1. **`@supabase/ssr` 패키지 도입**
   - 기존: `@supabase/supabase-js`의 `createClient` 직접 사용
   - 변경: `@supabase/ssr`의 `createBrowserClient`와 `createServerClient` 사용

2. **Cookie 기반 세션 관리**
   - Server Component에서 Cookie 기반 세션 관리 지원
   - Middleware에서 세션 자동 갱신

3. **Next.js 15 패턴 준수**
   - `cookies()` 함수에 `await` 사용
   - Server Component 함수에 `async` 사용

## 문제 해결

### "createClient is not a function" 오류

**원인:** `@supabase/ssr` 패키지가 설치되지 않음

**해결:**
```bash
pnpm add @supabase/ssr
```

### "Cannot read properties of undefined" 오류

**원인:** 환경 변수가 설정되지 않음

**해결:**
- `.env.local` 파일 확인
- 환경 변수 이름 확인 (`NEXT_PUBLIC_` 접두사 필요)

### 세션이 갱신되지 않음

**원인:** Middleware가 제대로 설정되지 않음

**해결:**
- `middleware.ts`에서 `updateSupabaseSession` 호출 확인
- `config.matcher` 설정 확인

