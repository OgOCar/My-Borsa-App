
import { GoogleGenAI, Type } from "@google/genai";
import { StockAnalysis } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeStock = async (query: string): Promise<StockAnalysis | null> => {
  if (!API_KEY) {
    console.error("API Key is missing");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemPrompt = `You are a world-class financial analyst specializing in the Egyptian Exchange (EGX). 
  Analyze the stock provided by the user (Ticker or Name).
  Use Google Search to find:
  1. Latest real-time price from EGX, Mubasher, or Google Finance.
  2. Technical indicators (Support, Resistance, RSI) from TradingView or Investing.com.
  3. Recent news, analyst opinions, and disclosures from EGX or credible Arabic financial sites.
  4. Estimated Fair Value based on recent reports.

  Return the data ONLY in the following JSON format:
  {
    "symbol": "Ticker code",
    "companyName": "Full Company Name in Arabic",
    "currentPrice": "Value in EGP",
    "changePercent": "Percentage with + or -",
    "supportLevel": "Support price",
    "resistanceLevel": "Resistance price",
    "rsiStatus": "Overbought/Oversold/Neutral",
    "fairValue": "Estimated price in EGP",
    "prediction": "Short prediction text in Arabic",
    "recommendation": "BUY, SELL, HOLD, or WAIT",
    "duration": "SHORT or LONG",
    "rationale": "Clear Arabic explanation for the advice",
    "news": [{"title": "News title", "source": "Source name", "url": "URL"}]
  }

  Be very objective. If RSI > 70 it's Overbought. If < 30 it's Oversold.
  Provide investment advice clearly (Short-term vs Long-term).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قم بتحليل السهم التالي في البورصة المصرية: ${query}`,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text);
    
    // Enrich with grounding sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingLinks = chunks
      .filter(c => c.web)
      .map(c => ({
        title: c.web.title,
        source: "مصدر خارجي",
        url: c.web.uri
      }));

    if (data.news) {
      data.news = [...data.news, ...groundingLinks.slice(0, 3)];
    }

    return data;
  } catch (error) {
    console.error("Error analyzing stock:", error);
    return null;
  }
};
