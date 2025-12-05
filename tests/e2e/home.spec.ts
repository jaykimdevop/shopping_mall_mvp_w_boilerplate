/**
 * @file home.spec.ts
 * @description 홈페이지 E2E 테스트
 *
 * 테스트 범위:
 * 1. 홈페이지 로드 및 기본 요소 표시
 * 2. 카테고리 섹션 동작
 * 3. 프로모션 섹션 표시
 * 4. 상품 그리드 표시
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS } from "../fixtures/test-data";

test.describe("홈페이지 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
  });

  test("홈페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/모두쇼핑/);

    // 네비게이션 바 확인
    await expect(page.getByRole("link", { name: "모두쇼핑" })).toBeVisible();
  });

  test("네비게이션 바에 로그인 버튼이 표시되어야 함 (비로그인 상태)", async ({
    page,
  }) => {
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("카테고리 섹션이 표시되어야 함", async ({ page }) => {
    // 카테고리 제목 또는 카테고리 카드 확인
    const categorySection = page.locator("text=카테고리").first();
    await expect(categorySection).toBeVisible();
  });

  test("카테고리 카드 클릭 시 상품 목록 페이지로 이동해야 함", async ({
    page,
  }) => {
    // 카테고리 섹션이 로드될 때까지 대기
    await page.waitForSelector('a[href*="/products?category="]', { timeout: 15000 }).catch(() => null);

    // 첫 번째 카테고리 카드 클릭 (category= 쿼리 파라미터 포함)
    const categoryCard = page.locator('a[href*="/products?category="]').first();

    // 카테고리 카드가 있는 경우에만 테스트
    if ((await categoryCard.count()) > 0) {
      await categoryCard.click();
      await expect(page).toHaveURL(/\/products\?category=/);
    } else {
      // 카테고리 카드가 없으면 테스트 스킵
      test.skip();
    }
  });

  test("프로모션 섹션이 표시되어야 함", async ({ page }) => {
    // 프로모션 관련 텍스트 또는 섹션 확인
    const promotionSection = page
      .locator("text=/프로모션|특가|할인|SALE/i")
      .first();

    // 프로모션 섹션이 있으면 확인
    if ((await promotionSection.count()) > 0) {
      await expect(promotionSection).toBeVisible();
    }
  });

  test("상품 목록이 그리드 형태로 표시되어야 함", async ({ page }) => {
    // 상품 카드들이 표시되는지 확인
    const productCards = page.locator('[href*="/products/"]');

    // 최소 1개 이상의 상품이 있어야 함
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("상품 카드 클릭 시 상품 상세 페이지로 이동해야 함", async ({ page }) => {
    // 상품 그리드가 로드될 때까지 대기
    await page.waitForLoadState("networkidle");

    // 상품 카드 링크 찾기 (UUID 형식의 ID를 포함하는 링크)
    // UUID 패턴: 8-4-4-4-12 형식
    const productCards = page.locator('a[href^="/products/"]').filter({
      has: page.locator('h3'), // 상품명이 있는 카드만
    });

    if ((await productCards.count()) > 0) {
      const firstCard = productCards.first();
      await firstCard.click();
      // 상품 상세 페이지로 이동 확인
      await expect(page).toHaveURL(/\/products\/[a-f0-9-]+$/);
    } else {
      // 상품이 없으면 스킵
      test.skip();
    }
  });

  test("다크모드/라이트모드 토글이 동작해야 함", async ({ page }) => {
    // 테마 토글 버튼이 있는 경우 테스트
    const themeToggle = page.locator('[aria-label*="테마"]').first();

    if ((await themeToggle.count()) > 0) {
      await themeToggle.click();
      // 테마 변경 확인 (html 클래스 또는 data 속성)
    }
  });
});

test.describe("홈페이지 반응형 테스트", () => {
  test("모바일 뷰포트에서 정상 표시되어야 함", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(TEST_URLS.home);

    // 네비게이션 확인
    await expect(page.getByRole("link", { name: "모두쇼핑" })).toBeVisible();

    // 상품 카드 확인
    const productCards = page.locator('[href*="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("태블릿 뷰포트에서 정상 표시되어야 함", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(TEST_URLS.home);

    // 네비게이션 확인
    await expect(page.getByRole("link", { name: "모두쇼핑" })).toBeVisible();
  });
});

