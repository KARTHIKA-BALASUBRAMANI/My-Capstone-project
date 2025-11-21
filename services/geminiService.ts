import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CurriculumItem, QuizQuestion } from "../types";

// NOTE: In a real deployment, ensure process.env.API_KEY is set in your build environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Agent 1: Curriculum Architect ---
// Responsible for breaking down complex topics into structured learning paths.
export const curriculumAgent = async (topic: string): Promise<CurriculumItem[]> => {
  const modelId = "gemini-2.5-flash";
  
  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Concise title of the sub-topic" },
        description: { type: Type.STRING, description: "Brief description of what will be learned" },
        estimatedTime: { type: Type.STRING, description: "Estimated time to read/learn e.g. '5 mins'" }
      },
      required: ["title", "description", "estimatedTime"]
    }
  };

  const response = await ai.models.generateContent({
    model: modelId,
    contents: `You are an expert Curriculum Architect designed to help students learn STEM topics. 
    Create a structured learning path for the topic: "${topic}". 
    Break it down into 4-6 logical, sequential sub-modules suitable for a beginner to intermediate learner.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      systemInstruction: "You are a helpful and precise educational planner.",
      temperature: 0.4
    }
  });

  const data = JSON.parse(response.text || "[]");
  
  return data.map((item: any, index: number) => ({
    id: `node-${index}-${Date.now()}`,
    title: item.title,
    description: item.description,
    estimatedTime: item.estimatedTime,
    status: index === 0 ? 'active' : 'pending'
  }));
};

// --- Agent 2: The Professor (Content & Research) ---
// Responsible for explaining concepts, using Google Search for real-world context.
export const professorAgent = async (
  topic: string, 
  subTopic: string, 
  previousContext: string
): Promise<{ text: string; groundingUrls: Array<{title: string, uri: string}> }> => {
  const modelId = "gemini-2.5-flash"; // Using 2.5 Flash for speed with tools

  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Explain the concept of "${subTopic}" within the broader context of "${topic}".
    
    Guidelines:
    1. Start with a clear, simple definition.
    2. Provide a real-world application or recent scientific development related to this.
    3. Use analogies where possible.
    4. Keep it engaging and educational.
    
    Previous conversation context: ${previousContext.substring(0, 500)}...`,
    config: {
      tools: [{ googleSearch: {} }], // Using built-in tool for grounding
      systemInstruction: "You are an enthusiastic STEM professor. You love connecting theory to the real world.",
      temperature: 0.7
    }
  });

  // Extract grounding metadata if available
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundingUrls = groundingChunks
    .filter((c: any) => c.web?.uri && c.web?.title)
    .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

  return {
    text: response.text || "I apologize, I couldn't generate an explanation at this moment.",
    groundingUrls
  };
};

// --- Agent 3: The Examiner (Quiz Generator) ---
// Responsible for assessing user understanding.
export const examinerAgent = async (contentToTest: string): Promise<QuizQuestion[]> => {
  const modelId = "gemini-2.5-flash";

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Array of 4 possible answers"
        },
        correctOptionIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct answer" },
        explanation: { type: Type.STRING, description: "Why the correct answer is correct" }
      },
      required: ["question", "options", "correctOptionIndex", "explanation"]
    }
  };

  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Generate 3 multiple-choice quiz questions based strictly on the following content:
    
    "${contentToTest.substring(0, 3000)}"
    
    The questions should test understanding, not just recall.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.3
    }
  });

  const data = JSON.parse(response.text || "[]");
  return data.map((q: any, i: number) => ({
    ...q,
    id: `q-${i}-${Date.now()}`
  }));
};