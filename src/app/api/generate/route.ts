import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "placeholder");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request: Request) {
  try {
    const { examName, count, difficulty, subject } = await request.json();

    const subjectText = subject && subject !== 'Full Mock Test' ? `specifically for the subject "${subject}"` : '';
    const prompt = `Generate ${count} practice questions for the ${examName} exam ${subjectText} with ${difficulty} difficulty. 
  Each question should match the actual exam pattern and ${difficulty} difficulty level.
  IMPORTANT: Use LaTeX for all mathematical formulas, symbols, and variables (e.g., use $E=mc^2$ instead of E=mc2).
  Return the output strictly as a JSON array of objects with the following structure:
  {
    "id": number,
    "text": "string (with LaTeX math)",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": index (0-3),
    "explanation": "step-by-step solution (with LaTeX math)",
    "topic": "specific sub-topic"
  }
  Do not include any markdown formatting or extra text outside the JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("AI Raw Response:", text); // Debugging log

    // More robust JSON extraction
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error("AI returned invalid format (no JSON array found). Raw response:", text);
      return NextResponse.json({ 
        error: "Invalid AI response format",
        raw: text.slice(0, 500) // Include snippet of raw for debugging
      }, { status: 500 });
    }
    
    const jsonString = text.substring(startIndex, endIndex + 1);
    
    try {
      const parsed = JSON.parse(jsonString);
      return NextResponse.json(parsed);
    } catch (parseError: any) {
      console.error("JSON Parse Error:", parseError.message, "Original text snippet:", text.slice(0, 500));
      return NextResponse.json({ 
        error: "Failed to parse AI response",
        details: parseError.message,
        raw: text.slice(0, 500)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ 
      error: "Failed to generate questions",
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    }, { status: 500 });
  }
}
