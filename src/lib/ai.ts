export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export async function generateQuestions(examName: string, count: number = 10, difficulty: string = 'Medium', subject: string = 'Full Mock Test'): Promise<Question[]> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ examName, count, difficulty, subject }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.questions || data;
  } catch (error: any) {
    console.error("Error generating questions:", error);
    throw error;
  }
}
