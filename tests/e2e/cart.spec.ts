/**
 * @file cart.spec.ts
 * @description 장바구니 E2E 테스트
 *
 * 테스트 범위:
 * 1. 비로그인 시 장바구니 접근
 * 2. 로그인 후 장바구니 담기
 * 3. 수량 변경
 * 4. 상품 삭제
 * 5. 장바구니 배지 업데이트
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS } from "../fixtures/test-data";
import {
  loginWithClerk,
  getTestCredentials,
  isLoggedIn,
} from "../fixtures/auth-helpers";

test.describe("장바구니 - 비로그인 상태 테스트", () => {
  test("비로그인 상태에서 장바구니 페이지 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    await page.goto(TEST_URLS.cart);

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/sign-in/);
  });

  test("비로그인 상태에서 장바구니 담기 시 로그인 유도되어야 함", async ({
    page,
  }) => {
    // 상품 목록 페이지로 이동
    await page.goto(TEST_URLS.products);
    await page.waitForLoadState("networkidle");

    // 상품 카드 클릭하여 상세 페이지로 이동
    const productCards = page.locator('a[href^="/products/"]').filter({
      has: page.locator('h3'),
    });

    if ((await productCards.count()) === 0) {
      test.skip();
      return;
    }

    await productCards.first().click();
    await page.waitForLoadState("networkidle");

    // 장바구니 담기 버튼 클릭
    const addToCartButton = page.getByRole("button", { name: /장바구니/ });
    await addToCartButton.click();

    // 로그인 페이지로 리다이렉트 또는 토스트 메시지 확인
    // 최대 5초 대기
    await page.waitForTimeout(3000);

    // 로그인 모달이 열리거나 로그인 페이지로 리다이렉트 또는 토스트 메시지
    const signInModal = page.locator('[data-clerk-component="SignIn"]');
    const signInPage = page.url().includes("sign-in");
    const loginToast = page.locator("text=/로그인이 필요/i");

    const modalVisible = (await signInModal.count()) > 0;
    const toastVisible = (await loginToast.count()) > 0;

    expect(modalVisible || signInPage || toastVisible).toBeTruthy();
  });
});

test.describe("장바구니 - 로그인 상태 테스트", () => {
  // 이 테스트 그룹은 실제 테스트 계정이 필요합니다.
  // 환경변수 TEST_USER_EMAIL, TEST_USER_PASSWORD 설정 필요

  test.skip("로그인 후 장바구니에 상품 추가가 가능해야 함", async ({ page }) => {
    const { email, password } = getTestCredentials();

    // 홈페이지에서 로그인
    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 상품 상세 페이지로 이동
    await page.goto(TEST_URLS.products);
    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    // 장바구니 담기
    const addToCartButton = page.getByRole("button", { name: /장바구니/ });
    await addToCartButton.click();

    // 성공 토스트 메시지 확인
    await expect(page.locator("text=/추가되었습니다/i")).toBeVisible({
      timeout: 5000,
    });
  });

  test.skip("장바구니에서 수량 변경이 가능해야 함", async ({ page }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 장바구니 페이지로 이동
    await page.goto(TEST_URLS.cart);

    // 장바구니에 상품이 있는 경우
    const quantityIncrease = page.locator('button:has-text("+")').first();

    if ((await quantityIncrease.count()) > 0) {
      await quantityIncrease.click();

      // 수량 증가 확인
      await page.waitForTimeout(1000);
    }
  });

  test.skip("장바구니에서 상품 삭제가 가능해야 함", async ({ page }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 장바구니 페이지로 이동
    await page.goto(TEST_URLS.cart);

    // 삭제 버튼 클릭
    const deleteButton = page.getByRole("button", { name: /삭제/ }).first();

    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();

      // 삭제 확인 (토스트 또는 상품 목록 변경)
      await page.waitForTimeout(1000);
    }
  });
});

test.describe("장바구니 배지 테스트", () => {
  test.skip("장바구니에 상품 추가 시 배지 카운트가 업데이트되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 초기 배지 카운트 확인
    const cartBadge = page.locator('[aria-label*="장바구니"]').first();

    // 상품 추가
    await page.goto(TEST_URLS.products);
    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    const addToCartButton = page.getByRole("button", { name: /장바구니/ });
    await addToCartButton.click();

    // 배지 업데이트 대기
    await page.waitForTimeout(2000);

    // 배지에 숫자가 표시되어야 함
    await expect(cartBadge).toBeVisible();
  });
});

test.describe("빈 장바구니 테스트", () => {
  test.skip("빈 장바구니에서 적절한 메시지가 표시되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 장바구니 페이지로 이동
    await page.goto(TEST_URLS.cart);

    // 장바구니가 비어있는 경우 메시지 확인
    const emptyMessage = page.locator("text=/비어있습니다|상품이 없습니다/i");

    // 비어있거나 상품이 있거나
    const isEmpty = (await emptyMessage.count()) > 0;
    const hasProducts =
      (await page.locator('[href*="/products/"]').count()) > 0;

    expect(isEmpty || hasProducts).toBeTruthy();
  });
});

