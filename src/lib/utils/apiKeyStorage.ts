import { browser } from '$app/environment';

const STORAGE_KEY = 'tradescout_gemini_api_key';
const ANALYSIS_COUNT_KEY = 'tradescout_analysis_count';

export const getApiKey = (): string | null => {
  if (!browser) return null;
  return localStorage.getItem(STORAGE_KEY);
};

export const setApiKey = (key: string): void => {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, key);
};

export const hasApiKey = (): boolean => {
  if (!browser) return false;
  return !!localStorage.getItem(STORAGE_KEY);
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
