import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './MockTest.module.css';

interface MockTestProps {
  examId: string;
  examName: string;
  onBack: () => void;
}

import { generateQuestions, Question } from '@/lib/ai';
import { Loader2 } from 'lucide-react';

const MockTest: React.FC<MockTestProps> = ({ examId, examName, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      const aiQuestions = await generateQuestions(examName, 5);
      if (aiQuestions.length > 0) {
        setQuestions(aiQuestions);
      }
      setLoading(false);
    }
    loadQuestions();
  }, [examName]);
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <h2>AI is generating your mock test...</h2>
        <p>Analyzing {examName} patterns and difficulty levels</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <h2>Failed to generate questions</h2>
        <p>Please check your API key or try again later.</p>
        <button onClick={onBack} className={styles.backBtn}>Back to Dashboard</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (idx: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQuestion.id]: idx });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowAnalysis(true);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  if (showAnalysis) {
    return (
      <div className={styles.analysisContainer}>
        <div className={styles.analysisHeader}>
          <button onClick={onBack} className={styles.backBtn}><ChevronLeft size={20} /> Dashboard</button>
          <h2>Test Analysis: {examName}</h2>
          <div className={styles.scoreBadge}>Score: {calculateScore()} / {questions.length}</div>
        </div>

        <div className={styles.analysisGrid}>
          <div className={styles.resultsList}>
            {questions.map((q, idx) => (
              <div key={q.id} className={styles.analysisCard}>
                <div className={styles.qHeader}>
                  <span className={styles.qNum}>Question {idx + 1}</span>
                  <span className={styles.topicTag}>{q.topic}</span>
                </div>
                <p className={styles.qText}>{q.text}</p>
                <div className={styles.optionsList}>
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correctAnswer;
                    const isSelected = answers[q.id] === oIdx;
                    return (
                      <div key={oIdx} className={`${styles.option} ${isCorrect ? styles.correct : ''} ${isSelected && !isCorrect ? styles.wrong : ''}`}>
                        {opt}
                        {isCorrect && <CheckCircle2 size={16} className={styles.statusIcon} />}
                        {isSelected && !isCorrect && <AlertCircle size={16} className={styles.statusIcon} />}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.explanation}>
                  <strong>AI Explanation:</strong>
                  <p>{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>

          <aside className={styles.sidebar}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3>Weak Topics Identified</h3>
              <div className={styles.weakTopics}>
                {Array.from(new Set(questions.filter(q => answers[q.id] !== q.correctAnswer).map(q => q.topic))).map(topic => (
                  <div key={topic} className={styles.topicItem}>
                    <span>{topic}</span>
                    <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '30%' }}></div></div>
                  </div>
                ))}
              </div>
              <button className={styles.scheduleBtn}>Generate Revision Schedule</button>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.testContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={onBack} className={styles.backBtn}><ChevronLeft size={20} /> Exit</button>
          <h1>{examName} Mock Test</h1>
        </div>
        <div className={styles.timer}>
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <button onClick={handleSubmit} className={styles.submitBtn}>
          <Send size={18} /> Submit Test
        </button>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.questionSection}>
          <div className="glass-card" style={{ padding: '2.5rem', minHeight: '400px' }}>
            <div className={styles.qHeader}>
              <span className={styles.qNum}>Question {currentIdx + 1} of {questions.length}</span>
              <span className={styles.topicTag}>{currentQuestion.topic}</span>
            </div>
            <p className={styles.questionText}>{currentQuestion.text}</p>
            <div className={styles.optionsGrid}>
              {currentQuestion.options.map((option, idx) => (
                <button 
                  key={idx}
                  className={`${styles.optionBtn} ${answers[currentQuestion.id] === idx ? styles.selected : ''}`}
                  onClick={() => handleOptionSelect(idx)}
                >
                  <span className={styles.optionLabel}>{String.fromCharCode(65 + idx)}</span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navButtons}>
            <button 
              className={styles.navBtn} 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <button 
              className={styles.navBtn} 
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx(currentIdx + 1)}
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <aside className={styles.paletteSection}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Question Palette</h3>
            <div className={styles.paletteGrid}>
              {questions.map((q, idx) => (
                <button 
                  key={q.id}
                  className={`${styles.paletteItem} ${currentIdx === idx ? styles.active : ''} ${answers[q.id] !== undefined ? styles.answered : ''}`}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}><span className={`${styles.dot} ${styles.answered}`}></span> Answered</div>
              <div className={styles.legendItem}><span className={styles.dot}></span> Unvisited</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MockTest;
