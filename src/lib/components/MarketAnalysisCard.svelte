<script lang="ts">
  import type { MarketAnalysis } from '$lib/types';
  import { TrendingUp, TrendingDown, Minus, Globe, AlertOctagon, BarChart3, Radio, Telescope, ShieldAlert } from 'lucide-svelte';

  interface Props {
    data: MarketAnalysis;
  }

  let { data }: Props = $props();

  let isBullish = $derived(data.sentiment === 'BULLISH');
  let isBearish = $derived(data.sentiment === 'BEARISH');

  let sentimentColor = $derived(
    isBullish ? 'text-emerald-400' : isBearish ? 'text-rose-500' : 'text-yellow-400'
  );

  let sentimentBorder = $derived(
    isBullish ? 'border-emerald-500/30' : isBearish ? 'border-rose-500/30' : 'border-yellow-500/30'
  );

  function getFormattedScore(score: number): number {
    // If score is clearly normalized (e.g., 0.45), convert to percentage
    if (score > 0 && score <= 1) {
      return Math.round(score * 100);
    }
    return Math.round(score);
  }

  let displayScore = $derived(getFormattedScore(data.sentimentScore));
</script>

<div class="space-y-6">
  <!-- Global Macro Context Card (2x2 Layout) -->
  <div class="bg-[#080c17] border border-slate-800 relative overflow-hidden shadow-2xl">
    <!-- Background Grid Pattern -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.3)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none"></div>

    <!-- Header -->
    <div class="relative z-10 p-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <Globe size={20} class="text-indigo-400" />
          <h2 class="text-xl font-mono font-bold text-white uppercase tracking-widest">
            Global Macro Context
          </h2>
        </div>
        <p class="text-xs text-slate-500 font-mono uppercase tracking-wider pl-8">
          High Fidelity Market Reconnaissance
        </p>
      </div>

      <div class="flex items-center gap-5 px-6 py-3 border {sentimentBorder} bg-slate-950/80 backdrop-blur-md">
        <div>
          <div class="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">Sentiment Score</div>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-bold font-mono leading-none {sentimentColor}">
              {displayScore}
            </span>
            <span class="text-slate-600 font-mono text-sm mb-1">/100</span>
          </div>
        </div>
        <div class="h-10 w-[1px] bg-slate-800"></div>
        <div class="flex flex-col items-end min-w-[100px]">
          <div class="flex items-center gap-2 mb-1">
            {#if isBullish}
              <TrendingUp size={20} class={sentimentColor} />
            {:else if isBearish}
              <TrendingDown size={20} class={sentimentColor} />
            {:else}
              <Minus size={20} class={sentimentColor} />
            {/if}
            <span class="text-lg font-bold font-mono tracking-wider {sentimentColor}">
              {data.sentiment}
            </span>
          </div>
          <span class="text-[10px] text-slate-500 uppercase tracking-widest">Market Bias</span>
        </div>
      </div>
    </div>

    <!-- 2x2 Grid Layout -->
    <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800 border-b border-slate-800">
      <!-- Quadrant 1: Macro Thesis -->
      <div class="bg-[#0b1121] p-8 hover:bg-[#0f172a] transition-colors duration-300">
        <div class="flex items-center gap-3 text-indigo-400 mb-5 pb-3 border-b border-indigo-500/10">
          <Radio size={20} />
          <span class="text-sm font-bold uppercase tracking-widest">Macro Thesis</span>
        </div>
        <p class="text-slate-300 font-mono text-sm leading-relaxed">
          {data.macroThesis}
        </p>
      </div>

      <!-- Quadrant 2: HTF Structure -->
      <div class="bg-[#0b1121] p-8 hover:bg-[#0f172a] transition-colors duration-300">
        <div class="flex items-center gap-3 text-cyan-400 mb-5 pb-3 border-b border-cyan-500/10">
          <BarChart3 size={20} />
          <span class="text-sm font-bold uppercase tracking-widest">HTF Structure</span>
        </div>
        <p class="text-slate-300 font-mono text-sm leading-relaxed">
          {data.highTimeframeAnalysis}
        </p>
      </div>

      <!-- Quadrant 3: Macro Outlook -->
      <div class="bg-[#0b1121] p-8 hover:bg-[#0f172a] transition-colors duration-300">
        <div class="flex items-center gap-3 text-blue-400 mb-5 pb-3 border-b border-blue-500/10">
          <Telescope size={20} />
          <span class="text-sm font-bold uppercase tracking-widest">Macro Outlook</span>
        </div>
        <p class="text-slate-300 font-mono text-sm leading-relaxed">
          {data.macroOutlook}
        </p>
      </div>

      <!-- Quadrant 4: Risk Factors -->
      <div class="bg-[#0b1121] p-8 hover:bg-[#0f172a] transition-colors duration-300">
        <div class="flex items-center gap-3 text-orange-400 mb-5 pb-3 border-b border-orange-500/10">
          <ShieldAlert size={20} />
          <span class="text-sm font-bold uppercase tracking-widest">Risk Factors</span>
        </div>
        <ul class="space-y-3">
          {#each data.riskFactors as risk, idx}
            <li class="text-sm font-mono text-slate-300 flex items-start gap-3">
              <AlertOctagon size={16} class="text-orange-500/50 mt-0.5 shrink-0" />
              <span class="leading-snug">{risk}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>
