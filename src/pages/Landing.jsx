import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  HeartPulse,
  Calendar,
  Stethoscope,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  Users
} from 'lucide-react';
import AiModal from '../components/AiModal';

const Landing = () => {
  const { isAuthenticated, user, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          api.get('/api/departments'),
          api.get('/api/doctors/public')
        ]);
        setDepartments(deptRes.data || []);
        setDoctors(docRes.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner */}
      <div style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '0.5rem 2rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Phone size={14} color="#38bdf8" /> 24/7 Emergency Line: (555) 0199-CARE
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="#38bdf8" /> 100 Medical Center Way, Suite 100
          </span>
        </div>
        <div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} color="#10b981" /> Outpatient Clinics: Mon-Sat 8:00 AM - 8:00 PM
          </span>
        </div>
      </div>

      {/* Navigation Header */}
      <nav style={{ padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #0284c7, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>CareFlow</h1>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Hospital Operations & Patient Care Management</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ color: '#0284c7', borderColor: '#bae6fd' }}
            onClick={() => setIsAiOpen(true)}
          >
            <Sparkles size={16} />
            <span>AI Assistant</span>
          </button>

          {isAuthenticated ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(getDashboardPath(user.role))}
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Patient Register</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} /> Next-Generation Integrated Hospital Management System
          </span>
          <h1>Centralized Clinical Excellence & Patient Care Workflow</h1>
          <p>
            CareFlow unifies patient registration, doctor consultations, real-time appointment conflict prevention, digital multi-medicine prescriptions, diagnostic laboratory workflows, transparent billing, and AI clinical assistance.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
              <span>Book Appointment Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              <span>Hospital Staff Portal</span>
            </Link>
          </div>

          {/* Development Demo Credentials Box */}
          <div className="demo-credentials-box">
            <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              🚀 Quick Demo Access (Pre-seeded Accounts)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
              Click any role on the Login Page to instantly test all full-stack flows:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.75rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
                <strong>Admin:</strong> admin@careflow.com / Admin@123
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
                <strong>Doctor:</strong> doctor@careflow.com / Doctor@123
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
                <strong>Reception:</strong> reception@careflow.com / Reception@123
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
                <strong>Lab Tech:</strong> lab@careflow.com / Lab@123
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
                <strong>Patient:</strong> patient@careflow.com / Patient@123
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Clinical Features */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Comprehensive Hospital Operations
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 650, margin: '0 auto' }}>
            Engineered for high reliability, strict role-based access control, and seamless communication across hospital departments.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Conflict-Free Scheduling</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Backend-enforced calendar engine prevents double-booking. Patients and receptionists schedule with real-time doctor availability.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Stethoscope size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Consultations & Prescriptions</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Physicians record diagnosis, symptoms, clinical notes, and prescribe multi-item medication regimens with exact dosages and frequencies.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <FlaskConical size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Diagnostic Laboratory Hub</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Lab technicians track test requests from status REQUESTED to IN_PROGRESS to COMPLETED, recording detailed clinical findings and ranges.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Google Gemini AI Assistant</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Secure backend integration assisting in patient FAQs, appointment preparation checklists, and structured doctor consultation summaries.
            </p>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section style={{ backgroundColor: '#f1f5f9', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Hospital Clinical Departments
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>World-class specialized care across major medical disciplines</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {departments.map((dept) => (
              <div key={dept.id} style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
                  {dept.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {dept.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', backgroundColor: '#0f172a', color: '#94a3b8', padding: '2.5rem 2rem', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
            <HeartPulse size={20} color="#38bdf8" />
            CareFlow Hospital Operations
          </div>
          <div>
            Academic Healthcare Project • Full-Stack Java Spring Boot, React, PostgreSQL & Gemini AI
          </div>
        </div>
      </footer>

      {/* AI Modal */}
      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default Landing;
