"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { BookOpen, Brain, Zap, Target, Award, BarChart3, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExamCard from '@/components/ExamCard';
import MockTest from '@/components/MockTest';
import RevisionSchedule from '@/components/RevisionSchedule';
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
  const [session, setSession] = useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectExam = (id: string) => {
    setSelectedExam(id);
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
      {selectedExam ? (
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
            onBack={() => setSelectedExam(null)} 
          />
        </motion.main>
      ) : (
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem', marginBottom: '6rem' }}>
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
                <RevisionSchedule />
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
