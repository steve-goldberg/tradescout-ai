import { TradeIdea, TradeDirection } from '../types';

// Use Vite proxy to avoid CORS issues
const API_BASE = '/api/chart-img/v2/tradingview/advanced-chart';

/**
 * Maps ticker symbols to TradingView format
 * e.g., "BTC" -> "BINANCE:BTCUSDT", "BTC/USD" -> "BINANCE:BTCUSDT", "AAPL" -> "NASDAQ:AAPL"
 */
const mapToSymbol = (ticker: string): string => {
  // Normalize: uppercase, strip common suffixes like /USD, /USDT, -USD
  let t = ticker.toUpperCase().replace(/[\/\-](USD|USDT|EUR|GBP)$/, '');

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
    '1M': '1',
    '5M': '5',
    '15M': '15',
    '30M': '30',
    '1H': '1h',
    '4H': '4h',
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

  const isLong = trade.direction === TradeDirection.LONG;
  const now = new Date().toISOString();

  const payload = {
    width: 800,
    height: 400,
    theme: 'dark',
    symbol: mapToSymbol(trade.ticker),
    interval: mapInterval(trade.timeframe),
    drawings: [{
      name: isLong ? 'Long Position' : 'Short Position',
      input: {
        startDatetime: now,
        entryPrice: entry,
        targetPrice: tp,
        stopPrice: sl
      },
      override: {
        profitBackground: 'rgb(16,185,129)',  // Emerald green
        stopBackground: 'rgb(244,63,94)',     // Rose red
        showPrice: true,
        fillBackground: true
      }
    }]
  };

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error(`Chart-IMG API error: ${res.status} ${res.statusText}`);
      return null;
    }

    // v2 API returns image blob directly
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to generate chart:', error);
    return null;
  }
};

/**
 * Generates chart images for multiple trades in parallel
 */
export const generateChartsForTrades = async (trades: TradeIdea[]): Promise<TradeIdea[]> => {
  const tradesWithCharts = await Promise.all(
    trades.map(async (trade) => ({
      ...trade,
      chartImageUrl: await generateChartUrl(trade)
    }))
  );

  return tradesWithCharts;
};
