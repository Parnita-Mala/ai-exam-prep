import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 401 });
    }
    const { question, context, history } = await request.json();

    const prompt = `The student is asking a follow-up question about a mock test problem.
    
    ORIGINAL QUESTION:
    ${context.questionText}
    
    AI EXPLANATION:
    ${context.explanation}
    
    STUDENT'S DOUBT:
    ${question}
    
    Provide a clear, concise, and helpful response. Use LaTeX for math. Keep the tone encouraging.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return NextResponse.json({ message: response.text() });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
