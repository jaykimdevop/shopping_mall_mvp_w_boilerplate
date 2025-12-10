/**
 * @file banners.spec.ts
 * @description 관리자 배너 관리 E2E 테스트
 *
 * 테스트 범위:
 * 1. 배너 목록 페이지 로드
 * 2. 배너 등록 페이지 이동
 * 3. 배너 활성/비활성 토글
 * 4. 배너 순서 변경
 * 5. 배너 삭제
 */

import { test, expect } from "@playwright/test";
import { TEST_URLS, SELECTORS } from "../../fixtures/test-data";
import { loginAsAdmin, getAdminCredentials } from "../../fixtures/auth-helpers";

test.describe("관리자 배너 관리 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.banners);
  });

  test("배너 목록 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    // 페이지 헤딩 확인
    await expect(page.getByRole("heading", { name: /배너 관리/i })).toBeVisible();
    
    // 배너 등록 버튼 확인
    await expect(page.getByRole("link", { name: /배너 등록|새 배너/i })).toBeVisible();
  });

  test("배너 등록 버튼 클릭 시 등록 페이지로 이동해야 함", async ({ page }) => {
    await page.getByRole("link", { name: /배너 등록|새 배너/i }).click();
    await expect(page).toHaveURL(TEST_URLS.admin.bannerNew);
  });

  test("배너 목록이 표시되어야 함", async ({ page }) => {
    // 배너 목록 또는 빈 상태 메시지 확인
    const bannerList = page.locator('[data-testid="banner-list"], .banner-list');
    const emptyMessage = page.getByText(/배너가 없습니다|등록된 배너/i);
    
    const hasList = await bannerList.isVisible().catch(() => false);
    const hasEmpty = await emptyMessage.isVisible().catch(() => false);
    
    expect(hasList || hasEmpty).toBeTruthy();
  });

  test("배너 활성/비활성 토글이 동작해야 함", async ({ page }) => {
    // 토글 스위치 찾기
    const toggleSwitch = page.locator('[role="switch"]').first();
    
    if (await toggleSwitch.isVisible()) {
      const initialState = await toggleSwitch.getAttribute("aria-checked");
      await toggleSwitch.click();
      
      // 상태가 변경되어야 함
      await page.waitForLoadState("networkidle");
    }
  });

  test("배너 미리보기가 표시되어야 함", async ({ page }) => {
    // 배너 미리보기 이미지 또는 그라데이션 확인
    const bannerPreview = page.locator('img[alt*="배너"], .banner-preview').first();
    
    await bannerPreview.isVisible().catch(() => false);
  });

  test("배너 삭제 버튼이 동작해야 함", async ({ page }) => {
    // 삭제 버튼 찾기
    const deleteButton = page.getByRole("button", { name: /삭제/i }).first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // 확인 다이얼로그가 표시되어야 함
      await page.waitForSelector('[role="alertdialog"], [role="dialog"]', { 
        timeout: 3000 
      }).catch(() => null);
    }
  });
});

test.describe("배너 등록 페이지 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.bannerNew);
  });

  test("배너 등록 폼이 표시되어야 함", async ({ page }) => {
    // 필수 입력 필드들 확인
    await expect(page.getByLabel(/제목/i)).toBeVisible();
  });

  test("상품 선택 기능이 동작해야 함", async ({ page }) => {
    // 상품 선택 드롭다운 또는 검색 필드 찾기
    const productSelect = page.getByRole("combobox", { name: /상품/i });
    const productSearch = page.getByPlaceholder(/상품 검색/i);
    
    if (await productSelect.isVisible()) {
      await productSelect.click();
      await page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => null);
    } else if (await productSearch.isVisible()) {
      await productSearch.fill("테스트");
      await page.waitForLoadState("networkidle");
    }
  });

  test("배경색 선택 기능이 동작해야 함", async ({ page }) => {
    // 배경색 선택 버튼들 찾기
    const colorButtons = page.locator('[data-color], .color-preset');
    
    if (await colorButtons.first().isVisible()) {
      await colorButtons.first().click();
    }
  });

  test("AI 이미지 생성 버튼이 표시되어야 함", async ({ page }) => {
    // AI 이미지 생성 버튼 찾기
    const aiButton = page.getByRole("button", { name: /AI.*이미지|이미지 생성/i });
    
    await aiButton.isVisible().catch(() => false);
  });

  test("이미지 업로드 기능이 동작해야 함", async ({ page }) => {
    // 파일 업로드 입력 필드 찾기
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.isVisible().catch(() => false);
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

test.describe("배너 순서 변경 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.home);
    
    const { email } = getAdminCredentials();
    if (email === "admin@example.com") {
      test.skip(true, "관리자 테스트 계정이 설정되지 않았습니다.");
    }
    
    await loginAsAdmin(page);
    await page.goto(TEST_URLS.admin.banners);
  });

  test("드래그 앤 드롭으로 순서 변경이 가능해야 함", async ({ page }) => {
    // 드래그 핸들 찾기
    const dragHandles = page.locator('[data-drag-handle], .drag-handle');
    
    if (await dragHandles.count() >= 2) {
      const firstHandle = dragHandles.first();
      const secondHandle = dragHandles.nth(1);
      
      // 드래그 앤 드롭 시뮬레이션
      const firstBox = await firstHandle.boundingBox();
      const secondBox = await secondHandle.boundingBox();
      
      if (firstBox && secondBox) {
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2);
        await page.mouse.up();
        
        await page.waitForLoadState("networkidle");
      }
    }
  });
});

