import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './Auth.module.css';
import { Mail, Lock, UserPlus, LogIn } from 'lucide-react';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for confirmation!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`glass-card ${styles.authCard}`}>
        <h2 className={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className={styles.subtitle}>Join thousands of students preparing with AI</p>

        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.inputGroup}>
            <Mail size={18} className={styles.inputIcon} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && <p className={styles.message}>{message}</p>}

          <button type="submit" disabled={loading} className={styles.authBtn}>
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className={styles.toggle}>
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
          <button onClick={() => setIsSignUp(!isSignUp)} className={styles.toggleBtn}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
