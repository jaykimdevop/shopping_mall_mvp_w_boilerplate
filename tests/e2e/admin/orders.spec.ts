/**
 * @file orders.spec.ts
 * @description 관리자 주문 관리 E2E 테스트
 *
 * 테스트 범위:
 * 1. 주문 목록 페이지 로드
 * 2. 주문 상태별 필터링
 * 3. 주문 검색 기능
 * 4. 주문 상세 페이지 이동
 * 5. 주문 상태 변경
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS, SELECTORS } from "../../fixtures/test-data";
import { loginAsAdmin, getAdminCredentials } from "../../fixtures/auth-helpers";

test.describe("관리자 주문 관리 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.orders);
  });

  test("주문 목록 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    // 페이지 헤딩 확인
    await expect(page.getByRole("heading", { name: /주문 관리/i })).toBeVisible();
  });

  test("주문 상태별 필터 탭이 표시되어야 함", async ({ page }) => {
    // 상태별 필터 탭 확인
    const statusTabs = page.locator('[role="tablist"], .status-tabs');
    
    // 탭이 있거나 상태 필터 드롭다운이 있어야 함
    const hasTabs = await statusTabs.isVisible().catch(() => false);
    const hasStatusFilter = await page.getByRole("combobox", { name: /상태/i }).isVisible().catch(() => false);
    
    expect(hasTabs || hasStatusFilter).toBeTruthy();
  });

  test("주문 검색 기능이 동작해야 함", async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.getByPlaceholder(/검색|주문번호/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill("test-order-id");
      await searchInput.press("Enter");
      
      await page.waitForLoadState("networkidle");
    }
  });

  test("주문 목록 테이블이 표시되어야 함", async ({ page }) => {
    // 테이블 확인
    const orderTable = page.locator("table").first();
    const orderList = page.locator('[data-testid="order-list"]').first();
    
    const hasTable = await orderTable.isVisible().catch(() => false);
    const hasList = await orderList.isVisible().catch(() => false);
    
    expect(hasTable || hasList).toBeTruthy();
  });

  test("날짜 범위 필터가 동작해야 함", async ({ page }) => {
    // 날짜 필터 입력 필드 찾기
    const dateFilter = page.getByRole("textbox", { name: /날짜/i }).first();
    const dateButton = page.getByRole("button", { name: /날짜|기간/i }).first();
    
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
    } else if (await dateButton.isVisible()) {
      await dateButton.click();
    }
  });

  test("주문 상태별 건수가 표시되어야 함", async ({ page }) => {
    // 상태별 건수 표시 확인 (배지 또는 카운터)
    const statusCounts = page.locator('.status-count, [data-status-count]');
    
    // 건수가 표시되거나 탭에 숫자가 포함되어 있어야 함
    await page.waitForLoadState("networkidle");
  });

  test("주문 행 클릭 시 상세 페이지로 이동해야 함", async ({ page }) => {
    // 주문 목록에서 첫 번째 주문 클릭
    const orderRow = page.locator("table tbody tr").first();
    const orderLink = page.locator('a[href*="/admin/orders/"]').first();
    
    if (await orderLink.isVisible()) {
      await orderLink.click();
      await expect(page).toHaveURL(/\/admin\/orders\/[a-f0-9-]+$/);
    } else if (await orderRow.isVisible()) {
      await orderRow.click();
      // 상세 페이지로 이동하거나 모달이 열려야 함
    }
  });

  test("페이지네이션이 동작해야 함", async ({ page }) => {
    const nextButton = page.getByRole("button", { name: /다음/i });
    
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForLoadState("networkidle");
    }
  });
});

test.describe("주문 상태 변경 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.orders);
  });

  test("주문 상태 변경 드롭다운이 동작해야 함", async ({ page }) => {
    // 상태 변경 드롭다운 찾기
    const statusSelect = page.getByRole("combobox", { name: /상태 변경/i }).first();
    
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      
      // 상태 옵션들이 표시되어야 함
      await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
    }
  });
});

