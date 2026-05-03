import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "placeholder");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request: Request) {
  try {
    const { examName, count } = await request.json();

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean markdown if present
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
