import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Skull, Zap, Brain, TrendingUp, AlertTriangle } from 'lucide-react';

// Outrageous log messages that poke fun at AI/trading culture
const LOG_MESSAGES = [
  { text: "Initializing neural cortex... please hold for sentience", icon: Brain, type: "info" },
  { text: "BOOT_SEQUENCE: Teaching AI the meaning of 'HODL'", icon: Zap, type: "info" },
  { text: "Consulting the blockchain spirits for guidance", icon: Skull, type: "warning" },
  { text: "OCR_ENGINE: Squinting really hard at those candles", icon: Terminal, type: "info" },
  { text: "Detecting diamond hands vs paper hands energy", icon: TrendingUp, type: "success" },
  { text: "MACRO_SCANNER: Asking my wife's boyfriend for alpha", icon: AlertTriangle, type: "warning" },
  { text: "Fibonacci sequence achieved enlightenment. It's beautiful", icon: Brain, type: "success" },
  { text: "RISK_ENGINE: Calculating exactly how rekt you might get", icon: Skull, type: "error" },
  { text: "Searching for the mythical 'support level'... still looking", icon: TrendingUp, type: "info" },
  { text: "AI is having an existential crisis about your trade", icon: Brain, type: "warning" },
  { text: "Extracting pure, uncut hopium from video frames", icon: Zap, type: "success" },
  { text: "Neural net is fighting with technical analysis. TA is losing", icon: Terminal, type: "info" },
  { text: "Summoning the ghost of trades past... it's disappointed", icon: Skull, type: "warning" },
  { text: "LEGAL_NOTICE: This isn't financial advice. Trust me bro", icon: AlertTriangle, type: "error" },
  { text: "Scanning for 'trust me bro' confidence levels... VERY HIGH", icon: TrendingUp, type: "success" },
  { text: "Alpha extraction: 69% complete (nice)", icon: Zap, type: "success" },
  { text: "Checking if the CEO is following you on Twitter", icon: Terminal, type: "info" },
  { text: "COPIUM_CONVERTER: Transmuting losses into 'learning experiences'", icon: Brain, type: "warning" },
  { text: "Final synthesis: Converting copium to hopium... SUCCESS", icon: Zap, type: "success" },
];

// Progress stages synced with log count
const PROGRESS_STAGES = [3, 7, 14, 23, 36, 51, 69, 83, 91, 97];

interface LogEntry {
  id: number;
  text: string;
  icon: React.ElementType;
  type: string;
  timestamp: string;
}

export const AnalysisLogStream: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Generate timestamp
  const getTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  };

  // Add new log entry every 3-5 seconds
  useEffect(() => {
    if (currentLogIndex >= LOG_MESSAGES.length) return;

    const delay = 3000 + Math.random() * 2000; // 3-5 seconds
    const timer = setTimeout(() => {
      const message = LOG_MESSAGES[currentLogIndex];
      const newLog: LogEntry = {
        id: Date.now(),
        text: message.text,
        icon: message.icon,
        type: message.type,
        timestamp: getTimestamp(),
      };

      setLogs(prev => [...prev, newLog]);
      setProgress(PROGRESS_STAGES[Math.min(currentLogIndex, PROGRESS_STAGES.length - 1)]);
      setCurrentLogIndex(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentLogIndex]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Rapid elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 47); // Update roughly every 47ms for that rapid counter feel
    return () => clearInterval(interval);
  }, []);

  // Add initial log on mount
  useEffect(() => {
    const initialLog: LogEntry = {
      id: Date.now(),
      text: "SYSTEM_BOOT: TradeScout Neural Engine v4.20.69 initializing",
      icon: Terminal,
      type: "info",
      timestamp: getTimestamp(),
    };
    setLogs([initialLog]);
    setProgress(PROGRESS_STAGES[0]);
    setCurrentLogIndex(1);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-cyan-400';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'error': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-cyan-500/10 border-cyan-500/30';
    }
  };

  return (
    <div className="h-[500px] flex flex-col border border-cyan-900/30 bg-[#030712] relative overflow-hidden">
      {/* CRT Scanline Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
        }}
      />

      {/* Moving Scanline */}
      <div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none z-30"
        style={{
          animation: 'scanline 4s linear infinite',
        }}
      />

      {/* Dot Pattern Background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNiwgMTgyLCAyMTIsIDAuMSkiLz48L3N2Zz4=")`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 border-b border-cyan-900/50 bg-[#0a0f1a]/90 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Terminal Icon with Glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 blur-md animate-pulse" />
              <div className="relative w-8 h-8 bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                <Terminal size={16} className="text-cyan-400" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-cyan-400 animate-pulse" />
                Neural Analysis Stream
              </h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                PID: {Math.floor(Math.random() * 9000) + 1000} // PRIORITY: MAXIMUM
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-600 uppercase">Status:</span>
            <span className="text-[10px] font-mono text-emerald-400 uppercase animate-pulse">
              PROCESSING
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Analysis Progress
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {progress}%
            </span>
          </div>

          {/* Progress Track */}
          <div className="h-2 bg-slate-900 border border-slate-700/50 relative overflow-hidden">
            {/* Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-500 transition-all duration-700 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-cyan-400/50 blur-sm" />

              {/* Animated Stripes */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 8px)',
                  animation: 'progressStripes 1s linear infinite',
                }}
              />
            </div>

            {/* Edge Glow */}
            <div
              className="absolute top-0 bottom-0 w-4 bg-gradient-to-r from-cyan-400 to-transparent opacity-80 blur-sm transition-all duration-700"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>
        </div>
      </div>

      {/* Log Stream Container */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 relative z-10 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-cyan-900/50"
      >
        {logs.map((log, index) => {
          const IconComponent = log.icon;
          const isLatest = index === logs.length - 1;

          return (
            <div
              key={log.id}
              className={`
                flex items-start gap-3 p-2 border-l-2
                ${getTypeBg(log.type)}
                ${isLatest ? 'animate-fadeInSlide' : ''}
                transition-all duration-300
              `}
              style={{
                borderLeftColor: log.type === 'success' ? '#10b981' :
                                 log.type === 'warning' ? '#eab308' :
                                 log.type === 'error' ? '#ef4444' : '#06b6d4',
              }}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 ${getTypeColor(log.type)}`}>
                <IconComponent size={14} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-slate-600">
                    [{log.timestamp}]
                  </span>
                </div>
                <p className={`text-xs font-mono ${getTypeColor(log.type)} leading-relaxed`}>
                  {log.text}
                  {isLatest && (
                    <span className="inline-flex ml-1">
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}

        {/* Blinking Cursor at Bottom */}
        <div className="flex items-center gap-2 text-cyan-500/50 pt-2">
          <span className="text-xs font-mono">{'>'}</span>
          <span className="w-2 h-4 bg-cyan-400 animate-blink" />
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="relative z-10 border-t border-cyan-900/50 bg-[#0a0f1a]/90 px-3 py-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
          <div className="flex items-center gap-4">
            <span>Logs: {logs.length}/{LOG_MESSAGES.length + 1}</span>
            <span className="text-cyan-600">|</span>
            <span>Elapsed: <span className="text-cyan-400 tabular-nums">{(elapsedTime / 1000).toFixed(2)}s</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Neural Link: Active</span>
          </div>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }

        @keyframes progressStripes {
          0% { background-position: 0 0; }
          100% { background-position: 16px 0; }
        }

        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .animate-fadeInSlide {
          animation: fadeInSlide 0.3s ease-out forwards;
        }

        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
};
