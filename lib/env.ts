/**
 * 환경변수 접근 유틸리티
 * 보안을 위해 환경변수는 이 파일을 통해서만 접근합니다.
 */

/**
 * Gemini API 키를 안전하게 가져옵니다.
 * @returns Gemini API 키 또는 undefined
 * @throws 환경변수가 필수인 경우 에러 발생
 */
export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  
  return apiKey;
}

/**
 * Gemini API 키를 안전하게 가져옵니다 (선택적).
 * @returns Gemini API 키 또는 undefined
 */
export function getGeminiApiKeyOptional(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}

/**
 * 서버 사이드에서만 사용 가능한 환경변수인지 확인합니다.
 * @param key 환경변수 키
 * @returns 서버 사이드 전용 여부
 */
export function isServerOnlyEnv(key: string): boolean {
  // NEXT_PUBLIC_ 접두사가 없으면 서버 사이드 전용
  return !key.startsWith('NEXT_PUBLIC_');
}

/**
 * 환경변수 존재 여부를 확인합니다.
 * @param key 환경변수 키
 * @returns 존재 여부
 */
export function hasEnv(key: string): boolean {
  return !!process.env[key];
}

/**
 * 환경변수를 안전하게 가져옵니다.
 * @param key 환경변수 키
 * @param defaultValue 기본값
 * @returns 환경변수 값 또는 기본값
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

/**
 * 필수 환경변수를 가져옵니다.
 * @param key 환경변수 키
 * @returns 환경변수 값
 * @throws 환경변수가 없으면 에러 발생
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  
  if (!value) {
    throw new Error(`필수 환경변수 ${key}가 설정되지 않았습니다.`);
  }
  
  return value;
}

