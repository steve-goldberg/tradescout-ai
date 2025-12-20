import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const waitForFileActive = async (ai: GoogleGenAI, fileName: string): Promise<void> => {
  console.log("Waiting for file processing...");
  let file = await ai.files.get({ name: fileName });
  
  while (file.state === 'PROCESSING') {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    file = await ai.files.get({ name: fileName });
  }

  if (file.state !== 'ACTIVE') {
    throw new Error(`File processing failed with state: ${file.state}`);
  }
  console.log("File is active and ready for analysis.");
};

export const analyzeVideoForTrades = async (
  input: string | File,
  apiKey: string
): Promise<AnalysisResult> => {
  try {
    if (!apiKey) {
      throw new Error("API Key is missing. Please provide your Gemini API key.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-3-pro-preview"; // Using high-intelligence model for video analysis

    let fileUri: string;
    let mimeType: string;

    // --- MODE 1: FILE UPLOAD (Visual Analysis) ---
    if (input instanceof File) {
      console.log("Uploading file to Gemini...");
      
      const uploadResult = await ai.files.upload({
        file: input,
        config: { 
          displayName: input.name,
        }
      });
      
      await waitForFileActive(ai, uploadResult.name);
      fileUri = uploadResult.uri;
      mimeType = uploadResult.mimeType;
    
    // --- MODE 2: YOUTUBE URL (Direct Visual Analysis) ---
    } else {
      console.log("Using YouTube URL for direct visual analysis...");
      fileUri = input;
      // When passing a YouTube URL, we treat it as video content.
      mimeType = 'video/mp4'; 
    }

    // Unified Visual Analysis Prompt
    const prompt = `
      You are an expert financial analyst and trader. 
      Analyze the provided video content frame-by-frame. 
      
      **CRITICAL INSTRUCTION: VISUAL PRICE EXTRACTION (OCR)**
      - You MUST visually READ the price numbers on the charts (Y-axis labels, horizontal support/resistance lines, fib levels).
      - **DO NOT** return generic terms like "Market", "Current Price", "Highs", "Lows", or "End of Year". 
      - **YOU MUST RETURN EXACT NUMERICAL VALUES** (e.g., "91250.50", "0.45", "1950").
      - If the analyst does not speak the number, **LOOK AT THE CHART** and estimate the price based on the Y-Axis.
      - If an entry is "Market", look at the current price shown on the candle ticker in the video and use that number.

      1. Analyze the broader market context (Macro, High Timeframe, Sentiment).
      2. Identify **ALL** specific trade setups discussed. 
         - **CRITICAL**: Analysts often present conditional scenarios (e.g., "Scenario A: Long if support holds" AND "Scenario B: Short if support breaks"). 
         - You MUST extract **BOTH** the Long and Short scenarios if they are discussed with specific levels.
         - Do not stop at the first trade found. List every actionable setup mentioned.

      3. **MANDATORY RISK MANAGEMENT EXTRACTION**:
         - **Stop Loss / Invalidation**: This is CRITICAL.
         - Find the Red Line, the bottom of the risk box, or the recent Swing Low that invalidates the trade.
         - **NEVER** return "N/A" or "Unknown" for stopLoss. You must infer it visually from the chart structure if not spoken.

      Strictly follow the JSON schema provided in the configuration.
      
      Use these allowed values for Enums:
      - marketAnalysis.sentiment: "BULLISH", "BEARISH", "NEUTRAL", "UNCERTAIN"
      - marketAnalysis.sentimentScore: INTEGER (0-100)
      - trades[].direction: "LONG", "SHORT", "NEUTRAL"
      - trades[].riskLevel: "LOW", "MEDIUM", "HIGH", "DEGEN"
    `;

    const contents = {
      role: 'user',
      parts: [
        { fileData: { fileUri: fileUri, mimeType: mimeType } },
        { text: prompt }
      ]
    };

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        // @ts-ignore - MEDIA_RESOLUTION_HIGH is the requested setting for maximum fidelity
        mediaResolution: "MEDIA_RESOLUTION_HIGH",
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketAnalysis: {
              type: Type.OBJECT,
              properties: {
                sentiment: { type: Type.STRING },
                sentimentScore: { type: Type.INTEGER },
                highTimeframeAnalysis: { type: Type.STRING },
                riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                cycleTiming: { type: Type.STRING },
                macroOutlook: { type: Type.STRING },
                macroThesis: { type: Type.STRING },
              },
              required: ["sentiment", "sentimentScore", "highTimeframeAnalysis", "riskFactors", "cycleTiming", "macroOutlook", "macroThesis"],
            },
            trades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  asset: { type: Type.STRING },
                  ticker: { type: Type.STRING },
                  direction: { type: Type.STRING },
                  entryPrice: { type: Type.STRING },
                  takeProfit: { type: Type.STRING },
                  stopLoss: { type: Type.STRING },
                  thesis: { type: Type.STRING },
                  invalidation: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                },
                required: ["asset", "ticker", "direction", "entryPrice", "takeProfit", "stopLoss", "thesis", "invalidation", "timeframe", "riskLevel"],
              },
            },
          },
          required: ["marketAnalysis", "trades"],
        }
      }
    });

    const resultText = response.text;

    if (!resultText) {
       console.warn("Gemini returned empty text.");
       throw new Error("No textual response received from Gemini.");
    }

    try {
      // responseMimeType: "application/json" guarantees a JSON string.
      const parsedData = JSON.parse(resultText) as AnalysisResult;
      return parsedData;
    } catch (parseError) {
      console.error("JSON Parse Failed:", parseError);
      console.log("Raw Text:", resultText);
      throw new Error("Failed to parse analysis data from AI response.");
    }

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};