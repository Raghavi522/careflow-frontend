import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import AiModal from '../components/AiModal';
import { ClipboardList, Eye, Plus } from 'lucide-react';

const PrescriptionsPage = () => {
  const { isDoctor } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const endpoint = isDoctor ? '/api/doctors/prescriptions' : '/api/patients/prescriptions';
      const res = await api.get(endpoint);
      setPrescriptions(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <div className="app-container">
      <Sidebar onOpenAi={() => setIsAiOpen(true)} />

      <div className="main-wrapper">
        <Navbar
          title="Prescriptions & Medication Management"
          subtitle="Electronic medication records and multi-item therapeutic regimens"
          onOpenAi={() => setIsAiOpen(true)}
        />

        <main className="content-body">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <ClipboardList size={18} color="#8b5cf6" />
                <span>Prescription Directory ({prescriptions.length})</span>
              </h4>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner spinner-primary" style={{ width: 32, height: 32 }}></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rx #</th>
                        <th>Patient</th>
                        <th>Prescribing Doctor</th>
                        <th>Date</th>
                        <th>Items Count</th>
                        <th>General Advice</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No prescriptions on record.
                          </td>
                        </tr>
                      ) : (
                        prescriptions.map((p) => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600 }}>RX-{p.id}</td>
                            <td style={{ fontWeight: 600 }}>{p.patientName}</td>
                            <td>Dr. {p.doctorName}</td>
                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td>{p.items?.length || 0} medications</td>
                            <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.generalInstructions || 'Standard guidelines apply'}
                            </td>
                            <td>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setSelectedPrescription(p)}
                              >
                                <Eye size={14} /> View Rx
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Prescription Details Modal */}
      <Modal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        title="Electronic Prescription (Rx) Details"
      >
        {selectedPrescription && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block' }}>Patient: {selectedPrescription.patientName}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Prescribed by Dr. {selectedPrescription.doctorName} on {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Badge status="ACTIVE" text="Verified Rx" />
            </div>

            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Prescribed Medications:</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedPrescription.items?.map((item, idx) => (
                <div key={idx} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.95rem' }}>
                    {item.medicineName}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    <span><strong>Dosage:</strong> {item.dosage}</span>
                    <span><strong>Frequency:</strong> {item.frequency}</span>
                    <span><strong>Duration:</strong> {item.duration}</span>
                  </div>
                  {item.instructions && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Instructions: {item.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedPrescription.generalInstructions && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#eff6ff', borderRadius: 8, fontSize: '0.85rem', color: '#1e40af' }}>
                <strong>General Advice:</strong> {selectedPrescription.generalInstructions}
              </div>
            )}
          </div>
        )}
      </Modal>

      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default PrescriptionsPage;
