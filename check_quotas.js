const fs = require('fs');

async function checkQuota() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const match = envFile.match(/GEMINI_API_KEY=(.+)/);
  const key = match[1].trim();
  
  const model = 'gemini-pro';
  
  console.log(`Blasting ${model}...`);
  for (let i = 0; i < 25; i++) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: "Hi"}]}]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(`❌ FAILED on request ${i+1}: ${data.error?.message.split('\n')[0]}`);
        return;
      }
    } catch (e) {
      console.log(`Error on ${model}:`, e.message);
      return;
    }
  }
  console.log(`✅ SUCCESS: Did 25 requests without hitting quota!`);
}

checkQuota();
