
export interface StockAnalysis {
  symbol: string;
  companyName: string;
  currentPrice: string;
  changePercent: string;
  supportLevel: string;
  resistanceLevel: string;
  rsiStatus: string; // "Overbought", "Oversold", "Neutral"
  fairValue: string;
  prediction: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
  duration: 'SHORT' | 'LONG' | 'NONE';
  rationale: string;
  news: Array<{ title: string; source: string; url: string }>;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}
