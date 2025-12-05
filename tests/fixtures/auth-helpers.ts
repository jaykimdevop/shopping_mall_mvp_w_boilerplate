/**
 * @file auth-helpers.ts
 * @description Clerk 인증이 필요한 테스트를 위한 헬퍼 함수
 *
 * Clerk는 외부 인증 서비스이므로 E2E 테스트에서 실제 로그인을 수행합니다.
 * 테스트 환경에서는 테스트 계정을 사용하거나 Clerk의 테스트 모드를 활용합니다.
 */

import { Page } from "@playwright/test";

/**
 * Clerk 로그인 모달을 통해 로그인 수행
 * 주의: 실제 테스트 계정 정보가 필요합니다.
 */
export async function loginWithClerk(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  // 로그인 버튼 클릭 (모달 열기)
  await page.getByRole("button", { name: "로그인" }).click();

  // Clerk 모달이 로드될 때까지 대기
  await page.waitForSelector('[data-clerk-component="SignIn"]', {
    timeout: 10000,
  });

  // 이메일 입력
  await page.getByLabel("이메일").fill(email);

  // 계속하기 버튼 클릭
  await page.getByRole("button", { name: "계속" }).click();

  // 비밀번호 입력 필드 대기 및 입력
  await page.getByLabel("비밀번호").fill(password);

  // 로그인 버튼 클릭
  await page.getByRole("button", { name: "계속" }).click();

  // 로그인 완료 대기 (UserButton이 나타날 때까지)
  await page.waitForSelector('[data-clerk-component="UserButton"]', {
    timeout: 15000,
  });
}

/**
 * 현재 로그인 상태 확인
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-clerk-component="UserButton"]', {
      timeout: 3000,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 로그아웃 수행
 */
export async function logout(page: Page): Promise<void> {
  // UserButton 클릭
  await page.click('[data-clerk-component="UserButton"]');

  // 로그아웃 버튼 클릭
  await page.getByRole("menuitem", { name: "로그아웃" }).click();

  // 로그아웃 완료 대기
  await page.waitForSelector('button:has-text("로그인")', { timeout: 10000 });
}

/**
 * 테스트 환경 변수에서 테스트 계정 정보 가져오기
 * 환경변수: TEST_USER_EMAIL, TEST_USER_PASSWORD
 */
export function getTestCredentials(): { email: string; password: string } {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.warn(
      "테스트 계정 정보가 환경변수에 설정되지 않았습니다. " +
        "TEST_USER_EMAIL, TEST_USER_PASSWORD 환경변수를 설정해주세요."
    );
  }

  return {
    email: email || "test@example.com",
    password: password || "testpassword123",
  };
}

