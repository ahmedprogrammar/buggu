import { GoogleGenAI, Modality, Type } from "@google/genai";

// Helper to ensure API key is selected for premium features
export const ensureApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        return await window.aistudio.hasSelectedApiKey();
    }
    return hasKey;
  }
  return !!process.env.API_KEY;
};

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// --- Chat & Text ---

export const askAITutor = async (
  question: string, 
  mode: 'fast' | 'think' | 'search' | 'maps' = 'fast'
): Promise<{text: string, groundingMetadata?: any}> => {
  const ai = getAI();
  let model = 'gemini-2.5-flash';
  let config: any = {};

  if (mode === 'think') {
    model = 'gemini-3-pro-preview';
    config.thinkingConfig = { thinkingBudget: 32768 };
  } else if (mode === 'search') {
    config.tools = [{googleSearch: {}}];
  } else if (mode === 'maps') {
     config.tools = [{googleMaps: {}}];
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: question,
      config
    });
    return {
        text: response.text || "عذراً، لم أستطع توليد إجابة.",
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "حدث خطأ أثناء الاتصال بالخادم." };
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually good for clarity
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (e) {
        console.error("TTS Error", e);
        return null;
    }
}

// --- Image Generation & Editing ---

export const generateImage = async (
    prompt: string, 
    aspectRatio: string = "1:1", 
    size: string = "1K"
): Promise<string | null> => {
    await ensureApiKey(); // Required for Pro Image
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { aspectRatio, imageSize: size }
            },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image Gen Error", e);
        throw e;
    }
}

export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Nano banana for editing
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Image } },
                    { text: prompt }
                ]
            }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image Edit Error", e);
        throw e;
    }
}

// --- Analysis ---

export const analyzeMedia = async (fileBase64: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: fileBase64 } },
                    { text: prompt }
                ]
            }
        });
        return response.text || "لم يتم العثور على تحليل.";
    } catch (e) {
        console.error("Analysis Error", e);
        return "حدث خطأ أثناء التحليل.";
    }
}

// --- Video Generation (Veo) ---

export const generateVideo = async (
    prompt: string, 
    aspectRatio: string = '16:9', 
    imageBytes?: string
): Promise<string | null> => {
    await ensureApiKey();
    const ai = getAI();
    
    let model = 'veo-3.1-fast-generate-preview';
    // If we were using multiple reference images we'd use 'veo-3.1-generate-preview', 
    // but for simple prompt or single image prompt, fast is good.

    try {
        let request: any = {
            model,
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
            }
        };

        if (imageBytes) {
            request.image = {
                imageBytes,
                mimeType: 'image/png'
            };
        }

        let operation = await ai.models.generateVideos(request);

        // Polling
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
             // Fetch the actual bytes
             const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
             const blob = await response.blob();
             return URL.createObjectURL(blob);
        }
        return null;
    } catch (e) {
        console.error("Veo Error", e);
        throw e;
    }
}

// --- Live API Helpers ---
// The connection logic is best handled in the component to manage the WebSocket state and AudioContexts
export const getLiveClient = () => {
    return getAI();
}
