import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim().replace(/\r/g, '') : '';
console.log("Loaded key:", apiKey.substring(0, 10) + "...");
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    // We can't directly list models easily with this SDK version if the method isn't exposed, 
    // so we'll fetch it via fetch API directly to see what's available.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("Available models:");
    if (data.models) {
      data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
    } else {
      console.log(data);
    }
  } catch (e) {
    console.error(e);
  }
}

run();
