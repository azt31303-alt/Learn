import { GoogleGenAI } from "@google/genai";

// This check is to prevent crashing in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
  ? process.env.API_KEY
  : '';

if (!apiKey) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey });

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix, e.g., "data:audio/webm;base64,". We need to remove it.
        const base64String = reader.result.split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error("Failed to extract base64 string from data URL."));
        }
      } else {
        reject(new Error("Failed to convert blob to base64 string."));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const checkPronunciation = async (audioBlob: Blob, correctText: string): Promise<boolean> => {
  if (!apiKey) {
      alert("Gemini API key is not configured. Pronunciation check is disabled.");
      return false;
  }
  
  try {
    const audioData = await blobToBase64(audioBlob);
    const audioPart = {
      inlineData: {
        mimeType: audioBlob.type || 'audio/webm',
        data: audioData,
      },
    };

    const textPart = {
      text: `The user is trying to pronounce the character or word "${correctText}". Does the provided audio sound like a correct pronunciation of it? Please provide a simple "yes" or "no" answer.`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart, textPart] },
    });

    const resultText = response.text.trim().toLowerCase();
    // Check for "yes" at the beginning of the string to be more robust
    return resultText.startsWith('yes');
  } catch (error) {
    console.error("Error verifying pronunciation with Gemini API:", error);
    alert("There was an error checking the pronunciation. Please try again.");
    return false;
  }
};
