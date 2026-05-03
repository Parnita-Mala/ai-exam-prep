import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, X } from 'lucide-react';
import { InlineMath } from 'react-katex';

interface AIDoubtSolverProps {
  questionText: string;
  explanation: string;
  onClose: () => void;
}

const AIDoubtSolver: React.FC<AIDoubtSolverProps> = ({ questionText, explanation, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          context: { questionText, explanation }
        })
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, { role: 'ai', content: data.message }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const LatexText: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\$.*?\$)/g);
    return (
      <span>
        {parts.map((part, idx) => (
          part.startsWith('$') && part.endsWith('$') ? 
          <InlineMath key={idx} math={part.slice(1, -1)} /> : 
          <span key={idx}>{part}</span>
        ))}
      </span>
    );
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '2rem', 
      right: '2rem', 
      width: '400px', 
      height: '550px', 
      background: '#1a1a1a', 
      border: '1px solid rgba(255,255,255,0.1)', 
      borderRadius: '24px', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageSquare size={20} color="#3b82f6" />
          <h4 style={{ margin: 0 }}>AI Doubt Solver</h4>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <strong>Context:</strong> "{questionText.slice(0, 60)}..."
        </div>
        
        {messages.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
            padding: '0.75rem 1rem',
            borderRadius: '16px',
            maxWidth: '85%',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            <LatexText text={m.content} />
          </div>
        ))}
        {loading && <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto', color: '#3b82f6' }} />}
      </div>

      <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a doubt about this problem..."
            style={{ 
              flex: 1, 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', 
              padding: '0.75rem', 
              color: '#fff',
              outline: 'none'
            }}
          />
          <button 
            onClick={handleSend}
            style={{ padding: '0.75rem', borderRadius: '12px', background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDoubtSolver;
