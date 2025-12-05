import { SignUp } from "@clerk/nextjs";

/**
 * @file sign-up/[[...sign-up]]/page.tsx
 * @description Clerk 회원가입 페이지
 *
 * Clerk의 SignUp 컴포넌트를 사용하여 회원가입 기능을 제공합니다.
 * [[...sign-up]] 캐치올 라우트를 사용하여 Clerk의 다양한 인증 흐름을 지원합니다.
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-12">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </div>
  );
}

