"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { BookOpen, Brain, Zap, Target, Award, BarChart3, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExamCard from '@/components/ExamCard';
import MockTest from '@/components/MockTest';
import RevisionSchedule from '@/components/RevisionSchedule';
import PerformanceChart from '@/components/PerformanceChart';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';

const EXAMS = [
  { id: 'jee', name: 'JEE', fullName: 'Joint Entrance Examination', icon: Target, color: '#3b82f6' },
  { id: 'neet', name: 'NEET', fullName: 'National Eligibility cum Entrance Test', icon: Brain, color: '#10b981' },
  { id: 'upsc', name: 'UPSC', fullName: 'Union Public Service Commission', icon: Award, color: '#f59e0b' },
  { id: 'ssc', name: 'SSC', fullName: 'Staff Selection Commission', icon: Zap, color: '#6366f1' },
  { id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering', icon: BookOpen, color: '#ec4899' },
];

export default function Home() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [config, setConfig] = useState<{ count: number; difficulty: string; subject: string } | null>(null);
  const [tempConfig, setTempConfig] = useState<{ count: number; difficulty: string; subject: string }>({ 
    count: 10, 
    difficulty: 'Medium',
    subject: 'Full Mock Test'
  });
  const [session, setSession] = useState<any>(null);
  const [testHistory, setTestHistory] = useState<any[]>([]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchHistory(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchHistory(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(10);
    
    if (data) {
      const formatted = data.map(item => ({
        date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round((item.score / item.total_questions) * 100)
      }));
      setTestHistory(formatted);
    }
  };

  const handleSelectExam = (id: string) => {
    setSelectedExam(id);
    setTempConfig({ count: 10, difficulty: 'Medium', subject: 'Full Mock Test' });
  };

  const startTest = () => {
    setConfig(tempConfig);
  };

  if (!session) {
    return (
      <main className="animate-fade-in">
        <div className="bg-gradient-mesh" />
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem' }}>
          <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Competitive Exam Prep
            </h1>
          </header>
          <Auth />
        </div>
      </main>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {selectedExam && config && (
        <motion.main 
          key="test"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-gradient-mesh" />
          <MockTest 
            examId={selectedExam} 
            examName={EXAMS.find(e => e.id === selectedExam)?.name || ''} 
            questionCount={config.count}
            difficulty={config.difficulty}
            subject={config.subject}
            onBack={() => {
              setSelectedExam(null);
              setConfig(null);
            }} 
          />
        </motion.main>
      )}

      {selectedExam && !config && (
        <motion.div 
          key="config"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{ 
            position: 'fixed', 
            top: '2rem', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '1.5rem 2rem',
            width: '95%',
            maxWidth: '500px',
            maxHeight: 'calc(100vh - 4rem)',
            overflowY: 'auto',
            textAlign: 'center',
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}
        >
          <h2 style={{ marginBottom: '2rem' }}>Configure Your {EXAMS.find(e => e.id === selectedExam)?.name} Test</h2>
          
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Focus Area (Subject)</label>
            <select 
              value={tempConfig.subject}
              onChange={(e) => setTempConfig({ ...tempConfig, subject: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="Full Mock Test" style={{ background: '#1a1a1a' }}>Full Mock Test</option>
              {selectedExam === 'jee' && (
                <>
                  <option value="Physics" style={{ background: '#1a1a1a' }}>Physics</option>
                  <option value="Chemistry" style={{ background: '#1a1a1a' }}>Chemistry</option>
                  <option value="Mathematics" style={{ background: '#1a1a1a' }}>Mathematics</option>
                </>
              )}
              {selectedExam === 'neet' && (
                <>
                  <option value="Biology" style={{ background: '#1a1a1a' }}>Biology</option>
                  <option value="Physics" style={{ background: '#1a1a1a' }}>Physics</option>
                  <option value="Chemistry" style={{ background: '#1a1a1a' }}>Chemistry</option>
                </>
              )}
              {selectedExam === 'upsc' && (
                <>
                  <option value="History" style={{ background: '#1a1a1a' }}>History</option>
                  <option value="Polity" style={{ background: '#1a1a1a' }}>Polity</option>
                  <option value="Economy" style={{ background: '#1a1a1a' }}>Economy</option>
                  <option value="Geography" style={{ background: '#1a1a1a' }}>Geography</option>
                </>
              )}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Difficulty Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {['Easy', 'Medium', 'Hard', 'Expert'].map(d => (
                <button 
                  key={d}
                  onClick={() => setTempConfig({ ...tempConfig, difficulty: d })}
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '12px', 
                    background: tempConfig.difficulty === d ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Number of Questions</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[10, 20, 30, 50].map(c => (
                <button 
                  key={c}
                  onClick={() => setTempConfig({ ...tempConfig, count: c })}
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '12px', 
                    background: tempConfig.count === c ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setSelectedExam(null)}
              style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={startTest}
              style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Start Mock Test
            </button>
          </div>
        </motion.div>
      )}

      {!selectedExam && (
        <motion.main 
          key="dashboard"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-gradient-mesh" />
          
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', padding: '0.5rem 1.25rem', borderRadius: '30px', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{session.user.email}</span>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                >
                  Logout
                </button>
              </div>
            </div>

            <motion.header 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
              <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI Competitive Exam Prep
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
                Master your goals with AI-powered mock tests, step-by-step solutions, and personalized revision schedules.
              </p>
            </motion.header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '3rem', marginBottom: '6rem' }}>
              <section style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '2rem',
              }}>
                {EXAMS.map((exam, idx) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <ExamCard 
                      {...exam}
                      onSelect={handleSelectExam}
                    />
                  </motion.div>
                ))}
              </section>
              
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BarChart3 size={20} color="var(--primary)" />
                    Performance Trend (%)
                  </h3>
                  <PerformanceChart data={testHistory} />
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <RevisionSchedule />
                </div>
              </motion.aside>
            </div>

            <section style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '2rem',
              padding: '4rem',
              borderRadius: '32px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <FeatureItem 
                icon={Brain} 
                title="AI Content" 
                description="Questions generated to match the exact latest patterns." 
              />
              <FeatureItem 
                icon={BarChart3} 
                title="Deep Analytics" 
                description="Identify weak topics and track your progress over time." 
              />
              <FeatureItem 
                icon={Calendar} 
                title="Revision Plan" 
                description="Automated schedule tailored to your performance." 
              />
            </section>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--primary)' }}>
        <Icon size={24} />
      </div>
      <h4 style={{ fontSize: '1.25rem' }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{description}</p>
    </div>
  );
}
