import React, { useState } from 'react';
import { VideoUpload } from './components/VideoUpload';
import { TradeCard } from './components/TradeCard';
import { MarketAnalysisCard } from './components/MarketAnalysisCard';
import { VideoMetadataCard } from './components/VideoMetadataCard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AnalysisLogStream } from './components/AnalysisLogStream';
import { analyzeVideoForTrades } from './services/geminiService';
import { generateChartsForTrades } from './services/chartImgService';
import { enrichTradesWithSymbols } from './services/chartSymbolService';
import { fetchVideoMetadata } from './services/supadataService';
import { getApiKey, setApiKey, hasApiKey, getAnalysisCount, incrementAnalysisCount } from './utils/apiKeyStorage';
import { exportLogs } from './utils/debugLogger';
import { AnalysisResult, VideoMetadata } from './types';
import { Cpu, Activity, ShieldAlert, Radio } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [pendingInput, setPendingInput] = useState<string | File | null>(null);
  const [analysisCount, setAnalysisCount] = useState(() => getAnalysisCount());
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);

  const runAnalysis = async (input: string | File, apiKey: string, metadataPromise: Promise<VideoMetadata | null>) => {
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      // Start Gemini analysis immediately (don't wait for metadata)
      const data = await analyzeVideoForTrades(input, apiKey);

      // Enrich trades with TradingView symbols using Gemini Flash
      const tradesWithSymbols = await enrichTradesWithSymbols(data.trades, apiKey);

      // Now await metadata (probably already done by now)
      const metadata = await metadataPromise;

      // Add video publish date for Chart-IMG vertical line (GitHub #1)
      const tradesWithMetadata = tradesWithSymbols.map(trade => ({
        ...trade,
        videoPublishDate: metadata?.createdAt ?? undefined
      }));

      // Generate chart images (parallel fetch)
      const tradesWithCharts = await generateChartsForTrades(tradesWithMetadata);

      setResult({
        ...data,
        trades: tradesWithCharts
      });
      setAnalysisCount(incrementAnalysisCount());
    } catch (err: any) {
      setError(err.message || "ANALYSIS_FAILED: CHECK_CONNECTION_AND_KEY");
    } finally {
      setIsLoading(false);
      exportLogs();
    }
  };

  const handleInputSelected = async (input: string | File) => {
    // Reset states for new analysis
    setVideoMetadata(null);
    setResult(null);
    setError(null);

    // Start metadata fetch in parallel (fire-and-forget for UI, pass Promise for charts)
    let metadataPromise: Promise<VideoMetadata | null> = Promise.resolve(null);
    if (typeof input === 'string') {
      metadataPromise = fetchVideoMetadata(input);
      // Fire-and-forget: update UI as soon as metadata arrives
      metadataPromise.then(m => m && setVideoMetadata(m));
    }

    if (hasApiKey()) {
      const apiKey = getApiKey()!;
      await runAnalysis(input, apiKey, metadataPromise);
    } else {
      setPendingInput(input);
      setShowApiKeyModal(true);
    }
  };

  const handleApiKeySubmit = async (apiKey: string) => {
    setApiKey(apiKey);
    setShowApiKeyModal(false);

    if (pendingInput) {
      // Metadata already fetched while modal was open, wrap in resolved Promise
      await runAnalysis(pendingInput, apiKey, Promise.resolve(videoMetadata));
      setPendingInput(null);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col">
      
      {/* Top Protocol Bar */}
      <div className="border-b border-slate-800 bg-[#020617] text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 py-1.5 px-4 flex justify-between items-center">
        <span className="flex items-center gap-2">
          <span className="relative flex items-center justify-center">
            <span className="absolute w-2 h-2 bg-emerald-400/40 rounded-full blur-sm animate-pulse" />
            <span className="relative w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          </span>
          Secure Connection // Encrypted
        </span>
        <span className="flex items-center gap-3">
          <span className={hasApiKey() ? 'text-emerald-500' : 'text-slate-600'}>
            {hasApiKey() ? '● API Key Active' : '○ No API Key'}
          </span>
          <span className="text-slate-600">//</span>
          <span>Videos Analyzed: {analysisCount}</span>
        </span>
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
                 TradeScout <span className="text-cyan-400">Terminal</span>
               </h1>
               <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 to-transparent mt-1"></div>
             </div>
          </div>

          <div className="flex gap-6 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase hidden md:flex">
            <span className="flex items-center gap-2 hover:text-cyan-400 cursor-default transition-colors">
              <Cpu size={14} /> AI Core: Active
            </span>
            <span className="flex items-center gap-2 hover:text-red-400 cursor-default transition-colors">
              <ShieldAlert size={14} /> Risk Engine: Online
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        <div className="flex flex-col items-center gap-10">

          {/* Header Section - Centered */}
          <div className="text-center space-y-4 max-w-2xl">
            <h2 className="text-4xl font-mono font-bold text-white tracking-tighter uppercase leading-none">
              Market <span className="text-slate-600">Intelligence</span>
            </h2>
            <p className="text-slate-400 font-mono text-sm">
              Ingest video data. Extract alpha. Execute.
            </p>
          </div>

          {/* Signal Input - Centered */}
          <div className="w-full max-w-2xl">
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
                    <span className="font-bold block mb-1">{'>>'} ERROR_LOG:</span>
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Output Feed - Below */}
          <div className="w-full max-w-4xl">
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

            {/* Video Metadata Card - Shows immediately on URL submit */}
            {videoMetadata && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                <VideoMetadataCard metadata={videoMetadata} />
              </div>
            )}

            {isLoading && <AnalysisLogStream />}

            {result && result.marketAnalysis && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mb-8">
                 <MarketAnalysisCard data={result.marketAnalysis} />
              </div>
            )}

            {result && result.trades.length === 0 && !isLoading && (
              <div className="p-12 bg-[#0b1121] border border-slate-800 text-center">
                <p className="text-slate-400 font-mono text-lg">{'>>'} NULL_RESULT: No executable setups identified.</p>
              </div>
            )}

            {result && result.trades.length > 0 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500"></span>
                    Extracted Alpha
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

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          setPendingInput(null);
        }}
        onSubmit={handleApiKeySubmit}
      />
    </div>
  );
};

export default App;