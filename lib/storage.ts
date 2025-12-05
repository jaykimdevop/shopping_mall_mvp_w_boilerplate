/**
 * @file lib/storage.ts
 * @description 로컬 스토리지 유틸리티 함수
 *
 * 브라우저 로컬 스토리지를 안전하게 사용하기 위한 유틸리티입니다.
 * SSR 환경에서도 안전하게 동작합니다.
 */

/**
 * 로컬 스토리지가 사용 가능한지 확인
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * 로컬 스토리지에서 값 가져오기
 * @param key 스토리지 키
 * @param defaultValue 기본값 (값이 없거나 파싱 실패 시 반환)
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`[Storage] Failed to get item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * 로컬 스토리지에 값 저장
 * @param key 스토리지 키
 * @param value 저장할 값
 */
export function setToStorage<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to set item "${key}":`, error);
    return false;
  }
}

/**
 * 로컬 스토리지에서 값 삭제
 * @param key 스토리지 키
 */
export function removeFromStorage(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to remove item "${key}":`, error);
    return false;
  }
}

/**
 * UUID v4 생성 (세션 ID용)
 */
export function generateSessionId(): string {
  // crypto.randomUUID()가 지원되면 사용
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 폴백: 간단한 UUID 생성
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

