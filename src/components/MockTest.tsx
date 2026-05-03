import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './MockTest.module.css';

interface MockTestProps {
  examId: string;
  examName: string;
  questionCount: number;
  difficulty: string;
  subject: string;
  onBack: () => void;
}

import { generateQuestions, Question } from '@/lib/ai';
import { Loader2, Bookmark, BookmarkCheck } from 'lucide-react';
import RevisionSchedule from './RevisionSchedule';
import { InlineMath, BlockMath } from 'react-katex';
import { supabase } from '@/lib/supabase';

const LatexText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  
  // Split text by $ delimiters
  const parts = text.split(/(\$.*?\$)/g);
  
  return (
    <span>
      {parts.map((part, idx) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return <InlineMath key={idx} math={math} />;
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
};

const MockTest: React.FC<MockTestProps> = ({ examId, examName, questionCount, difficulty, subject, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(questionCount * 120); // 2 mins per question
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showRevision, setShowRevision] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      const aiQuestions = await generateQuestions(examName, questionCount, difficulty, subject);
      if (aiQuestions.length > 0) {
        setQuestions(aiQuestions);
      }
      setLoading(false);
    }
    loadQuestions();
  }, [examName, questionCount, difficulty, subject]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} style={{ color: '#3b82f6' }} />
        <h2>AI is generating your mock test... (v3.0)</h2>
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (idx: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQuestion.id]: idx });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  const handleSubmit = async () => {
    const score = calculateScore();
    setIsSubmitted(true);
    setShowAnalysis(true);

    // Save to Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase.from('test_results').insert({
          user_id: session.user.id,
          exam_name: examName,
          subject: subject,
          score: score,
          total_questions: questions.length,
          difficulty: difficulty
        });
        if (error) console.error("Error saving score:", error);
      }
    } catch (err) {
      console.error("Failed to save results:", err);
    }
  };

  if (showRevision) {
    return (
      <div className={styles.analysisContainer}>
        <div className={styles.analysisHeader}>
          <button onClick={() => setShowRevision(false)} className={styles.backBtn}><ChevronLeft size={20} /> Back to Analysis</button>
          <h2>Revision Plan</h2>
        </div>
        <RevisionSchedule />
      </div>
    );
  }

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
                <div className={styles.qText}><LatexText text={q.text} /></div>
                <div className={styles.optionsList}>
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correctAnswer;
                    const isSelected = answers[q.id] === oIdx;
                    return (
                      <div key={oIdx} className={`${styles.option} ${isCorrect ? styles.correct : ''} ${isSelected && !isCorrect ? styles.wrong : ''}`}>
                        <LatexText text={opt} />
                        {isCorrect && <CheckCircle2 size={16} className={styles.statusIcon} />}
                        {isSelected && !isCorrect && <AlertCircle size={16} className={styles.statusIcon} />}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.explanation}>
                  <strong>AI Explanation:</strong>
                  <div style={{ marginTop: '0.5rem' }}><LatexText text={q.explanation} /></div>
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
              <button 
                className={styles.scheduleBtn}
                onClick={() => setShowRevision(true)}
              >
                Generate Revision Schedule
              </button>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span className={styles.qNum}>Question {currentIdx + 1} of {questions.length}</span>
                <span className={styles.topicTag}>{currentQuestion.topic}</span>
              </div>
              <button 
                className={`${styles.markBtn} ${marked[currentQuestion.id] ? styles.isMarked : ''}`}
                onClick={() => setMarked({ ...marked, [currentQuestion.id]: !marked[currentQuestion.id] })}
              >
                {marked[currentQuestion.id] ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                {marked[currentQuestion.id] ? 'Marked' : 'Mark for Review'}
              </button>
            </div>
            <div className={styles.questionText}><LatexText text={currentQuestion.text} /></div>
            <div className={styles.optionsGrid}>
              {currentQuestion.options.map((option, idx) => (
                <button 
                  key={idx}
                  className={`${styles.optionBtn} ${answers[currentQuestion.id] === idx ? styles.selected : ''}`}
                  onClick={() => handleOptionSelect(idx)}
                >
                  <span className={styles.optionLabel}>{String.fromCharCode(65 + idx)}</span>
                  <LatexText text={option} />
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
                  className={`
                    ${styles.paletteItem} 
                    ${currentIdx === idx ? styles.active : ''} 
                    ${answers[q.id] !== undefined ? styles.answered : ''}
                    ${marked[q.id] ? styles.marked : ''}
                  `}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}><span className={`${styles.dot} ${styles.answered}`}></span> Answered</div>
              <div className={styles.legendItem}><span className={`${styles.dot} ${styles.marked}`}></span> For Review</div>
              <div className={styles.legendItem}><span className={styles.dot}></span> Unvisited</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MockTest;
