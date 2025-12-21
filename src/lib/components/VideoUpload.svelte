<script lang="ts">
  import { Youtube, Terminal, ChevronRight, Loader2, FileVideo } from 'lucide-svelte';

  interface Props {
    onInputSelected: (input: string | File) => void;
    isLoading: boolean;
  }

  let { onInputSelected, isLoading }: Props = $props();

  let url = $state('');
  let isFocused = $state(false);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (url.trim()) {
      onInputSelected(url);
    }
  }
</script>

<div class="w-full space-y-4">

  <!-- Mode Switcher -->
  <div class="flex gap-2">
    <!-- URL_Stream Tab - Active -->
    <button
      class="flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all bg-cyan-950/30 text-cyan-400 border-cyan-500/50"
    >
      <span class="flex items-center justify-center gap-2">
        <Youtube size={14} /> URL Stream
      </span>
    </button>

    <!-- File_Uplink Tab - Disabled -->
    <button
      disabled
      class="flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider border bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"
    >
      <span class="flex items-center justify-center gap-2">
        <FileVideo size={14} /> File Uplink
      </span>
    </button>
  </div>

  <div
    class="relative border-2 transition-all duration-300 {isFocused
      ? 'bg-black border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
      : 'bg-slate-900 border-slate-700 hover:border-slate-500'}"
  >

    <!-- Terminal Header -->
    <div class="flex items-center gap-2 px-3 py-1 bg-slate-800 border-b border-slate-700">
      <div class="w-2 h-2 rounded-full bg-red-500/50"></div>
      <div class="w-2 h-2 rounded-full bg-yellow-500/50"></div>
      <div class="w-2 h-2 rounded-full bg-green-500/50"></div>
      <div class="ml-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
        Input Stream
      </div>
    </div>

    <form onsubmit={handleSubmit} class="relative flex items-center p-1">
      <div class="pl-4 pr-3 text-cyan-500 animate-pulse">
        <ChevronRight size={20} strokeWidth={3} />
      </div>

      <input
        type="text"
        bind:value={url}
        onfocus={() => isFocused = true}
        onblur={() => isFocused = false}
        placeholder="ENTER_SOURCE_URL [YOUTUBE]..."
        class="flex-1 bg-transparent border-none outline-none text-cyan-100 placeholder-slate-600 h-14 text-lg font-mono tracking-tight"
        disabled={isLoading}
        autocomplete="off"
      />

      <button
        type="submit"
        disabled={!url.trim() || isLoading}
        class="mr-2 px-6 h-10 font-bold font-mono text-sm uppercase tracking-wider transition-all duration-200 border {!url.trim() || isLoading
          ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
          : 'bg-cyan-900/20 text-cyan-400 border-cyan-500 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'}"
      >
        {#if isLoading}
          <span class="flex items-center gap-2">
            <Loader2 size={14} class="animate-spin" /> PROCESSING
          </span>
        {:else}
          <span>EXECUTE</span>
        {/if}
      </button>
    </form>
  </div>

  <div class="mt-3 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1">
    <span>System: <span class="text-emerald-400 animate-pulse">Ready</span></span>
    <span class="flex items-center gap-1">
       <Terminal size={10} />
       Protocol: Direct Stream Analysis
    </span>
  </div>
</div>
