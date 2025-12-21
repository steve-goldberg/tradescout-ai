export enum TradeDirection {
  LONG = 'LONG',
  SHORT = 'SHORT',
  NEUTRAL = 'NEUTRAL'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  DEGEN = 'DEGEN'
}

export interface TradeIdea {
  asset: string;
  ticker: string;
  direction: TradeDirection;
  entryPrice: string;
  takeProfit: string;
  stopLoss: string;
  thesis: string;
  invalidation: string;
  timeframe: string;
  riskLevel: RiskLevel;
  chartImageUrl?: string;
  tradingViewSymbol?: string; // Chart-IMG compatible symbol (e.g., "BINANCE:BTCUSDT")
  videoPublishDate?: string;  // ISO8601 datetime for Chart-IMG vertical line
}

export interface MarketAnalysis {
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL" | "UNCERTAIN";
  sentimentScore: number; // 0 to 100
  highTimeframeAnalysis: string;
  riskFactors: string[];
  cycleTiming: string;
  macroOutlook: string;
  macroThesis: string;
}

export interface AnalysisResult {
  trades: TradeIdea[];
  marketAnalysis: MarketAnalysis;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  data: AnalysisResult | null;
}

export interface VideoMetadata {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'facebook';
  type: 'video' | 'image' | 'carousel' | 'post';
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  author: {
    displayName: string;
    avatarUrl?: string;
  };
  stats: {
    views: number | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
  };
  media: {
    type: string;
    duration: number;
    thumbnailUrl: string;
  };
  tags: string[];
  createdAt: string;
}