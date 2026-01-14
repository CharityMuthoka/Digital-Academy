
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function askTutor(topic: string, question: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful educational tutor for a student learning "${topic}". 
                The student asks: "${question}". 
                Provide a clear, encouraging, and educational answer. Keep it concise.`,
    });
    return response.text || "I'm sorry, I couldn't process that. Try again!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI Tutor. Please check your internet connection.";
  }
}
