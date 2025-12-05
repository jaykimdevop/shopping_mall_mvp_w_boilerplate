/**
 * @file mypage.spec.ts
 * @description 마이페이지 E2E 테스트
 *
 * 테스트 범위:
 * 1. 마이페이지 접근 (로그인 필수)
 * 2. 주문 내역 목록 조회
 * 3. 주문 상세 보기
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS } from "../fixtures/test-data";
import { loginWithClerk, getTestCredentials } from "../fixtures/auth-helpers";

test.describe("마이페이지 - 접근 제어 테스트", () => {
  test("비로그인 상태에서 마이페이지 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    await page.goto(TEST_URLS.mypage);

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe("마이페이지 - 주문 내역 테스트", () => {
  test.skip("로그인 후 마이페이지에서 주문 내역이 표시되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 마이페이지로 이동
    await page.goto(TEST_URLS.mypage);

    // 마이페이지 제목 확인
    await expect(page.locator("h1")).toContainText(/마이페이지/);
  });

  test.skip("주문 내역이 없을 때 적절한 메시지가 표시되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    await page.goto(TEST_URLS.mypage);

    // 주문 내역이 없는 경우 메시지 확인
    const emptyMessage = page.locator("text=/주문 내역이 없습니다|주문이 없습니다/i");
    const hasOrders = (await page.locator('[href*="/mypage/orders/"]').count()) > 0;

    // 주문이 있거나 빈 메시지가 있어야 함
    const isEmpty = (await emptyMessage.count()) > 0;
    expect(isEmpty || hasOrders).toBeTruthy();
  });

  test.skip("주문 내역 카드에 필수 정보가 표시되어야 함", async ({ page }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    await page.goto(TEST_URLS.mypage);

    // 주문 카드가 있는 경우
    const orderCard = page.locator('[href*="/mypage/orders/"]').first();

    if ((await orderCard.count()) > 0) {
      // 주문 날짜 확인
      await expect(page.locator("text=/\\d{4}.*\\d{1,2}.*\\d{1,2}/").first()).toBeVisible();

      // 주문 금액 확인
      await expect(page.locator("text=/\\d+.*원/").first()).toBeVisible();

      // 주문 상태 확인
      await expect(
        page.locator("text=/결제 대기|주문 확정|배송 중|배송 완료|주문 취소/").first()
      ).toBeVisible();
    }
  });

  test.skip("주문 카드 클릭 시 주문 상세 페이지로 이동해야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    await page.goto(TEST_URLS.mypage);

    // 주문 카드 클릭
    const orderCard = page.locator('[href*="/mypage/orders/"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // 주문 상세 페이지 URL 확인
      await expect(page).toHaveURL(/\/mypage\/orders\/[a-zA-Z0-9-]+/);
    }
  });
});

test.describe("마이페이지 - 주문 상세 테스트", () => {
  test.skip("주문 상세 페이지에서 주문 정보가 표시되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    await page.goto(TEST_URLS.mypage);

    // 주문 카드 클릭
    const orderCard = page.locator('[href*="/mypage/orders/"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // 주문 정보 섹션 확인
      await expect(page.locator("text=/주문 정보/i")).toBeVisible();

      // 주문 번호 확인
      await expect(page.locator("text=/주문번호/i")).toBeVisible();

      // 주문 상태 확인
      await expect(
        page.locator("text=/결제 대기|주문 확정|배송 중|배송 완료|주문 취소/").first()
      ).toBeVisible();
    }
  });

  test.skip("주문 상세 페이지에서 주문 상품 목록이 표시되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    await page.goto(TEST_URLS.mypage);

    const orderCard = page.locator('[href*="/mypage/orders/"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // 주문 상품 섹션 확인
      await expect(page.locator("text=/주문 상품/i")).toBeVisible();

      // 상품 이미지 또는 이름 확인
      await expect(page.locator("img").first()).toBeVisible();
    }
  });

  test.skip("주문 상세 페이지에서 배송지 정보가 표시되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    await page.goto(TEST_URLS.mypage);

    const orderCard = page.locator('[href*="/mypage/orders/"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // 배송지 정보 섹션 확인
      await expect(page.locator("text=/배송지 정보/i")).toBeVisible();

      // 수령인 정보 확인
      await expect(page.locator("text=/수령인/i")).toBeVisible();
    }
  });

  test.skip("주문 상세 페이지에서 결제 금액이 표시되어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    await page.goto(TEST_URLS.mypage);

    const orderCard = page.locator('[href*="/mypage/orders/"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // 결제 정보 섹션 확인
      await expect(page.locator("text=/결제 정보/i")).toBeVisible();

      // 총 결제 금액 확인
      await expect(page.locator("text=/총 결제금액/i")).toBeVisible();
      await expect(page.locator("text=/\\d+.*원/").first()).toBeVisible();
    }
  });

  test.skip("주문 상세 페이지에서 마이페이지로 돌아갈 수 있어야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    await page.goto(TEST_URLS.mypage);

    const orderCard = page.locator('[href*="/mypage/orders/"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // 뒤로가기 링크 클릭
      const backLink = page.locator("text=/내 주문 내역으로|돌아가기/i").first();
      await backLink.click();

      // 마이페이지로 이동 확인
      await expect(page).toHaveURL(TEST_URLS.mypage);
    }
  });
});

test.describe("마이페이지 - 네비게이션 테스트", () => {
  test.skip("네비게이션 바에서 마이페이지 아이콘 클릭 시 마이페이지로 이동해야 함", async ({
    page,
  }) => {
    const { email, password } = getTestCredentials();

    await page.goto(TEST_URLS.home);
    await loginWithClerk(page, email, password);

    // 마이페이지 아이콘 클릭
    const mypageIcon = page.locator('[href="/mypage"]').first();
    await mypageIcon.click();

    // 마이페이지로 이동 확인
    await expect(page).toHaveURL(TEST_URLS.mypage);
  });
});

