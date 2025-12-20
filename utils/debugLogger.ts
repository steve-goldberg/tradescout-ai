type LogEntry = {
  timestamp: string;
  type: 'gemini' | 'chart-img-request' | 'chart-img-response' | 'error';
  label: string;
  data: unknown;
};

type ImageEntry = {
  timestamp: string;
  ticker: string;
  blob: Blob;
};

let logs: LogEntry[] = [];
let images: ImageEntry[] = [];

const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export const debugLog = (type: LogEntry['type'], label: string, data: unknown) => {
  if (!DEBUG) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type,
    label,
    data
  };
  logs.push(entry);
  console.log(`[${type}] ${label}`, data);
};

/**
 * Store a chart image blob for later export
 */
export const storeChartImage = (ticker: string, blob: Blob) => {
  if (!DEBUG) return;

  images.push({
    timestamp: new Date().toISOString(),
    ticker: ticker.replace(/[^a-zA-Z0-9]/g, '_'),
    blob
  });
  console.log(`[debug] Stored chart image for ${ticker} (${images.length} total)`);
};

/**
 * Download a single file
 */
const downloadFile = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

/**
 * Export JSON logs
 */
export const exportLogs = () => {
  if (!DEBUG || logs.length === 0) return;

  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, `tradescout-debug-${Date.now()}.json`);
  URL.revokeObjectURL(url);
  logs = [];
};

/**
 * Export all stored chart images
 */
export const exportImages = () => {
  if (!DEBUG || images.length === 0) {
    console.log('[debug] No images to export');
    return;
  }

  const sessionId = Date.now();

  images.forEach((img, idx) => {
    const url = URL.createObjectURL(img.blob);
    const filename = `chart-${sessionId}-${idx + 1}-${img.ticker}.png`;
    downloadFile(url, filename);
    URL.revokeObjectURL(url);
  });

  console.log(`[debug] Exported ${images.length} chart images`);
  images = [];
};

/**
 * Export everything (logs + images)
 */
export const exportAll = () => {
  exportLogs();
  exportImages();
};

export const clearLogs = () => {
  logs = [];
  images = [];
};
