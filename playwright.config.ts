import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright 설정 파일
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 테스트 디렉토리
  testDir: "./tests",

  // 테스트 파일 패턴
  testMatch: "**/*.spec.ts",

  // 전체 테스트 타임아웃 (60초)
  timeout: 60000,

  // expect 타임아웃 (10초)
  expect: {
    timeout: 10000,
  },

  // 병렬 실행 설정
  fullyParallel: true,

  // CI 환경에서는 재시도 2회
  retries: process.env.CI ? 2 : 0,

  // 워커 수 설정 (로컬에서도 2개로 제한하여 서버 부하 방지)
  workers: process.env.CI ? 1 : 2,

  // 리포터 설정
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],

  // 공통 설정
  use: {
    // 기본 URL
    baseURL: "http://localhost:3000",

    // 추적 설정 (실패 시에만)
    trace: "on-first-retry",

    // 스크린샷 (실패 시에만)
    screenshot: "only-on-failure",

    // 비디오 (실패 시에만)
    video: "on-first-retry",

    // 뷰포트 설정
    viewport: { width: 1280, height: 720 },

    // 액션 타임아웃
    actionTimeout: 15000,

    // 네비게이션 타임아웃
    navigationTimeout: 60000,
  },

  // 프로젝트 설정 (Chromium만 사용)
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // 개발 서버 설정 (테스트 전 자동 시작)
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

