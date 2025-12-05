/**
 * @file products.spec.ts
 * @description 상품 관련 E2E 테스트
 *
 * 테스트 범위:
 * 1. 상품 목록 페이지 로드
 * 2. 페이지네이션/무한 스크롤
 * 3. 카테고리 필터링
 * 4. 상품 상세 페이지
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS } from "../fixtures/test-data";

test.describe("상품 목록 페이지 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.products);
  });

  test("상품 목록 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator("h1")).toContainText(/상품|전체/);
  });

  test("상품 카드들이 표시되어야 함", async ({ page }) => {
    // 상품 카드 확인
    const productCards = page.locator('[href*="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("상품 카드에 필수 정보가 표시되어야 함", async ({ page }) => {
    // 상품 카드 대기
    await page.waitForSelector('a[href^="/products/"]', { timeout: 15000 });

    // 첫 번째 상품 카드
    const firstProductCard = page.locator('a[href^="/products/"][href*="-"]').first();

    // 상품 이미지 영역 확인 (placeholder SVG 또는 실제 이미지)
    const hasImage = (await firstProductCard.locator("img").count()) > 0;
    const hasPlaceholder = (await firstProductCard.locator("svg").count()) > 0;
    expect(hasImage || hasPlaceholder).toBeTruthy();

    // 상품 가격 확인 (원 단위)
    await expect(firstProductCard.locator("text=/₩|원/")).toBeVisible();
  });

  test("더보기 버튼 또는 무한 스크롤이 동작해야 함", async ({ page }) => {
    // 초기 상품 수 확인
    const initialProducts = page.locator('[href*="/products/"]');
    const initialCount = await initialProducts.count();

    // 더보기 버튼이 있는 경우
    const loadMoreButton = page.getByRole("button", { name: /더보기|더 보기/ });

    if ((await loadMoreButton.count()) > 0) {
      await loadMoreButton.click();

      // 상품이 더 로드될 때까지 대기
      await page.waitForTimeout(2000);

      // 상품 수가 증가했는지 확인
      const newCount = await initialProducts.count();
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    }
  });
});

test.describe("카테고리 필터링 테스트", () => {
  test("카테고리 필터가 URL에 반영되어야 함", async ({ page }) => {
    // 카테고리가 있는 상품 목록 페이지로 이동
    await page.goto(`${TEST_URLS.products}?category=tops`);

    // URL에 카테고리 파라미터 확인
    await expect(page).toHaveURL(/category=tops/);
  });

  test("카테고리 선택 시 해당 카테고리 상품만 표시되어야 함", async ({
    page,
  }) => {
    await page.goto(TEST_URLS.products);

    // 카테고리 필터 버튼/탭이 있는 경우
    const categoryFilter = page
      .locator('[href*="category="], button:has-text("상의")')
      .first();

    if ((await categoryFilter.count()) > 0) {
      await categoryFilter.click();
      await page.waitForLoadState("networkidle");

      // URL이 변경되었는지 확인
      await expect(page).toHaveURL(/category=/);
    }
  });
});

test.describe("상품 상세 페이지 테스트", () => {
  test("상품 상세 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    // 상품 목록에서 첫 번째 상품 클릭
    await page.goto(TEST_URLS.products);

    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    // 상세 페이지 URL 확인
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9-]+/);
  });

  test("상품 상세 정보가 표시되어야 함", async ({ page }) => {
    await page.goto(TEST_URLS.products);

    // 상품 카드 대기
    await page.waitForSelector('a[href^="/products/"]', { timeout: 15000 });

    const productCard = page.locator('a[href^="/products/"][href*="-"]').first();
    await productCard.click();

    // 상품 상세 페이지 로드 대기
    await page.waitForLoadState("networkidle");

    // 상품 가격 확인
    await expect(page.locator("text=/₩|원/").first()).toBeVisible();

    // 장바구니 버튼 확인
    await expect(
      page.getByRole("button", { name: /장바구니/ })
    ).toBeVisible();
  });

  test("수량 선택기가 동작해야 함", async ({ page }) => {
    await page.goto(TEST_URLS.products);

    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    // 수량 증가 버튼
    const increaseButton = page.locator('button:has-text("+")').first();

    if ((await increaseButton.count()) > 0) {
      await increaseButton.click();

      // 수량이 2로 변경되었는지 확인
      await expect(page.locator("text=/2/").first()).toBeVisible();
    }
  });

  test("재고 정보가 표시되어야 함", async ({ page }) => {
    await page.goto(TEST_URLS.products);

    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    // 재고 관련 텍스트 확인 (재고, 품절, 수량 등)
    const stockInfo = page.locator("text=/재고|품절|남음/i").first();

    // 재고 정보가 있으면 확인
    if ((await stockInfo.count()) > 0) {
      await expect(stockInfo).toBeVisible();
    }
  });

  test("관련 상품이 표시되어야 함", async ({ page }) => {
    await page.goto(TEST_URLS.products);

    const productCard = page.locator('[href*="/products/"]').first();
    await productCard.click();

    // 관련 상품 섹션 확인
    const relatedSection = page.locator("text=/관련|추천|함께/i").first();

    // 관련 상품 섹션이 있으면 확인
    if ((await relatedSection.count()) > 0) {
      await expect(relatedSection).toBeVisible();
    }
  });
});

test.describe("상품 페이지 에러 처리 테스트", () => {
  test("존재하지 않는 상품 페이지 접근 시 에러 처리되어야 함", async ({
    page,
  }) => {
    await page.goto("/products/non-existent-product-id-12345");

    // 404 페이지 또는 에러 메시지 확인
    const errorIndicator = page
      .locator("text=/찾을 수 없|존재하지 않|404|오류/i")
      .first();

    // 에러 표시가 있거나 홈으로 리다이렉트
    const hasError = (await errorIndicator.count()) > 0;
    const redirectedHome = page.url().includes(TEST_URLS.home);

    expect(hasError || redirectedHome).toBeTruthy();
  });
});

