const fs = require('fs');

async function test() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const match = envFile.match(/GEMINI_API_KEY=(.+)/);
  const key = match[1].trim();
  
  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
    'gemini-flash-latest',
    'gemma-3-1b-it'
  ];
  
  for (const model of modelsToTest) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: "Hi"}]}]
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ SUCCESS: ${model} is working and has free tier!`);
        return; // Stop on first success
      } else {
        console.log(`❌ FAILED: ${model} - ${data.error?.message.split('\n')[0]}`);
      }
    } catch (e) {
      console.log(`Error on ${model}:`, e.message);
    }
  }
}

test();
