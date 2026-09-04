<script lang="ts">
  import VideoUpload from '$lib/components/VideoUpload.svelte';
  import TradeCard from '$lib/components/TradeCard.svelte';
  import MarketAnalysisCard from '$lib/components/MarketAnalysisCard.svelte';
  import VideoMetadataCard from '$lib/components/VideoMetadataCard.svelte';
  import ApiKeyModal from '$lib/components/ApiKeyModal.svelte';
  import AnalysisLogStream from '$lib/components/AnalysisLogStream.svelte';
  import { analyzeVideoForTrades } from '$lib/services/geminiService';
  import { generateChartsForTrades } from '$lib/services/chartImgService';
  import { enrichTradesWithSymbols } from '$lib/services/chartSymbolService';
  import { fetchVideoMetadata } from '$lib/services/supadataService';
  import { getApiKey, setApiKey, hasApiKey, getAnalysisCount, incrementAnalysisCount } from '$lib/utils/apiKeyStorage';
  import { exportLogs } from '$lib/utils/debugLogger';
  import type { AnalysisResult, VideoMetadata } from '$lib/types';
  import { Cpu, Activity, ShieldAlert, Radio } from 'lucide-svelte';

  let result = $state<AnalysisResult | null>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let showApiKeyModal = $state(false);
  let pendingInput = $state<string | File | null>(null);
  let analysisCount = $state(getAnalysisCount());
  let videoMetadata = $state<VideoMetadata | null>(null);
  // Reactive mirror of hasApiKey(): localStorage is not tracked by runes, so the
  // badge only updates when this state changes (set on modal submit).
  let hasKey = $state(hasApiKey());

  // In-flight Supadata fetch for the current submission. Runs in parallel with
  // Gemini; kept here so a key entered via the modal can still reuse it.
  let metadataPromise: Promise<VideoMetadata | null> = Promise.resolve(null);

  async function runAnalysis(input: string | File, apiKey: string, pendingMetadata: Promise<VideoMetadata | null>) {
    result = null;
    error = null;
    isLoading = true;

    try {
      // Start Gemini analysis immediately (don't wait for metadata)
      const data = await analyzeVideoForTrades(input, apiKey);

      // Enrich trades with TradingView symbols using Gemini Flash
      const tradesWithSymbols = await enrichTradesWithSymbols(data.trades, apiKey);

      // Now await metadata (probably already done by now)
      const metadata = await pendingMetadata;

      // Add video publish date for Chart-IMG vertical line (GitHub #1)
      const tradesWithMetadata = tradesWithSymbols.map(trade => ({
        ...trade,
        videoPublishDate: metadata?.createdAt ?? undefined
      }));

      // Generate chart images (parallel fetch)
      const tradesWithCharts = await generateChartsForTrades(tradesWithMetadata);

      result = {
        ...data,
        trades: tradesWithCharts
      };
      analysisCount = incrementAnalysisCount();
    } catch (err: unknown) {
      error = (err as Error).message || "ANALYSIS_FAILED: CHECK_CONNECTION_AND_KEY";
    } finally {
      isLoading = false;
      exportLogs();
    }
  }

  async function handleInputSelected(input: string | File) {
    // Reset states for new analysis
    videoMetadata = null;
    result = null;
    error = null;

    // Start metadata fetch in parallel (fire-and-forget for UI, pass Promise for charts)
    metadataPromise = Promise.resolve(null);
    if (typeof input === 'string') {
      const fetching = fetchVideoMetadata(input);
      metadataPromise = fetching;
      // Update UI as soon as metadata arrives, unless a newer submission superseded it
      fetching.then(m => {
        if (m && metadataPromise === fetching) videoMetadata = m;
      });
    }

    const apiKey = getApiKey();
    if (apiKey) {
      await runAnalysis(input, apiKey, metadataPromise);
    } else {
      pendingInput = input;
      showApiKeyModal = true;
    }
  }

  async function handleApiKeySubmit(apiKey: string) {
    setApiKey(apiKey);
    hasKey = true;
    showApiKeyModal = false;

    if (pendingInput) {
      // Metadata fetch started before the modal opened; reuse its promise
      await runAnalysis(pendingInput, apiKey, metadataPromise);
      pendingInput = null;
    }
  }

  function handleModalClose() {
    showApiKeyModal = false;
    pendingInput = null;
  }
</script>

<div class="min-h-screen text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col">

  <!-- Top Protocol Bar -->
  <div class="border-b border-slate-800 bg-[#020617] text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 py-1.5 px-4 flex justify-between items-center">
    <span class="flex items-center gap-2">
      <span class="relative flex items-center justify-center">
        <span class="absolute w-2 h-2 bg-emerald-400/40 rounded-full blur-sm animate-pulse"></span>
        <span class="relative w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
      </span>
      Secure Connection // Encrypted
    </span>
    <span class="flex items-center gap-3">
      <span class={hasKey ? 'text-emerald-500' : 'text-slate-600'}>
        {hasKey ? '● API Key Active' : '○ No API Key'}
      </span>
      <span class="text-slate-600">//</span>
      <span>Videos Analyzed: {analysisCount}</span>
    </span>
  </div>

  <!-- Header -->
  <header class="border-b border-slate-800 bg-[#050a15]/90 backdrop-blur-sm sticky top-0 z-50">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-cyan-500/10 border border-cyan-500 flex items-center justify-center">
          <Activity size={24} class="text-cyan-400" />
        </div>
        <div>
          <h1 class="font-bold text-2xl tracking-tighter text-white font-mono uppercase">
            TradeScout <span class="text-cyan-400">Terminal</span>
          </h1>
          <div class="h-0.5 w-full bg-gradient-to-r from-cyan-500 to-transparent mt-1"></div>
        </div>
      </div>

      <div class="hidden md:flex gap-6 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
        <span class="flex items-center gap-2 hover:text-cyan-400 cursor-default transition-colors">
          <Cpu size={14} /> AI Core: Active
        </span>
        <span class="flex items-center gap-2 hover:text-red-400 cursor-default transition-colors">
          <ShieldAlert size={14} /> Risk Engine: Online
        </span>
      </div>
    </div>
  </header>

  <main class="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

    <div class="flex flex-col items-center gap-10">

      <!-- Header Section - Centered -->
      <div class="text-center space-y-4 max-w-2xl">
        <h2 class="text-4xl font-mono font-bold text-white tracking-tighter uppercase leading-none">
          Market <span class="text-slate-600">Intelligence</span>
        </h2>
        <p class="text-slate-400 font-mono text-sm">
          Ingest video data. Extract alpha. Execute.
        </p>
      </div>

      <!-- Signal Input - Centered -->
      <div class="w-full max-w-2xl">
        <div class="bg-[#0b1121] border border-slate-800 p-1 shadow-2xl relative group">
          <!-- Corner Accents -->
          <div class="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-500"></div>
          <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-500"></div>

          <div class="bg-[#050a15] border border-slate-800 p-6 space-y-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                <Radio size={12} class="animate-pulse" /> Signal Input
              </h3>
              <div class="flex gap-1">
                <div class="w-1 h-1 bg-slate-600"></div>
                <div class="w-1 h-1 bg-slate-600"></div>
                <div class="w-1 h-1 bg-slate-600"></div>
              </div>
            </div>

            <VideoUpload onInputSelected={handleInputSelected} {isLoading} />

            {#if error}
              <div class="mt-4 p-4 bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-mono">
                <span class="font-bold block mb-1">{'>>'} ERROR_LOG:</span>
                {error}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Output Feed - Below -->
      <div class="w-full max-w-4xl">
        {#if !result && !isLoading && !videoMetadata}
          <div class="h-[500px] flex flex-col items-center justify-center text-slate-700 border border-slate-800 border-dashed bg-[#0b1121]/30">
            <Activity size={64} class="mb-6 opacity-20" />
            <p class="text-2xl font-mono font-bold opacity-30 tracking-widest uppercase">Awaiting Data Stream</p>
            <div class="mt-4 flex gap-2">
              <span class="w-2 h-2 bg-slate-800 animate-pulse"></span>
              <span class="w-2 h-2 bg-slate-800 animate-pulse" style="animation-delay: 75ms"></span>
              <span class="w-2 h-2 bg-slate-800 animate-pulse" style="animation-delay: 150ms"></span>
            </div>
          </div>
        {/if}

        <!-- Video Metadata Card - Shows immediately on URL submit -->
        {#if videoMetadata}
          <div class="mb-8">
            <VideoMetadataCard metadata={videoMetadata} />
          </div>
        {/if}

        {#if isLoading}
          <AnalysisLogStream />
        {/if}

        {#if result && result.marketAnalysis}
          <div class="mb-8">
            <MarketAnalysisCard data={result.marketAnalysis} />
          </div>
        {/if}

        {#if result && result.trades.length === 0 && !isLoading}
          <div class="p-12 bg-[#0b1121] border border-slate-800 text-center">
            <p class="text-slate-400 font-mono text-lg">{'>>'} NULL_RESULT: No executable setups identified.</p>
          </div>
        {/if}

        {#if result && result.trades.length > 0}
          <div class="space-y-8">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 class="text-xl font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
                <span class="w-2 h-2 bg-cyan-500"></span>
                Extracted Alpha
              </h2>
              <span class="px-3 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono">
                COUNT: {result.trades.length}
              </span>
            </div>

            <div class="grid gap-8">
              {#each result.trades as idea, index (index)}
                <TradeCard {idea} />
              {/each}
            </div>
          </div>
        {/if}
      </div>

    </div>
  </main>

  <!-- API Key Modal -->
  <ApiKeyModal
    isOpen={showApiKeyModal}
    onClose={handleModalClose}
    onSubmit={handleApiKeySubmit}
  />
</div>
