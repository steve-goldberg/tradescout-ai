import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const STORAGE_KEY = 'tradescout_gemini_api_key';
const ANALYSIS_COUNT_KEY = 'tradescout_analysis_count';

/**
 * Key supplied by the deployment (Railway sets PUBLIC_GEMINI_API_KEY).
 * Empty locally by default, which routes users to the ApiKeyModal.
 */
const getEnvApiKey = (): string | null => {
  const key = env.PUBLIC_GEMINI_API_KEY?.trim();
  return key ? key : null;
};

/** Key the user pasted into the ApiKeyModal. */
const getStoredApiKey = (): string | null => {
  if (!browser) return null;
  return localStorage.getItem(STORAGE_KEY) || null;
};

/** Deployment key first, then the browser-stored key. */
export const getApiKey = (): string | null => {
  return getEnvApiKey() ?? getStoredApiKey();
};

export const setApiKey = (key: string): void => {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, key);
};

export const hasApiKey = (): boolean => {
  return getApiKey() !== null;
};

export const clearApiKey = (): void => {
  if (!browser) return;
  localStorage.removeItem(STORAGE_KEY);
};

export const getAnalysisCount = (): number => {
  if (!browser) return 0;
  const count = localStorage.getItem(ANALYSIS_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
};

export const incrementAnalysisCount = (): number => {
  if (!browser) return 0;
  const newCount = getAnalysisCount() + 1;
  localStorage.setItem(ANALYSIS_COUNT_KEY, newCount.toString());
  return newCount;
};
