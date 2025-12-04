# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 변경하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [설정 방법](#설정-방법)
3. [커스텀 에러 메시지](#커스텀-에러-메시지)
4. [문제 해결](#문제-해결)
5. [참고 자료](#참고-자료)

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어를 지원합니다. 한국어는 `koKR`로 제공됩니다.

**현재 상태:**
- ✅ `@clerk/localizations` 패키지 설치됨
- ✅ 한국어 로컬라이제이션 적용됨
- ✅ `html lang="ko"` 설정됨

## 설정 방법

### 1. 패키지 설치

`@clerk/localizations` 패키지가 이미 설치되어 있습니다:

```json
{
  "dependencies": {
    "@clerk/localizations": "^3.26.3"
  }
}
```

새 프로젝트를 시작하는 경우:

```bash
pnpm add @clerk/localizations
```

### 2. 한국어 로컬라이제이션 적용

`app/layout.tsx`에서 `ClerkProvider`에 한국어 로컬라이제이션을 적용합니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        // Tailwind CSS v4 호환성을 위한 설정
        cssLayerName: "clerk",
      }}
    >
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**주요 설정:**
- `localization={koKR}`: 한국어 로컬라이제이션 적용
- `appearance.cssLayerName="clerk"`: Tailwind CSS v4 호환성
- `html lang="ko"`: HTML 언어 태그 설정

### 3. 지원되는 언어

Clerk는 다음 언어를 지원합니다:

| 언어 | 키 | BCP 47 태그 |
|------|-----|-------------|
| 한국어 | `koKR` | ko-KR |
| 영어 (미국) | `enUS` | en-US |
| 영어 (영국) | `enGB` | en-GB |
| 일본어 | `jaJP` | ja-JP |
| 중국어 (간체) | `zhCN` | zh-CN |
| 중국어 (번체) | `zhTW` | zh-TW |

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization#languages)를 참고하세요.

## 커스텀 에러 메시지

한국어 로컬라이제이션에 커스텀 에러 메시지를 추가할 수 있습니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

// 한국어 로컬라이제이션에 커스텀 에러 메시지 추가
const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 접근을 원하시면 이메일로 문의해주세요.",
    form_identifier_not_found:
      "등록되지 않은 이메일 주소입니다. 회원가입을 먼저 진행해주세요.",
    form_password_pwned:
      "이 비밀번호는 보안상 위험합니다. 다른 비밀번호를 사용해주세요.",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={customKoKR}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**사용 가능한 에러 키:**
- `not_allowed_access`: 허용되지 않은 이메일 도메인
- `form_identifier_not_found`: 등록되지 않은 이메일
- `form_password_pwned`: 보안상 위험한 비밀번호
- 기타 에러 키는 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)의 `unstable__errors` 객체를 참고하세요.

## 문제 해결

### 1. 일부 텍스트가 번역되지 않음

**원인:**
- Clerk Account Portal은 영어로만 제공됩니다
- 커스텀 컴포넌트의 텍스트는 번역되지 않습니다

**해결:**
- Clerk 컴포넌트 내부의 텍스트만 번역됩니다
- 커스텀 텍스트는 직접 번역해야 합니다

### 2. 로컬라이제이션이 적용되지 않음

**원인:**
- `@clerk/localizations` 패키지가 설치되지 않음
- `localization` prop이 전달되지 않음

**해결:**
```bash
# 패키지 설치 확인
pnpm list @clerk/localizations

# 설치되지 않은 경우
pnpm add @clerk/localizations
```

### 3. Tailwind CSS 스타일이 적용되지 않음

**원인:**
- Tailwind CSS v4를 사용하는 경우 `cssLayerName` 설정 필요

**해결:**
```tsx
<ClerkProvider
  localization={koKR}
  appearance={{
    cssLayerName: "clerk", // Tailwind CSS v4 호환성
  }}
>
```

### 4. 실험적 기능 경고

**원인:**
- 로컬라이제이션 기능이 현재 실험적(experimental) 단계입니다

**해결:**
- 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요
- 가능한 한 상세한 정보를 제공하세요

## 참고 자료

### 공식 문서

- [Clerk Localization 가이드](https://clerk.com/docs/guides/customizing-clerk/localization)
- [Clerk Next.js 문서](https://clerk.com/docs/quickstarts/nextjs)

### 관련 파일

- `app/layout.tsx`: ClerkProvider 설정
- `package.json`: `@clerk/localizations` 패키지

### 예시 코드

현재 프로젝트의 `app/layout.tsx` 파일을 참고하세요:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        cssLayerName: "clerk",
      }}
    >
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## 추가 팁

### 1. 다국어 지원

여러 언어를 지원하려면 사용자 언어 설정에 따라 동적으로 로컬라이제이션을 변경할 수 있습니다:

```tsx
import { koKR, enUS, jaJP } from "@clerk/localizations";

const localizations = {
  ko: koKR,
  en: enUS,
  ja: jaJP,
};

export default function RootLayout({ children }) {
  // 사용자 언어 설정에 따라 선택
  const locale = "ko"; // 실제로는 사용자 설정에서 가져옴
  const localization = localizations[locale] || koKR;

  return (
    <ClerkProvider localization={localization}>
      <html lang={locale}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 2. 브랜드에 맞는 커스터마이징

로컬라이제이션을 통해 브랜드에 맞는 문구로 변경할 수 있습니다:

```tsx
const customKoKR = {
  ...koKR,
  signUp: {
    ...koKR.signUp,
    start: {
      ...koKR.signUp.start,
      subtitle: "{{applicationName}}에 가입하세요",
    },
  },
};
```

### 3. 테스트

로컬라이제이션이 제대로 적용되었는지 확인:

1. 개발 서버 실행: `pnpm dev`
2. 로그인/회원가입 페이지 확인
3. 모든 텍스트가 한국어로 표시되는지 확인

