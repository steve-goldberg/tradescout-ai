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