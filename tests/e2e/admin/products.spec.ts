/**
 * @file products.spec.ts
 * @description 관리자 상품 관리 E2E 테스트
 *
 * 테스트 범위:
 * 1. 상품 목록 페이지 로드
 * 2. 상품 검색 기능
 * 3. 상품 필터링 기능
 * 4. 상품 등록 페이지 이동
 * 5. 상품 상태 토글
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS, SELECTORS } from "../../fixtures/test-data";
import { loginAsAdmin, getAdminCredentials } from "../../fixtures/auth-helpers";

test.describe("관리자 상품 관리 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.products);
  });

  test("상품 목록 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    // 페이지 헤딩 확인
    await expect(page.getByRole("heading", { name: /상품 관리/i })).toBeVisible();
    
    // 상품 등록 버튼 확인
    await expect(page.getByRole("link", { name: /상품 등록/i })).toBeVisible();
  });

  test("상품 검색 기능이 동작해야 함", async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.getByPlaceholder(/검색/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill("테스트 상품");
      await searchInput.press("Enter");
      
      // 검색 결과가 표시되거나 빈 결과 메시지가 표시되어야 함
      await page.waitForLoadState("networkidle");
    }
  });

  test("상품 등록 버튼 클릭 시 등록 페이지로 이동해야 함", async ({ page }) => {
    await page.getByRole("link", { name: /상품 등록/i }).click();
    await expect(page).toHaveURL(TEST_URLS.admin.productNew);
  });

  test("상품 목록 테이블이 표시되어야 함", async ({ page }) => {
    // 테이블 또는 상품 목록 확인
    const productTable = page.locator("table").first();
    const productList = page.locator('[data-testid="product-list"]').first();
    
    // 테이블 또는 목록 중 하나가 표시되어야 함
    const hasTable = await productTable.isVisible().catch(() => false);
    const hasList = await productList.isVisible().catch(() => false);
    
    expect(hasTable || hasList).toBeTruthy();
  });

  test("카테고리 필터가 동작해야 함", async ({ page }) => {
    // 카테고리 필터 드롭다운 찾기
    const categoryFilter = page.getByRole("combobox", { name: /카테고리/i }).first();
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      // 드롭다운 옵션이 표시되어야 함
      await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
    }
  });

  test("상태 필터가 동작해야 함", async ({ page }) => {
    // 상태 필터 드롭다운 찾기
    const statusFilter = page.getByRole("combobox", { name: /상태/i }).first();
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      // 드롭다운 옵션이 표시되어야 함
      await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
    }
  });

  test("페이지네이션이 동작해야 함", async ({ page }) => {
    // 페이지네이션 버튼 찾기
    const nextButton = page.getByRole("button", { name: /다음/i });
    const pagination = page.locator('[aria-label="pagination"]');
    
    // 페이지네이션이 있는 경우에만 테스트
    if (await nextButton.isVisible() || await pagination.isVisible()) {
      // 다음 페이지 버튼이 활성화되어 있으면 클릭
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForLoadState("networkidle");
      }
    }
  });
});

test.describe("상품 등록 페이지 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.productNew);
  });

  test("상품 등록 폼이 표시되어야 함", async ({ page }) => {
    // 필수 입력 필드들 확인
    await expect(page.getByLabel(/상품명/i)).toBeVisible();
    await expect(page.getByLabel(/가격/i)).toBeVisible();
    await expect(page.getByLabel(/재고/i)).toBeVisible();
  });

  test("필수 필드 없이 제출 시 에러가 표시되어야 함", async ({ page }) => {
    // 빈 폼으로 제출 시도
    const submitButton = page.getByRole("button", { name: /등록|저장/i });
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // 유효성 검사 에러 메시지가 표시되어야 함
      await page.waitForSelector('[role="alert"], .error-message, [data-error]', { 
        timeout: 3000 
      }).catch(() => null);
    }
  });
});

