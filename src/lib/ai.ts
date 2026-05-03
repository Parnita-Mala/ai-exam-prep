export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export async function generateQuestions(examName: string, count: number = 10, difficulty: string = 'Medium'): Promise<Question[]> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ examName, count, difficulty }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate questions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
}
