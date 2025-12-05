import { SignIn } from "@clerk/nextjs";

/**
 * @file sign-in/[[...sign-in]]/page.tsx
 * @description Clerk 로그인 페이지
 *
 * Clerk의 SignIn 컴포넌트를 사용하여 로그인 기능을 제공합니다.
 * [[...sign-in]] 캐치올 라우트를 사용하여 Clerk의 다양한 인증 흐름을 지원합니다.
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-12">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  );
}

