import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "placeholder");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export async function generateQuestions(examName: string, count: number = 5): Promise<Question[]> {
  const prompt = `Generate ${count} practice questions for the ${examName} exam. 
  Each question should match the actual exam pattern and difficulty.
  Return the output strictly as a JSON array of objects with the following structure:
  {
    "id": number,
    "text": "string",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": index (0-3),
    "explanation": "step-by-step solution",
    "topic": "specific sub-topic"
  }
  Do not include any markdown formatting or extra text outside the JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Remove potential markdown block markers if any
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error generating questions:", error);
    return []; // Return empty array or handle error
  }
}
