import React from 'react';
import { TradeIdea, TradeDirection, RiskLevel } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, Target, HandCoins, Ban, Clock, Hash } from 'lucide-react';

interface TradeCardProps {
  idea: TradeIdea;
}

const getRiskColors = (risk: RiskLevel) => {
  switch (risk) {
    case RiskLevel.LOW: return 'text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    case RiskLevel.MEDIUM: return 'text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
    case RiskLevel.HIGH: return 'text-orange-500 border-orange-600/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
    case RiskLevel.DEGEN: return 'text-red-500 border-red-600/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    default: return 'text-slate-400 border-slate-600';
  }
};

export const TradeCard: React.FC<TradeCardProps> = ({ idea }) => {
  const isLong = idea.direction === TradeDirection.LONG;
  const isShort = idea.direction === TradeDirection.SHORT;

  // Terminal accent colors based on direction
  const accentColor = isLong 
    ? 'text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
    : isShort 
      ? 'text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_15px_rgba(232,121,249,0.1)]' 
      : 'text-slate-300 border-slate-500/30';

  const entryColor = 'text-white';
  const tpColor = 'text-emerald-400';
  const slColor = 'text-rose-500';

  // Helper to filter out raw N/A strings
  const displayValue = (val: string, fallback: string) => {
     if (!val || val === "N/A" || val === "n/a") return fallback;
     return val;
  };

  return (
    <div className={`
      relative bg-[#0b1121] border border-slate-800 
      hover:border-slate-600 transition-all duration-300 
      group overflow-hidden rounded-none
      before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:${isLong ? 'bg-cyan-500' : isShort ? 'bg-fuchsia-500' : 'bg-slate-500'}
    `}>
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/40">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-3xl font-bold font-mono tracking-tighter text-white uppercase">
              {idea.ticker || idea.asset}
            </h3>
            <span className={`text-xs font-mono px-2 py-0.5 border ${getRiskColors(idea.riskLevel)} uppercase tracking-wider`}>
              {idea.riskLevel} RISK
            </span>
          </div>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-mono">{idea.asset} // MARKET_DATA</p>
        </div>
        
        <div className={`
          flex items-center gap-2 px-4 py-2 border bg-black/40 backdrop-blur-md
          ${accentColor}
        `}>
          {isLong && <ArrowUpRight size={24} className="animate-pulse" />}
          {isShort && <ArrowDownRight size={24} className="animate-pulse" />}
          {!isLong && !isShort && <Minus size={24} />}
          <span className="text-xl font-bold font-mono tracking-wider">{idea.direction}</span>
        </div>
      </div>

      {/* Main Data Grid - Increased Sizes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-800 border-b border-slate-800">
        
        {/* Entry */}
        <div className="p-6 space-y-2 hover:bg-slate-800/30 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <HandCoins size={16} />
            <span className="text-sm font-bold uppercase tracking-widest">Entry</span>
          </div>
          <div className={`font-mono text-3xl font-bold tracking-tight ${entryColor}`}>
            {displayValue(idea.entryPrice, "MARKET")}
          </div>
        </div>

        {/* Take Profit */}
        <div className="p-6 space-y-2 hover:bg-slate-800/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/5 rounded-bl-3xl"></div>
          <div className="flex items-center gap-2 text-emerald-500/70 mb-2">
            <Target size={16} />
            <span className="text-sm font-bold uppercase tracking-widest">Target</span>
          </div>
          <div className={`font-mono text-3xl font-bold tracking-tight ${tpColor} drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]`}>
            {displayValue(idea.takeProfit, "OPEN")}
          </div>
        </div>

        {/* Stop Loss */}
        <div className="p-6 space-y-2 hover:bg-slate-800/30 transition-colors relative overflow-hidden">
           <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500/5 rounded-bl-3xl"></div>
          <div className="flex items-center gap-2 text-rose-500/70 mb-2">
            <Ban size={16} />
            <span className="text-sm font-bold uppercase tracking-widest">Stop Loss</span>
          </div>
          <div className={`font-mono text-3xl font-bold tracking-tight ${slColor} drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]`}>
            {displayValue(idea.stopLoss, "MANUAL")}
          </div>
        </div>

        {/* Timeframe */}
        <div className="p-6 space-y-2 hover:bg-slate-800/30 transition-colors">
          <div className="flex items-center gap-2 text-indigo-400/70 mb-2">
            <Clock size={16} />
            <span className="text-sm font-bold uppercase tracking-widest">Timeframe</span>
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight text-indigo-200">
             {displayValue(idea.timeframe, "N/A")}
          </div>
        </div>
      </div>

      {/* Footer / Thesis */}
      <div className="p-6 bg-[#0f1523] space-y-4">
        
        {/* Thesis */}
        <div>
          <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
             <Hash size={12} className="text-cyan-500" />
             Trade Thesis
          </h4>
          <div className="relative pl-4 border-l-2 border-slate-700">
             <p className="text-lg text-slate-300 font-mono leading-relaxed">
               "{idea.thesis}"
             </p>
          </div>
        </div>

        {/* Invalidation Row */}
        {idea.invalidation && (
           <div className="mt-4 pt-4 border-t border-slate-800 flex items-start gap-3">
             <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
             <div className="space-y-1">
                <span className="text-xs font-bold text-orange-500/70 uppercase tracking-widest block">Invalidation Condition</span>
                <span className="text-sm font-mono text-orange-200/80">{idea.invalidation}</span>
             </div>
           </div>
        )}
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-500 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-500 opacity-50"></div>
    </div>
  );
};