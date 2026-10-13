import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, Bot, ShieldAlert, X } from 'lucide-react';

const AiModal = ({ isOpen, onClose, initialType = 'FAQ', initialContext = '' }) => {
  const { user, isDoctor, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(initialType);
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState(initialContext);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am CareFlow AI Assistant. I can help answer hospital FAQs, prepare appointment checklists, structure consultation notes, or generate operational summaries.'
    }
  ]);
  const [disclaimer, setDisclaimer] = useState('AI-generated information is for assistance only and should not replace professional medical judgment.');

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = prompt.trim();
    setPrompt('');
    setChatHistory((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const endpoint = activeTab === 'CONSULTATION_SUMMARY' ? '/api/ai/summarize' :
                       activeTab === 'APPOINTMENT_PREP' ? '/api/ai/appointment-prep' :
                       activeTab === 'ADMIN_SUMMARY' ? '/api/ai/admin-summary' :
                       '/api/ai/chat';

      const response = await api.post(endpoint, {
        prompt: userMessage,
        type: activeTab,
        context: context
      });

      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: response.data.response }
      ]);
      if (response.data.disclaimer) {
        setDisclaimer(response.data.disclaimer);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I encountered an error communicating with the CareFlow backend AI service.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = {
    FAQ: [
      'What documents are needed for patient registration?',
      'What are the hospital departments and specialties?',
      'What should I bring for my upcoming appointment?'
    ],
    APPOINTMENT_PREP: [
      'Cardiology consultation preparation checklist',
      'What should I prepare for a fasting blood panel test?',
      'Questions to ask my neurologist regarding frequent migraines'
    ],
    CONSULTATION_SUMMARY: [
      'Patient with mild bilateral knee pain on exertion, BP 120/80, recommended weight management and quad strengthening.',
      'Patient reports 3-day history of productive cough, mild fever 99.8F, normal oxygen saturation, prescribed rest and hydration.'
    ],
    ADMIN_SUMMARY: [
      'Summarize current hospital resource allocation and appointment wait-time efficiency.',
      'Provide operational insights on outstanding invoices and revenue cycle.'
    ]
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>CareFlow AI Clinical Assistant</h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Powered by Google Gemini</span>
            </div>
          </div>
          <button type="button" className="btn btn-outline btn-icon btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto'
        }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'FAQ' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('FAQ')}
          >
            Hospital FAQ
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'APPOINTMENT_PREP' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('APPOINTMENT_PREP')}
          >
            Appointment Prep
          </button>
          {(isDoctor || isAdmin) && (
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'CONSULTATION_SUMMARY' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('CONSULTATION_SUMMARY')}
            >
              Consultation Summarizer
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'ADMIN_SUMMARY' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('ADMIN_SUMMARY')}
            >
              Operations Summary
            </button>
          )}
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {/* Medical Disclaimer Banner */}
          <div className="ai-disclaimer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              <ShieldAlert size={15} />
              <span>Medical Safety Notice</span>
            </div>
            {disclaimer}
          </div>

          {/* Quick suggestions */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Suggested Inquiries:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
              {(sampleQuestions[activeTab] || []).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', textAlign: 'left' }}
                  onClick={() => setPrompt(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation history */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={msg.role === 'user' ? 'ai-chat-bubble-user' : 'ai-chat-bubble-assistant'}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="ai-chat-bubble-assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="spinner spinner-primary" style={{ width: 16, height: 16 }}></div>
                <span>CareFlow AI is thinking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Input */}
        <form onSubmit={handleSend} className="modal-footer" style={{ padding: '0.85rem 1.5rem', background: '#fff' }}>
          <input
            type="text"
            className="form-control"
            placeholder={
              activeTab === 'FAQ' ? 'Ask a question about hospital departments, schedules, or policies...' :
              activeTab === 'APPOINTMENT_PREP' ? 'Enter appointment details for a preparation checklist...' :
              activeTab === 'CONSULTATION_SUMMARY' ? 'Enter clinical consultation notes to summarize...' :
              'Ask for operational insights and statistical breakdown...'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !prompt.trim()}>
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiModal;
