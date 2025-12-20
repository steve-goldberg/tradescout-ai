import React, { useState } from 'react';
import { Youtube, Terminal, ChevronRight, Loader2, FileVideo } from 'lucide-react';

interface VideoInputProps {
  onInputSelected: (input: string | File) => void;
  isLoading: boolean;
}

export const VideoUpload: React.FC<VideoInputProps> = ({ onInputSelected, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onInputSelected(url);
    }
  };

  return (
    <div className="w-full space-y-4">

      {/* Mode Switcher */}
      <div className="flex gap-2">
        {/* URL_Stream Tab - Active */}
        <button
          className="flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all bg-cyan-950/30 text-cyan-400 border-cyan-500/50"
        >
          <span className="flex items-center justify-center gap-2">
            <Youtube size={14} /> URL Stream
          </span>
        </button>

        {/* File_Uplink Tab - Disabled */}
        <button
          disabled
          className="flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider border bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <FileVideo size={14} /> File Uplink
          </span>
        </button>
      </div>

      <div className={`
        relative border-2 transition-all duration-300
        ${isFocused
          ? 'bg-black border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
          : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
      `}>

        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 border-b border-slate-700">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
          <div className="ml-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Input Stream
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-center p-1">
          <div className="pl-4 pr-3 text-cyan-500 animate-pulse">
            <ChevronRight size={20} strokeWidth={3} />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="ENTER_SOURCE_URL [YOUTUBE]..."
            className="flex-1 bg-transparent border-none outline-none text-cyan-100 placeholder-slate-600 h-14 text-lg font-mono tracking-tight"
            disabled={isLoading}
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className={`
              mr-2 px-6 h-10 font-bold font-mono text-sm uppercase tracking-wider transition-all duration-200 border
              ${!url.trim() || isLoading
                ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                : 'bg-cyan-900/20 text-cyan-400 border-cyan-500 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'}
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> PROCESSING
              </span>
            ) : (
              <span>EXECUTE</span>
            )}
          </button>
        </form>
      </div>

      <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1">
        <span>System: <span className="text-emerald-400 animate-pulse">Ready</span></span>
        <span className="flex items-center gap-1">
           <Terminal size={10} />
           Protocol: Direct Stream Analysis
        </span>
      </div>
    </div>
  );
};
