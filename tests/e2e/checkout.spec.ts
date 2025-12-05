/**
 * @file checkout.spec.ts
 * @description 주문/체크아웃 E2E 테스트
 *
 * 테스트 범위:
 * 1. 체크아웃 페이지 접근 (로그인 필수)
 * 2. 배송지 정보 입력 폼
 * 3. 주문 요약 표시
 * 4. 주문 완료 플로우
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS } from "../fixtures/test-data";
import { loginWithClerk, getTestCredentials } from "../fixtures/auth-helpers";

test.describe("체크아웃 - 접근 제어 테스트", () => {
  test("비로그인 상태에서 체크아웃 페이지 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    await page.goto(TEST_URLS.checkout);

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/sign-in/);
  });

  test.skip("장바구니가 비어있을 때 체크아웃 접근 시 장바구니 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 장바구니가 비어있는 상태에서 체크아웃 접근
    await page.goto(TEST_URLS.checkout);

    // 장바구니 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/cart/);
  });
});

test.describe("체크아웃 - 폼 테스트", () => {
  // 이 테스트들은 장바구니에 상품이 있는 상태를 전제로 합니다.

  test.skip("배송지 정보 입력 폼이 표시되어야 함", async ({ page }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 먼저 상품을 장바구니에 추가
    await page.goto(TEST_URLS.products);
    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    const addToCartButton = page.getByRole("button", { name: /장바구니/ });
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    // 체크아웃 페이지로 이동
    await page.goto(TEST_URLS.checkout);

    // 배송지 입력 필드들 확인
    await expect(page.getByLabel(/수령인|이름/)).toBeVisible();
    await expect(page.getByLabel(/연락처|전화/)).toBeVisible();
    await expect(page.getByLabel(/주소/)).toBeVisible();
  });

  test.skip("필수 필드 미입력 시 에러 메시지가 표시되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 상품 추가 후 체크아웃
    await page.goto(TEST_URLS.products);
    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    const addToCartButton = page.getByRole("button", { name: /장바구니/ });
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    await page.goto(TEST_URLS.checkout);

    // 빈 상태로 제출 시도
    const submitButton = page.getByRole("button", { name: /결제|주문/ });
    await submitButton.click();

    // 에러 메시지 확인
    await expect(page.locator("text=/입력해주세요|필수/i").first()).toBeVisible();
  });

  test.skip("유효한 정보 입력 후 주문이 완료되어야 함", async ({ page }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 상품 추가
    await page.goto(TEST_URLS.products);
    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    const addToCartButton = page.getByRole("button", { name: /장바구니/ });
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    // 체크아웃 페이지
    await page.goto(TEST_URLS.checkout);

    // 배송지 정보 입력
    await page.getByLabel(/수령인|이름/).fill("테스트 사용자");
    await page.getByLabel(/연락처|전화/).fill("010-1234-5678");
    await page.getByLabel(/우편번호/).fill("12345");
    await page.getByLabel(/기본 주소/).fill("서울시 강남구 테스트동");
    await page.getByLabel(/상세 주소/).fill("101호");

    // 주문 제출
    const submitButton = page.getByRole("button", { name: /결제|주문/ });
    await submitButton.click();

    // 주문 완료 페이지로 이동 확인
    await expect(page).toHaveURL(/orders.*complete/, { timeout: 10000 });
  });
});

test.describe("체크아웃 - 주문 요약 테스트", () => {
  test.skip("주문 요약에 상품 정보가 표시되어야 함", async ({ page }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 상품 추가 후 체크아웃
    await page.goto(TEST_URLS.products);
    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    const addToCartButton = page.getByRole("button", { name: /장바구니/ });
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    await page.goto(TEST_URLS.checkout);

    // 주문 요약 섹션 확인
    await expect(page.locator("text=/주문 상품/i")).toBeVisible();

    // 총 금액 표시 확인
    await expect(page.locator("text=/총.*원/i").first()).toBeVisible();
  });
});

test.describe("주문 완료 페이지 테스트", () => {
  test.skip("주문 완료 후 주문 정보가 표시되어야 함", async ({ page }) => {
    // 이 테스트는 실제 주문 완료 후 페이지를 확인합니다.
    // 주문 ID가 필요하므로 전체 플로우를 실행해야 합니다.

    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 전체 주문 플로우 실행
    await page.goto(TEST_URLS.products);
    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    const addToCartButton = page.getByRole("button", { name: /장바구니/ });
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    await page.goto(TEST_URLS.checkout);

    // 배송지 정보 입력
    await page.getByLabel(/수령인|이름/).fill("테스트 사용자");
    await page.getByLabel(/연락처|전화/).fill("010-1234-5678");
    await page.getByLabel(/우편번호/).fill("12345");
    await page.getByLabel(/기본 주소/).fill("서울시 강남구 테스트동");

    // 주문 제출
    const submitButton = page.getByRole("button", { name: /결제|주문/ });
    await submitButton.click();

    // 주문 완료 페이지 확인
    await expect(page).toHaveURL(/orders.*complete/, { timeout: 10000 });

    // 주문 완료 메시지 확인
    await expect(page.locator("text=/완료|성공/i").first()).toBeVisible();

    // 주문 번호 표시 확인
    await expect(page.locator("text=/주문번호|주문 번호/i")).toBeVisible();
  });
});

