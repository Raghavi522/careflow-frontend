import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import AiModal from '../components/AiModal';
import { Stethoscope, Building2, MapPin, DollarSign, Search } from 'lucide-react';

const DoctorsDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/doctors/public');
        setDoctors(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filtered = doctors.filter((d) =>
    d.fullName.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    d.departmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar onOpenAi={() => setIsAiOpen(true)} />

      <div className="main-wrapper">
        <Navbar
          title="Hospital Physicians & Medical Specialists"
          subtitle="Directory of attending consultants, qualifications, and clinic locations"
          onOpenAi={() => setIsAiOpen(true)}
        />

        <main className="content-body">
          <div style={{ marginBottom: '1.5rem', maxWidth: 400, position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by physician, specialty, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner spinner-primary" style={{ width: 32, height: 32 }}></div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filtered.map((doc) => (
                <div key={doc.id} className="card" style={{ marginBottom: 0 }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Stethoscope size={22} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{doc.fullName}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>{doc.specialization}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={15} color="#94a3b8" />
                        <span><strong>Department:</strong> {doc.departmentName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={15} color="#94a3b8" />
                        <span><strong>Office:</strong> {doc.roomNumber || 'Consultation Suite'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <DollarSign size={15} color="#94a3b8" />
                        <span><strong>Consultation Fee:</strong> ${doc.consultationFee}</span>
                      </div>
                    </div>

                    {doc.qualification && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Qualifications: {doc.qualification}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default DoctorsDirectory;
