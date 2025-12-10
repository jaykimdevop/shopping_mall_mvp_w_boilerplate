/**
 * @file dashboard.spec.ts
 * @description 관리자 대시보드 E2E 테스트
 *
 * 테스트 범위:
 * 1. 대시보드 페이지 로드 및 기본 요소 표시
 * 2. 통계 카드 표시
 * 3. 최근 주문 목록 표시
 * 4. 재고 부족 상품 알림 표시
 * 5. 사이드바 네비게이션 동작
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS, SELECTORS } from "../../fixtures/test-data";
import { loginAsAdmin, getAdminCredentials } from "../../fixtures/auth-helpers";

test.describe("관리자 대시보드 테스트", () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지에서 관리자로 로그인
    await page.goto(TEST_URLS.home);
    
    // 관리자 계정 정보 확인
    const { email, password } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.dashboard);
  });

  test("대시보드 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    // 페이지 타이틀 또는 헤딩 확인
    await expect(page.getByRole("heading", { name: /대시보드/i })).toBeVisible();
  });

  test("사이드바 네비게이션이 표시되어야 함", async ({ page }) => {
    // 사이드바 메뉴 항목들 확인
    await expect(page.getByRole("link", { name: SELECTORS.admin.sidebar.dashboard })).toBeVisible();
    await expect(page.getByRole("link", { name: SELECTORS.admin.sidebar.products })).toBeVisible();
    await expect(page.getByRole("link", { name: SELECTORS.admin.sidebar.orders })).toBeVisible();
    await expect(page.getByRole("link", { name: SELECTORS.admin.sidebar.banners })).toBeVisible();
    await expect(page.getByRole("link", { name: SELECTORS.admin.sidebar.users })).toBeVisible();
    await expect(page.getByRole("link", { name: SELECTORS.admin.sidebar.shipping })).toBeVisible();
  });

  test("통계 카드들이 표시되어야 함", async ({ page }) => {
    // 통계 카드 확인 (텍스트 기반)
    await expect(page.getByText(/총 주문/i)).toBeVisible();
    await expect(page.getByText(/총 매출/i)).toBeVisible();
    await expect(page.getByText(/총 상품/i)).toBeVisible();
    await expect(page.getByText(/총 회원/i)).toBeVisible();
  });

  test("최근 주문 목록이 표시되어야 함", async ({ page }) => {
    // 최근 주문 섹션 확인
    await expect(page.getByText(/최근 주문/i)).toBeVisible();
  });

  test("재고 부족 상품 알림이 표시되어야 함", async ({ page }) => {
    // 재고 부족 섹션 확인
    await expect(page.getByText(/재고 부족/i)).toBeVisible();
  });

  test("사이드바에서 상품 관리 클릭 시 이동해야 함", async ({ page }) => {
    await page.getByRole("link", { name: SELECTORS.admin.sidebar.products }).click();
    await expect(page).toHaveURL(TEST_URLS.admin.products);
  });

  test("사이드바에서 주문 관리 클릭 시 이동해야 함", async ({ page }) => {
    await page.getByRole("link", { name: SELECTORS.admin.sidebar.orders }).click();
    await expect(page).toHaveURL(TEST_URLS.admin.orders);
  });

  test("사이드바에서 배너 관리 클릭 시 이동해야 함", async ({ page }) => {
    await page.getByRole("link", { name: SELECTORS.admin.sidebar.banners }).click();
    await expect(page).toHaveURL(TEST_URLS.admin.banners);
  });

  test("사이드바에서 회원 관리 클릭 시 이동해야 함", async ({ page }) => {
    await page.getByRole("link", { name: SELECTORS.admin.sidebar.users }).click();
    await expect(page).toHaveURL(TEST_URLS.admin.users);
  });

  test("사이드바에서 배송 관리 클릭 시 이동해야 함", async ({ page }) => {
    await page.getByRole("link", { name: SELECTORS.admin.sidebar.shipping }).click();
    await expect(page).toHaveURL(TEST_URLS.admin.shipping);
  });
});

test.describe("관리자 접근 권한 테스트", () => {
  test("비로그인 사용자는 관리자 페이지에 접근할 수 없어야 함", async ({ page }) => {
    await page.goto(TEST_URLS.admin.dashboard);
    
    // 로그인 페이지로 리다이렉트되거나 에러 페이지가 표시되어야 함
    await expect(page).not.toHaveURL(TEST_URLS.admin.dashboard);
  });
});

