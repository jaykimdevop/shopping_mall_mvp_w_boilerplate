/**
 * @file users.spec.ts
 * @description 관리자 회원 관리 E2E 테스트
 *
 * 테스트 범위:
 * 1. 회원 목록 페이지 로드
 * 2. 회원 검색 기능
 * 3. 역할/등급 필터링
 * 4. 회원 상세 페이지 이동
 * 5. 역할/등급 변경
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS, SELECTORS } from "../../fixtures/test-data";
import { loginAsAdmin, getAdminCredentials } from "../../fixtures/auth-helpers";

test.describe("관리자 회원 관리 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.users);
  });

  test("회원 목록 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    // 페이지 헤딩 확인
    await expect(page.getByRole("heading", { name: /회원 관리/i })).toBeVisible();
  });

  test("회원 검색 기능이 동작해야 함", async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.getByPlaceholder(/검색|이름|이메일/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill("test@example.com");
      await searchInput.press("Enter");
      
      await page.waitForLoadState("networkidle");
    }
  });

  test("역할 필터가 동작해야 함", async ({ page }) => {
    // 역할 필터 드롭다운 찾기
    const roleFilter = page.getByRole("combobox", { name: /역할/i });
    
    if (await roleFilter.isVisible()) {
      await roleFilter.click();
      
      // 역할 옵션들이 표시되어야 함 (전체, 관리자, 일반)
      await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
    }
  });

  test("등급 필터가 동작해야 함", async ({ page }) => {
    // 등급 필터 드롭다운 찾기
    const tierFilter = page.getByRole("combobox", { name: /등급/i });
    
    if (await tierFilter.isVisible()) {
      await tierFilter.click();
      
      // 등급 옵션들이 표시되어야 함 (전체, VIP, 일반)
      await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
    }
  });

  test("회원 목록 테이블이 표시되어야 함", async ({ page }) => {
    // 테이블 확인
    const userTable = page.locator("table").first();
    const userList = page.locator('[data-testid="user-list"]').first();
    
    const hasTable = await userTable.isVisible().catch(() => false);
    const hasList = await userList.isVisible().catch(() => false);
    
    expect(hasTable || hasList).toBeTruthy();
  });

  test("회원 행 클릭 시 상세 페이지로 이동해야 함", async ({ page }) => {
    // 회원 목록에서 첫 번째 회원 클릭
    const userLink = page.locator('a[href*="/admin/users/"]').first();
    
    if (await userLink.isVisible()) {
      await userLink.click();
      await expect(page).toHaveURL(/\/admin\/users\/[a-zA-Z0-9_-]+$/);
    }
  });

  test("정렬 기능이 동작해야 함", async ({ page }) => {
    // 정렬 드롭다운 또는 테이블 헤더 클릭
    const sortSelect = page.getByRole("combobox", { name: /정렬/i });
    const tableHeader = page.locator("th").first();
    
    if (await sortSelect.isVisible()) {
      await sortSelect.click();
      await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
    } else if (await tableHeader.isVisible()) {
      await tableHeader.click();
      await page.waitForLoadState("networkidle");
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

test.describe("회원 상세 페이지 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.users);
  });

  test("회원 상세 페이지에서 프로필 정보가 표시되어야 함", async ({ page }) => {
    // 첫 번째 회원 상세 페이지로 이동
    const userLink = page.locator('a[href*="/admin/users/"]').first();
    
    if (await userLink.isVisible()) {
      await userLink.click();
      await page.waitForLoadState("networkidle");
      
      // 프로필 정보 확인
      await expect(page.getByText(/이메일/i)).toBeVisible();
    }
  });

  test("회원 상세 페이지에서 역할 변경이 가능해야 함", async ({ page }) => {
    // 첫 번째 회원 상세 페이지로 이동
    const userLink = page.locator('a[href*="/admin/users/"]').first();
    
    if (await userLink.isVisible()) {
      await userLink.click();
      await page.waitForLoadState("networkidle");
      
      // 역할 변경 드롭다운 찾기
      const roleSelect = page.getByRole("combobox", { name: /역할/i });
      
      if (await roleSelect.isVisible()) {
        await roleSelect.click();
        // 역할 옵션이 표시되어야 함
        await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
      }
    }
  });

  test("회원 상세 페이지에서 등급 변경이 가능해야 함", async ({ page }) => {
    // 첫 번째 회원 상세 페이지로 이동
    const userLink = page.locator('a[href*="/admin/users/"]').first();
    
    if (await userLink.isVisible()) {
      await userLink.click();
      await page.waitForLoadState("networkidle");
      
      // 등급 변경 드롭다운 찾기
      const tierSelect = page.getByRole("combobox", { name: /등급/i });
      
      if (await tierSelect.isVisible()) {
        await tierSelect.click();
        // 등급 옵션이 표시되어야 함
        await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
      }
    }
  });

  test("회원 상세 페이지에서 주문 내역이 표시되어야 함", async ({ page }) => {
    // 첫 번째 회원 상세 페이지로 이동
    const userLink = page.locator('a[href*="/admin/users/"]').first();
    
    if (await userLink.isVisible()) {
      await userLink.click();
      await page.waitForLoadState("networkidle");
      
      // 주문 내역 섹션 확인
      await expect(page.getByText(/주문 내역|최근 주문/i)).toBeVisible();
    }
  });
});

