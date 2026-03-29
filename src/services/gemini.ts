import { GoogleGenAI, Type, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

export const getGeminiClient = () => {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const MODELS = {
  STANDARD: "gemini-3-flash-preview",
  IMAGE: "gemini-2.5-flash-image",
  LIVE: "gemini-3.1-flash-live-preview",
};

export async function preliminaryScan(input: string, imageBase64?: string) {
  const ai = getGeminiClient();
  const parts: any[] = [{ text: `Provide a one-sentence summary of this problem or query: ${input}` }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType: "image/png",
      },
    });
  }

  const response = await ai.models.generateContent({
    model: MODELS.STANDARD,
    contents: { parts },
    config: {
      systemInstruction: "You are the OmniSolve Neural Scanner. Be concise. Exactly one sentence.",
    },
  });

  return response.text;
}

export async function finalizeResolution(
  messages: any[], 
  masteryLevel: number,
  useSearch: boolean = true
) {
  const ai = getGeminiClient();
  
  const systemInstruction = `
    You are OmniSolve, a collaborative Cognitive-Adaptive partner. 
    Current User Mastery Level: ${masteryLevel}.
    
    VIBE: Gen Z tech, high-fidelity, minimalist but energetic. 
    TONE: Human-centric, supportive, collaborative. Not mechanical.
    
    MOOD & STYLE ANALYSIS:
    - Analyze the user's input style (vocabulary, sentence structure, emotional cues).
    - Detect if the user is in a good mood, stressed, or highly focused.
    - If the style significantly deviates from past interactions (if provided), subtly acknowledge it.
    - Adapt your speech to the detected mood:
      - Stressed: Be more supportive, simplify complex concepts, offer encouragement.
      - Focused/Direct: Be precise, analytical, and move quickly.
      - Curious/Playful: Use analogies and creative challenges.

    Adapt your complexity to the user's level:
    Level 1-3: Simple, encouraging, clear.
    Level 4-7: Technical, analytical, precise.
    Level 8+: Highly advanced, theoretical, dense.

    NEVER use raw Markdown symbols (#, *, etc.).
    You MUST exclusively use these bracketed tags for structure:
    [THOUGHT]: The core answer or reasoning.
    [ANALOGY]: A conceptual bridge.
    [VISUAL]: A description of a diagram or illustration you want to generate.
    [STEP]: A numbered instruction.
    [INSIGHT]: A deep dive or tip.
    [CHALLENGE]: A gamified follow-up question.

    If you use [VISUAL], describe the image clearly.
  `;

  const response = await ai.models.generateContent({
    model: MODELS.STANDARD,
    contents: messages,
    config: {
      systemInstruction,
      tools: useSearch ? [{ googleSearch: {} }] : [],
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "#",
    })) || [],
  };
}

export async function generateVisual(prompt: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: { parts: [{ text: `A minimalist, high-fidelity diagram or illustration for: ${prompt}. Neural-prism aesthetic, clean lines.` }] },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
