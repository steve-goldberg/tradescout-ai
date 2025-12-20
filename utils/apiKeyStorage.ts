const STORAGE_KEY = 'tradescout_gemini_api_key';
const ANALYSIS_COUNT_KEY = 'tradescout_analysis_count';

export const getApiKey = (): string | null => localStorage.getItem(STORAGE_KEY);

export const setApiKey = (key: string): void => localStorage.setItem(STORAGE_KEY, key);

export const hasApiKey = (): boolean => !!localStorage.getItem(STORAGE_KEY);

export const clearApiKey = (): void => localStorage.removeItem(STORAGE_KEY);

export const getAnalysisCount = (): number => {
  const count = localStorage.getItem(ANALYSIS_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
};

export const incrementAnalysisCount = (): number => {
  const newCount = getAnalysisCount() + 1;
  localStorage.setItem(ANALYSIS_COUNT_KEY, newCount.toString());
  return newCount;
};
