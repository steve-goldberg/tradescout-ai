import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { TradeIdea } from "$lib/types";
import { debugLog } from "$lib/utils/debugLogger";

// Simple array schema - matches Gemini's natural output format
const SymbolArraySchema = z.array(
  z.string().describe("TradingView EXCHANGE:SYMBOL format")
);

// Pre-compute JSON schema for Gemini API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const symbolJsonSchema = zodToJsonSchema(SymbolArraySchema as any) as Record<string, unknown>;

/**
 * Uses Gemini Flash to convert trade tickers to Chart-IMG compatible TradingView symbols.
 * This is a cheap, fast operation that runs after the main video analysis.
 *
 * One AI = One Job:
 * - Gemini Pro: Video analysis (expensive, smart)
 * - Gemini Flash: Symbol formatting (cheap, fast)
 */
export const enrichTradesWithSymbols = async (
  trades: TradeIdea[],
  apiKey: string
): Promise<TradeIdea[]> => {
  if (trades.length === 0) return trades;

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Convert these tickers to TradingView EXCHANGE:SYMBOL format.
Return a JSON array with one symbol per input, in the same order.

SYMBOL FORMAT RULES (from Chart-IMG API):
- Crypto spot: BINANCE:BTCUSDT, COINBASE:BTCUSD, KRAKEN:ETHUSD
- Crypto perps: BYBIT:BTCUSDT.P, OKX:ETHUSDT.P, BITGET:SOLUSDT.P
- US Stocks: NASDAQ:AAPL, NYSE:TSLA, AMEX:SPY
- Forex: FX:EURUSD, FX:GBPJPY, FX:USDJPY
- Commodities: OANDA:XAUUSD (gold), OANDA:XAGUSD (silver), TVC:USOIL
- Indices: CAPITALCOM:US500, TVC:DXY, CRYPTOCAP:TOTAL

Default to BINANCE for crypto unless context suggests otherwise.

INPUT TICKERS:
${trades.map((t, i) => `${i}: "${t.ticker}" (${t.asset})`).join('\n')}`;

  try {
    debugLog('chart-symbol', 'Enriching trades with TradingView symbols', {
      tradeCount: trades.length,
      tickers: trades.map(t => t.ticker)
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash", // gemini-2.0-flash shut down 2026-06-01; docs name 3.5 Flash as the migration target
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: symbolJsonSchema
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const symbols = SymbolArraySchema.parse(JSON.parse(response.text));

    debugLog('chart-symbol', 'Symbol enrichment complete', { symbols });

    return trades.map((trade, i) => ({
      ...trade,
      tradingViewSymbol: symbols[i]
    }));
  } catch (error) {
    debugLog('error', 'Symbol enrichment failed, using fallback', {
      error: (error as Error).message
    });
    console.warn("Symbol enrichment failed, chartImgService will use fallback:", error);
    return trades; // Return original trades, chartImgService will use mapToSymbol fallback
  }
};
