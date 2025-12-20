type LogEntry = {
  timestamp: string;
  type: 'gemini' | 'chart-img-request' | 'chart-img-response' | 'error';
  label: string;
  data: unknown;
};

let logs: LogEntry[] = [];

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

export const exportLogs = () => {
  if (!DEBUG || logs.length === 0) return;

  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tradescout-debug-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  logs = [];
};

export const clearLogs = () => {
  logs = [];
};
