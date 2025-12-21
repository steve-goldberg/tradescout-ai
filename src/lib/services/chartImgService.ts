import type { TradeIdea } from '$lib/types';
import { debugLog, storeChartImage } from '$lib/utils/debugLogger';

// Use Vite proxy to avoid CORS issues
const API_BASE = '/api/chart-img/v2/tradingview/advanced-chart';

/**
 * Maps ticker symbols to TradingView format
 * e.g., "BTC" -> "BINANCE:BTCUSDT", "BTC/USD" -> "BINANCE:BTCUSDT", "AAPL" -> "NASDAQ:AAPL"
 */
const mapToSymbol = (ticker: string): string => {
  // Normalize: uppercase, strip common suffixes like /USD, /USDT, -USD, or just USD/USDT at the end
  let t = ticker.toUpperCase()
    .replace(/[\/\-](USD|USDT|EUR|GBP)$/, '')  // Handle BTC/USD, BTC-USD
    .replace(/(USD|USDT|EUR|GBP)$/, '');        // Handle BTCUSD, BTCUSDT

  // Crypto tickers -> Binance USDT pairs
  const crypto = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'MATIC', 'DOT', 'LINK', 'BNB', 'ATOM', 'LTC', 'UNI', 'AAVE', 'PEPE', 'SHIB', 'ARB', 'OP', 'SUI', 'APT', 'INJ', 'FET', 'NEAR', 'FTM', 'ALGO', 'XLM', 'VET', 'HBAR', 'ICP', 'FIL', 'SAND', 'MANA', 'AXS', 'GALA', 'ENJ', 'CHZ', 'CRV', 'MKR', 'COMP', 'SNX', 'YFI', 'SUSHI', '1INCH', 'BAL', 'ZRX', 'ENS', 'LDO', 'RPL', 'GMX', 'BLUR', 'WLD', 'SEI', 'TIA', 'JUP', 'STRK', 'W', 'ENA'];
  if (crypto.includes(t)) return `BINANCE:${t}USDT`;

  // Commodities
  if (t === 'GOLD' || t === 'XAUUSD' || t === 'XAU') return 'OANDA:XAUUSD';
  if (t === 'SILVER' || t === 'XAGUSD' || t === 'XAG') return 'OANDA:XAGUSD';
  if (t === 'OIL' || t === 'USOIL' || t === 'WTI' || t === 'CRUDE') return 'TVC:USOIL';

  // Major forex pairs (already in pair format or base currency)
  const forex = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'];
  if (forex.includes(t)) return `FX:${t}`;

  // Default: assume US stock (NASDAQ first, most common)
  return `NASDAQ:${t}`;
};

/**
 * Maps timeframe strings to Chart-IMG interval format
 * e.g., "4H" -> "4h", "1D" -> "1D"
 */
const mapInterval = (tf: string): string => {
  if (!tf) return '1D';

  const map: Record<string, string> = {
    '1M': '1m',
    '3M': '3m',
    '5M': '5m',
    '15M': '15m',
    '30M': '30m',
    '45M': '45m',
    '1H': '1h',
    '2H': '2h',
    '3H': '3h',
    '4H': '4h',
    '6H': '6h',
    '12H': '12h',
    '1D': '1D',
    'D': '1D',
    'DAILY': '1D',
    '1W': '1W',
    'W': '1W',
    'WEEKLY': '1W',
  };

  return map[tf.toUpperCase()] || '1D';
};

/**
 * Calculates the chart range based on interval
 * Range OVERRIDES interval for time window - we want 2 weeks to 1 month MAX
 */
const calculateRange = (interval: string): string => {
  const tf = interval.toLowerCase();
  if (tf.includes('m') && !tf.includes('mo')) return '5D';  // minutes → 5 days
  if (tf.includes('h')) return '1M';   // hourly → 1 month
  if (tf.includes('d')) return '1M';   // daily → 1 month
  if (tf.includes('w')) return '3M';   // weekly → 3 months
  return '1M';  // default
};

/**
 * Generates a TradingView chart image URL for a trade idea
 * Uses Long/Short Position drawings to visualize entry, TP, and SL levels
 */
export const generateChartUrl = async (trade: TradeIdea): Promise<string | null> => {
  const apiKey = process.env.CHART_IMG_API_KEY;
  if (!apiKey) {
    console.warn('CHART_IMG_API_KEY not configured');
    return null;
  }

  // Parse and validate price levels
  const entry = parseFloat(trade.entryPrice);
  const tp = parseFloat(trade.takeProfit);
  const sl = parseFloat(trade.stopLoss);

  if (isNaN(entry) || isNaN(tp) || isNaN(sl)) {
    console.warn(`Invalid price data for ${trade.ticker}, skipping chart generation`);
    return null;
  }

  // Calculate price range with 15% padding for tighter view
  const minPrice = Math.min(entry, tp, sl);
  const maxPrice = Math.max(entry, tp, sl);
  const priceSpan = maxPrice - minPrice;
  const padding = priceSpan * 0.15;

  // Build drawings array for Entry, Target, Stop, and optional Video line
  const drawings: Array<{
    name: string;
    input: Record<string, unknown>;
    override: Record<string, unknown>;
  }> = [
    {
      name: 'Horizontal Line',
      input: { price: entry, text: 'ENTRY' },
      override: {
        lineColor: 'rgb(255,255,255)',  // White
        textColor: 'rgb(255,255,255)',
        lineWidth: 2,
        showPrice: true,
        horzLabelAlign: 'right'
      }
    },
    {
      name: 'Horizontal Line',
      input: { price: tp, text: 'TARGET' },
      override: {
        lineColor: 'rgb(16,185,129)',   // Emerald
        textColor: 'rgb(16,185,129)',
        lineWidth: 2,
        showPrice: true,
        horzLabelAlign: 'right'
      }
    },
    {
      name: 'Horizontal Line',
      input: { price: sl, text: 'STOP' },
      override: {
        lineColor: 'rgb(244,63,94)',    // Rose
        textColor: 'rgb(244,63,94)',
        lineWidth: 2,
        showPrice: true,
        horzLabelAlign: 'right'
      }
    }
  ];

  // Add vertical line for video publish date (GitHub #1)
  if (trade.videoPublishDate) {
    drawings.push({
      name: 'Vertical Line',
      input: {
        datetime: trade.videoPublishDate,  // ISO8601 format
        text: 'VIDEO'
      },
      override: {
        lineColor: 'rgba(139,92,246,0.7)',  // Purple (no spaces!)
        textColor: 'rgb(139,92,246)',
        lineWidth: 2,
        showTime: false,
        vertLabelAlign: 'top'
      }
    });
  }

  // Use AI-provided symbol if available, fallback to regex mapping
  const symbol = trade.tradingViewSymbol || mapToSymbol(trade.ticker);
  const interval = mapInterval(trade.timeframe);

  const payload = {
    width: 1200,
    height: 600,
    theme: 'dark',
    symbol,
    interval,
    range: calculateRange(interval),  // Range OVERRIDES interval for time window
    style: 'candle',
    override: {
      priceRange: {
        from: minPrice - padding,
        to: maxPrice + padding,
        margin: 0.01
      }
    },
    drawings
  };

  try {
    debugLog('chart-img-request', `Chart for ${trade.ticker}`, payload);

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    debugLog('chart-img-response', `Chart result for ${trade.ticker}`, {
      status: res.status,
      ok: res.ok,
      contentType: res.headers.get('content-type')
    });

    if (!res.ok) {
      console.error(`Chart-IMG API error: ${res.status} ${res.statusText}`);
      return null;
    }

    // v2 API returns image blob directly
    const blob = await res.blob();
    storeChartImage(trade.ticker, blob);
    return URL.createObjectURL(blob);
  } catch (error) {
    debugLog('error', `Chart failed for ${trade.ticker}`, { error: (error as Error).message });
    console.error('Failed to generate chart:', error);
    return null;
  }
};

/**
 * Generates chart images for multiple trades in parallel
 */
export const generateChartsForTrades = async (trades: TradeIdea[]): Promise<TradeIdea[]> => {
  const tradesWithCharts = await Promise.all(
    trades.map(async (trade) => {
      const chartUrl = await generateChartUrl(trade);
      return {
        ...trade,
        chartImageUrl: chartUrl ?? undefined  // Convert null to undefined for TradeIdea type
      };
    })
  );

  return tradesWithCharts;
};
