const STORAGE_KEY = 'tradescout_gemini_api_key';

export const getApiKey = (): string | null => localStorage.getItem(STORAGE_KEY);

export const setApiKey = (key: string): void => localStorage.setItem(STORAGE_KEY, key);

export const hasApiKey = (): boolean => !!localStorage.getItem(STORAGE_KEY);

export const clearApiKey = (): void => localStorage.removeItem(STORAGE_KEY);
