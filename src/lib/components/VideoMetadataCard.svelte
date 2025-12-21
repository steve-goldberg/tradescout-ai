<script lang="ts">
  import type { VideoMetadata } from '$lib/types';
  import { formatDuration, formatViewCount, formatUploadDate } from '$lib/services/supadataService';
  import { Play, User, Calendar, Eye, Clock } from 'lucide-svelte';

  interface Props {
    metadata: VideoMetadata;
  }

  let { metadata }: Props = $props();
</script>

<div class="bg-[#080c17] border border-purple-500/30 p-1 shadow-[0_0_20px_rgba(168,85,247,0.05)] relative">
  <!-- Decorative left stripe -->
  <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/50"></div>

  <div class="bg-[#0b1121] p-6">
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Thumbnail Section -->
      <div class="relative shrink-0 group">
        <div class="w-full md:w-64 aspect-video bg-slate-900 overflow-hidden border border-slate-700">
          {#if metadata.media.thumbnailUrl}
            <img
              src={metadata.media.thumbnailUrl}
              alt={metadata.title || 'Video thumbnail'}
              class="w-full h-full object-cover"
            />
          {:else}
            <div class="w-full h-full flex items-center justify-center">
              <Play size={32} class="text-slate-600" />
            </div>
          {/if}
        </div>
        <!-- Duration badge -->
        <div class="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs font-mono">
          {formatDuration(metadata.media.duration)}
        </div>
        <!-- Platform badge -->
        <div class="absolute top-2 left-2 px-2 py-0.5 bg-purple-500/80 text-white text-[10px] font-mono uppercase tracking-wider">
          {metadata.platform}
        </div>
      </div>

      <!-- Info Section -->
      <div class="flex-1 min-w-0 space-y-4">
        <!-- Header -->
        <div class="flex items-center gap-2 text-purple-400 text-xs font-mono uppercase tracking-widest">
          <Play size={12} class="animate-pulse" />
          <span>Source Media</span>
        </div>

        <!-- Title -->
        <h3 class="text-white font-mono font-bold text-lg leading-tight line-clamp-2">
          {metadata.title || 'Untitled Video'}
        </h3>

        <!-- Channel -->
        <div class="flex items-center gap-2 text-slate-300">
          <User size={14} class="text-purple-400" />
          <span class="font-mono text-sm">{metadata.author.displayName}</span>
        </div>

        <!-- Stats Row -->
        <div class="flex flex-wrap gap-4 text-slate-400 text-xs font-mono">
          <!-- Views -->
          <div class="flex items-center gap-1.5">
            <Eye size={12} class="text-slate-500" />
            <span>{formatViewCount(metadata.stats.views)} views</span>
          </div>

          <!-- Duration -->
          <div class="flex items-center gap-1.5">
            <Clock size={12} class="text-slate-500" />
            <span>{formatDuration(metadata.media.duration)}</span>
          </div>

          <!-- Upload Date -->
          <div class="flex items-center gap-1.5">
            <Calendar size={12} class="text-slate-500" />
            <span>{formatUploadDate(metadata.createdAt)}</span>
          </div>
        </div>

        <!-- Tags (if present) -->
        {#if metadata.tags && metadata.tags.length > 0}
          <div class="flex flex-wrap gap-2 pt-2">
            {#each metadata.tags.slice(0, 5) as tag, index}
              <span
                class="px-2 py-0.5 bg-purple-950/50 border border-purple-500/20 text-purple-300 text-[10px] font-mono"
              >
                {tag}
              </span>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
