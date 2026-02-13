
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  // analyzeSecurity provides a forensic or readiness audit of a carrier image.
  static async analyzeSecurity(imageUri: string, isOriginal: boolean): Promise<string> {
    try {
      // Create a new instance right before the call to ensure process.env.API_KEY is current.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = isOriginal 
        ? "You are a cybersecurity expert. Analyze this image and determine its suitability as a carrier for steganographic data. Look for high-entropy regions, noise patterns, and color distributions. Give a brief 'Kavach Readiness' score (0-100)."
        : "You are a forensic analyst. Analyze this stego-image for any visual artifacts or patterns that might suggest hidden data. provide a 'Concealment Confidence' rating and a security audit report.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: imageUri.split(',')[1] } },
            { text: prompt }
          ]
        }
      });

      // Use the .text property directly as per the @google/genai guidelines.
      return response.text || "AI analysis unavailable.";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "Security audit engine currently offline. Proceed with manual verification.";
    }
  }
}
