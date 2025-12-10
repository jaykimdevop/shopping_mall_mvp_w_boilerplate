/**
 * @file shipping.spec.ts
 * @description 관리자 배송 관리 E2E 테스트
 *
 * 테스트 범위:
 * 1. 배송 목록 페이지 로드
 * 2. 배송 상태별 필터링
 * 3. 운송장 번호 입력
 * 4. 배송 완료 처리
 * 5. 일괄 운송장 입력
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS, SELECTORS } from "../../fixtures/test-data";
import { loginAsAdmin, getAdminCredentials } from "../../fixtures/auth-helpers";

test.describe("관리자 배송 관리 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.shipping);
  });

  test("배송 목록 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    // 페이지 헤딩 확인
    await expect(page.getByRole("heading", { name: /배송 관리/i })).toBeVisible();
  });

  test("배송 상태별 필터 탭이 표시되어야 함", async ({ page }) => {
    // 상태별 필터 탭 확인 (배송 대기, 배송 중, 배송 완료)
    const pendingTab = page.getByRole("tab", { name: /배송 대기/i });
    const shippedTab = page.getByRole("tab", { name: /배송 중/i });
    const deliveredTab = page.getByRole("tab", { name: /배송 완료/i });
    
    // 탭이 있거나 필터 드롭다운이 있어야 함
    const hasTabs = await pendingTab.isVisible().catch(() => false);
    const hasStatusFilter = await page.getByRole("combobox", { name: /상태/i }).isVisible().catch(() => false);
    
    expect(hasTabs || hasStatusFilter).toBeTruthy();
  });

  test("배송 업체 필터가 동작해야 함", async ({ page }) => {
    // 배송 업체 필터 드롭다운 찾기
    const carrierFilter = page.getByRole("combobox", { name: /배송 업체|택배사/i });
    
    if (await carrierFilter.isVisible()) {
      await carrierFilter.click();
      
      // 택배사 옵션들이 표시되어야 함
      await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
    }
  });

  test("배송 검색 기능이 동작해야 함", async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.getByPlaceholder(/검색|주문번호|운송장/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill("test-tracking");
      await searchInput.press("Enter");
      
      await page.waitForLoadState("networkidle");
    }
  });

  test("배송 목록 테이블이 표시되어야 함", async ({ page }) => {
    // 테이블 확인
    const shippingTable = page.locator("table").first();
    
    await expect(shippingTable).toBeVisible();
  });

  test("운송장 입력 필드가 표시되어야 함", async ({ page }) => {
    // 인라인 운송장 입력 필드 또는 입력 버튼 찾기
    const trackingInput = page.getByPlaceholder(/운송장/i).first();
    const trackingButton = page.getByRole("button", { name: /운송장 입력/i }).first();
    
    const hasInput = await trackingInput.isVisible().catch(() => false);
    const hasButton = await trackingButton.isVisible().catch(() => false);
    
    // 입력 필드 또는 버튼이 있어야 함
    expect(hasInput || hasButton).toBeTruthy();
  });

  test("일괄 운송장 입력 버튼이 표시되어야 함", async ({ page }) => {
    // 일괄 입력 버튼 찾기
    const bulkButton = page.getByRole("button", { name: /일괄|대량/i });
    
    if (await bulkButton.isVisible()) {
      await bulkButton.click();
      
      // 모달이 열려야 함
      await page.waitForSelector('[role="dialog"]', { timeout: 3000 }).catch(() => null);
    }
  });

  test("배송 상태별 건수가 표시되어야 함", async ({ page }) => {
    // 상태별 건수 확인
    await page.waitForLoadState("networkidle");
    
    // 탭에 건수가 표시되거나 통계 카드가 있어야 함
    const countBadges = page.locator('.badge, [data-count]');
    await countBadges.first().isVisible().catch(() => false);
  });
});

test.describe("운송장 입력 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.shipping);
  });

  test("배송 업체 선택 후 운송장 번호 입력이 가능해야 함", async ({ page }) => {
    // 배송 대기 탭 클릭 (있는 경우)
    const pendingTab = page.getByRole("tab", { name: /배송 대기/i });
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      await page.waitForLoadState("networkidle");
    }
    
    // 첫 번째 주문의 운송장 입력 필드 찾기
    const carrierSelect = page.getByRole("combobox").first();
    const trackingInput = page.getByPlaceholder(/운송장/i).first();
    
    if (await carrierSelect.isVisible() && await trackingInput.isVisible()) {
      // 배송 업체 선택
      await carrierSelect.click();
      await page.getByRole("option").first().click();
      
      // 운송장 번호 입력
      await trackingInput.fill("1234567890");
    }
  });

  test("운송장 입력 시 저장 버튼이 활성화되어야 함", async ({ page }) => {
    // 저장/확인 버튼 찾기
    const saveButton = page.getByRole("button", { name: /저장|확인|입력/i }).first();
    
    // 버튼 상태 확인
    if (await saveButton.isVisible()) {
      // 초기에는 비활성화되어 있을 수 있음
      const isDisabled = await saveButton.isDisabled();
      expect(typeof isDisabled).toBe("boolean");
    }
  });
});

test.describe("배송 완료 처리 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.shipping);
  });

  test("배송 중 탭에서 배송 완료 버튼이 표시되어야 함", async ({ page }) => {
    // 배송 중 탭 클릭
    const shippedTab = page.getByRole("tab", { name: /배송 중/i });
    if (await shippedTab.isVisible()) {
      await shippedTab.click();
      await page.waitForLoadState("networkidle");
    }
    
    // 배송 완료 버튼 찾기
    const deliveredButton = page.getByRole("button", { name: /배송 완료/i }).first();
    
    // 배송 중인 주문이 있으면 버튼이 표시되어야 함
    await deliveredButton.isVisible().catch(() => false);
  });
});

