import React, { useState } from 'react';
import { VideoUpload } from './components/VideoUpload';
import { TradeCard } from './components/TradeCard';
import { MarketAnalysisCard } from './components/MarketAnalysisCard';
import { analyzeVideoForTrades } from './services/geminiService';
import { AnalysisResult } from './types';
import { Cpu, Activity, ShieldAlert, Radio } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputSelected = async (input: string | File) => {
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      const data = await analyzeVideoForTrades(input);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "ANALYSIS_FAILED: CHECK_CONNECTION_AND_KEY");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col">
      
      {/* Top Protocol Bar */}
      <div className="border-b border-slate-800 bg-[#020617] text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 py-1 px-4 flex justify-between items-center">
        <span>Secure Connection // Encrypted</span>
        <span>Gemini_3_Pro_Preview // Build v2.5.0</span>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#050a15]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500 flex items-center justify-center">
                <Activity size={24} className="text-cyan-400" />
             </div>
             <div>
               <h1 className="font-bold text-2xl tracking-tighter text-white font-mono uppercase">
                 TradeScout<span className="text-cyan-400">_Terminal</span>
               </h1>
               <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 to-transparent mt-1"></div>
             </div>
          </div>

          <div className="flex gap-6 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase hidden md:flex">
            <span className="flex items-center gap-2 hover:text-cyan-400 cursor-default transition-colors">
              <Cpu size={14} /> AI_Core: Active
            </span>
            <span className="flex items-center gap-2 hover:text-red-400 cursor-default transition-colors">
              <ShieldAlert size={14} /> Risk_Engine: Online
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Command Center */}
          <div className="xl:col-span-4 space-y-8 sticky top-32">
            
            <div className="space-y-2 mb-8">
               <h2 className="text-4xl font-mono font-bold text-white tracking-tighter uppercase leading-none">
                 Market<br/><span className="text-slate-600">Intelligence</span>
               </h2>
               <p className="text-slate-400 font-mono text-sm border-l-2 border-cyan-500 pl-3 py-1">
                 Ingest video data. Extract alpha. Execute.
               </p>
            </div>

            <div className="bg-[#0b1121] border border-slate-800 p-1 shadow-2xl relative group">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-500"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-500"></div>

              <div className="bg-[#050a15] border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                     <Radio size={12} className="animate-pulse" /> Signal Input
                   </h3>
                   <div className="flex gap-1">
                     <div className="w-1 h-1 bg-slate-600"></div>
                     <div className="w-1 h-1 bg-slate-600"></div>
                     <div className="w-1 h-1 bg-slate-600"></div>
                   </div>
                </div>
                
                <VideoUpload onInputSelected={handleInputSelected} isLoading={isLoading} />
                
                {error && (
                  <div className="mt-4 p-4 bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-mono">
                    <span className="font-bold block mb-1">>> ERROR_LOG:</span>
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Stats / Filler for look */}
            <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none select-none">
               <div className="border border-slate-800 p-4 bg-[#0b1121]">
                  <div className="text-[10px] uppercase text-slate-500 mb-1">Sys_Load</div>
                  <div className="text-xl font-mono text-cyan-500/50">42%</div>
               </div>
               <div className="border border-slate-800 p-4 bg-[#0b1121]">
                  <div className="text-[10px] uppercase text-slate-500 mb-1">Net_Lat</div>
                  <div className="text-xl font-mono text-cyan-500/50">12ms</div>
               </div>
            </div>

          </div>

          {/* Right Column: Output Feed */}
          <div className="xl:col-span-8">
            {!result && !isLoading && (
              <div className="h-[500px] flex flex-col items-center justify-center text-slate-700 border border-slate-800 border-dashed bg-[#0b1121]/30">
                <Activity size={64} className="mb-6 opacity-20" />
                <p className="text-2xl font-mono font-bold opacity-30 tracking-widest uppercase">Awaiting Data Stream</p>
                <div className="mt-4 flex gap-2">
                   <span className="w-2 h-2 bg-slate-800 animate-pulse"></span>
                   <span className="w-2 h-2 bg-slate-800 animate-pulse delay-75"></span>
                   <span className="w-2 h-2 bg-slate-800 animate-pulse delay-150"></span>
                </div>
              </div>
            )}

            {isLoading && (
               <div className="h-[500px] flex flex-col items-center justify-center border border-cyan-900/30 bg-cyan-950/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNiwgMTgyLCAyMTIsIDAuMSkiLz48L3N2Zz4=')] opacity-50"></div>
                  <Cpu size={64} className="mb-6 text-cyan-500 animate-bounce" />
                  <p className="text-xl font-mono font-bold text-cyan-400 tracking-widest uppercase animate-pulse">Processing_Neural_Net</p>
                  <p className="text-xs font-mono text-cyan-600 mt-2">
                    Analyzing visual patterns & audio stream...
                  </p>
               </div>
            )}

            {result && result.marketAnalysis && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mb-8">
                 <MarketAnalysisCard data={result.marketAnalysis} />
              </div>
            )}

            {result && result.trades.length === 0 && !isLoading && (
              <div className="p-12 bg-[#0b1121] border border-slate-800 text-center">
                <p className="text-slate-400 font-mono text-lg">>> NULL_RESULT: No executable setups identified.</p>
              </div>
            )}

            {result && result.trades.length > 0 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500"></span>
                    Extracted_Alpha
                  </h2>
                  <span className="px-3 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono">
                    COUNT: {result.trades.length}
                  </span>
                </div>
                
                <div className="grid gap-8">
                  {result.trades.map((idea, index) => (
                    <TradeCard key={index} idea={idea} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;