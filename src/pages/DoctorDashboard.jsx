import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import AiModal from '../components/AiModal';
import {
  Calendar,
  CalendarCheck,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  Plus,
  Trash2,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  Sparkles,
  History
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isLabOrderOpen, setIsLabOrderOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Selected entities
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);

  // Forms
  const [consultationForm, setConsultationForm] = useState({
    symptoms: '',
    diagnosis: '',
    doctorNotes: ''
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    generalInstructions: '',
    items: [
      { medicineName: '', dosage: '', frequency: 'Once Daily', duration: '7 Days', instructions: 'After meals' }
    ]
  });

  const [labOrderForm, setLabOrderForm] = useState({
    testName: '',
    testCategory: 'Biochemistry',
    sampleType: 'Blood',
    notes: ''
  });

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, profRes] = await Promise.all([
        api.get('/api/doctors/dashboard'),
        api.get('/api/doctors/profile')
      ]);
      setDashboard(dashRes.data);
      setProfile(profRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartConsultation = (apt) => {
    setSelectedAppointment(apt);
    setConsultationForm({ symptoms: apt.reason || '', diagnosis: '', doctorNotes: apt.notes || '' });
    setActionError('');
    setActionSuccess('');
    setIsConsultationOpen(true);
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/doctors/consultations', {
        appointmentId: selectedAppointment.id,
        symptoms: consultationForm.symptoms,
        diagnosis: consultationForm.diagnosis,
        doctorNotes: consultationForm.doctorNotes
      });
      setActionSuccess('Consultation recorded and appointment completed!');
      await fetchData();
      setTimeout(() => {
        setIsConsultationOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to save consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPrescription = (apt) => {
    setSelectedAppointment(apt);
    setPrescriptionForm({
      generalInstructions: 'Take medications with plenty of water. Complete the entire course as prescribed.',
      items: [
        { medicineName: '', dosage: '', frequency: 'Once Daily', duration: '7 Days', instructions: 'After meals' }
      ]
    });
    setActionError('');
    setActionSuccess('');
    setIsPrescriptionOpen(true);
  };

  const addPrescriptionItem = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { medicineName: '', dosage: '', frequency: 'Twice Daily', duration: '5 Days', instructions: 'After meals' }
      ]
    }));
  };

  const removePrescriptionItem = (index) => {
    setPrescriptionForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  const handlePrescriptionItemChange = (index, field, value) => {
    setPrescriptionForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/doctors/prescriptions', {
        patientId: selectedAppointment.patientId,
        generalInstructions: prescriptionForm.generalInstructions,
        items: prescriptionForm.items
      });
      setActionSuccess('Prescription dispatched successfully!');
      await fetchData();
      setTimeout(() => {
        setIsPrescriptionOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenLabOrder = (apt) => {
    setSelectedAppointment(apt);
    setLabOrderForm({
      testName: '',
      testCategory: 'Biochemistry',
      sampleType: 'Blood',
      notes: ''
    });
    setActionError('');
    setActionSuccess('');
    setIsLabOrderOpen(true);
  };

  const handleSubmitLabOrder = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/doctors/lab-tests', {
        patientId: selectedAppointment.patientId,
        testName: labOrderForm.testName,
        testCategory: labOrderForm.testCategory,
        sampleType: labOrderForm.sampleType,
        notes: labOrderForm.notes
      });
      setActionSuccess('Diagnostic laboratory request ordered!');
      await fetchData();
      setTimeout(() => {
        setIsLabOrderOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit lab order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPatientHistory = async (patientId) => {
    try {
      const res = await api.get(`/api/doctors/patients/${patientId}/history`);
      setSelectedPatientHistory(res.data);
      setIsHistoryOpen(true);
    } catch (err) {
      alert('Unable to load patient history: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      <Sidebar onOpenAi={() => setIsAiOpen(true)} />

      <div className="main-wrapper">
        <Navbar
          title={`Clinical Workspace — ${user?.fullName || 'Physician'}`}
          subtitle={`${profile?.specialization || 'Attending Physician'} • Department of ${profile?.departmentName || 'Medicine'} • Suite ${profile?.roomNumber || '204'}`}
          onOpenAi={() => setIsAiOpen(true)}
        />

        <main className="content-body">
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              icon={Calendar}
              label="Today's Appointments"
              value={dashboard?.todayAppointments?.length || 0}
              color="#0284c7"
              bgColor="#e0f2fe"
            />
            <StatCard
              icon={CalendarCheck}
              label="Upcoming Consultations"
              value={dashboard?.upcomingAppointments?.length || 0}
              color="#10b981"
              bgColor="#d1fae5"
            />
            <StatCard
              icon={Stethoscope}
              label="Completed Encounters"
              value={dashboard?.completedConsultationsCount || 0}
              color="#8b5cf6"
              bgColor="#ede9fe"
            />
            <StatCard
              icon={FlaskConical}
              label="Pending Lab Results"
              value={dashboard?.pendingLabResults?.length || 0}
              color="#f59e0b"
              bgColor="#fef3c7"
            />
          </div>

          {/* Today's Appointments Table */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <Calendar size={18} color="var(--primary)" />
                <span>Today's Outpatient Appointments</span>
              </h4>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient Name</th>
                      <th>Chief Complaint / Reason</th>
                      <th>Status</th>
                      <th>Clinical Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!dashboard?.todayAppointments || dashboard.todayAppointments.length === 0) ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No appointments scheduled for today.
                        </td>
                      </tr>
                    ) : (
                      dashboard.todayAppointments.map((apt) => (
                        <tr key={apt.id}>
                          <td style={{ fontWeight: 600 }}>
                            {new Date(apt.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.patientPhone || apt.patientEmail}</div>
                          </td>
                          <td>{apt.reason}</td>
                          <td><Badge status={apt.status} /></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleStartConsultation(apt)}
                                >
                                  <Stethoscope size={14} /> Record Consultation
                                </button>
                              )}
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleOpenPrescription(apt)}
                              >
                                <ClipboardList size={14} /> Prescribe
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleOpenLabOrder(apt)}
                              >
                                <FlaskConical size={14} /> Order Lab
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleViewPatientHistory(apt.patientId)}
                              >
                                <History size={14} /> Medical History
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pending Lab Results Tracking */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <FlaskConical size={18} color="#d97706" />
                <span>Diagnostic Lab Orders in Transit</span>
              </h4>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Patient</th>
                      <th>Category</th>
                      <th>Requested At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!dashboard?.pendingLabResults || dashboard.pendingLabResults.length === 0) ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          No pending diagnostic orders awaiting processing.
                        </td>
                      </tr>
                    ) : (
                      dashboard.pendingLabResults.map((lab) => (
                        <tr key={lab.id}>
                          <td style={{ fontWeight: 600 }}>{lab.testName}</td>
                          <td>{lab.patientName}</td>
                          <td>{lab.testCategory} ({lab.sampleType})</td>
                          <td>{new Date(lab.requestedAt).toLocaleString()}</td>
                          <td><Badge status={lab.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Record Consultation Modal */}
      <Modal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        title="Record Clinical Consultation & Diagnosis"
        maxWidth={700}
      >
        {actionError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CheckCircle size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmitConsultation}>
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--border)' }}>
            <div><strong>Patient:</strong> {selectedAppointment?.patientName}</div>
            <div><strong>Appointment Time:</strong> {selectedAppointment && new Date(selectedAppointment.appointmentDateTime).toLocaleString()}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Observed Symptoms & Vital Signs</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Mild chest tightness on exertion, BP 130/85, resting pulse 80 bpm..."
              value={consultationForm.symptoms}
              onChange={(e) => setConsultationForm({ ...consultationForm, symptoms: e.target.value })}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Diagnosis *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Essential Hypertension / Premature Ventricular Contractions"
              value={consultationForm.diagnosis}
              onChange={(e) => setConsultationForm({ ...consultationForm, diagnosis: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Doctor's Clinical Notes & Treatment Plan</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Detailed treatment notes, dietary restrictions, follow-up instructions..."
              value={consultationForm.doctorNotes}
              onChange={(e) => setConsultationForm({ ...consultationForm, doctorNotes: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsConsultationOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Complete & Record Consultation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Multi-Item Prescription Modal */}
      <Modal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        title="Issue Medical Prescription (Multi-Item)"
        maxWidth={780}
      >
        {actionError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CheckCircle size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmitPrescription}>
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--border)' }}>
            <div><strong>Patient:</strong> {selectedAppointment?.patientName}</div>
            <div><strong>Prescribing Physician:</strong> Dr. {user?.fullName}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h5 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Medications List</h5>
            <button type="button" className="btn btn-outline btn-sm" onClick={addPrescriptionItem}>
              <Plus size={14} /> Add Medicine
            </button>
          </div>

          {prescriptionForm.items.map((item, index) => (
            <div key={index} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>Medicine #{index + 1}</span>
                {prescriptionForm.items.length > 1 && (
                  <button type="button" className="btn btn-outline btn-sm btn-danger" onClick={() => removePrescriptionItem(index)}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Medicine Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Amoxicillin, Metoprolol"
                    value={item.medicineName}
                    onChange={(e) => handlePrescriptionItemChange(index, 'medicineName', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Dosage *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 500 mg, 25 mg"
                    value={item.dosage}
                    onChange={(e) => handlePrescriptionItemChange(index, 'dosage', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Frequency *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Once Daily, Twice Daily, Every 8 hours"
                    value={item.frequency}
                    onChange={(e) => handlePrescriptionItemChange(index, 'frequency', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Duration *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 7 Days, 30 Days"
                    value={item.duration}
                    onChange={(e) => handlePrescriptionItemChange(index, 'duration', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Administration Instructions</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Take with water after breakfast"
                  value={item.instructions}
                  onChange={(e) => handlePrescriptionItemChange(index, 'instructions', e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">General Advice & Dietary Precautions</label>
            <textarea
              className="form-control"
              rows="2"
              value={prescriptionForm.generalInstructions}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, generalInstructions: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsPrescriptionOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Issuing Prescription...' : 'Issue Prescription'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Lab Test Modal */}
      <Modal
        isOpen={isLabOrderOpen}
        onClose={() => setIsLabOrderOpen(false)}
        title="Request Diagnostic Laboratory Investigation"
      >
        {actionError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CheckCircle size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmitLabOrder}>
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--border)' }}>
            <div><strong>Patient:</strong> {selectedAppointment?.patientName}</div>
            <div><strong>Ordering Physician:</strong> Dr. {user?.fullName}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Diagnostic Test Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Complete Blood Count (CBC), Lipid Panel, Serum Creatinine"
              value={labOrderForm.testName}
              onChange={(e) => setLabOrderForm({ ...labOrderForm, testName: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Test Category</label>
              <select
                className="form-control"
                value={labOrderForm.testCategory}
                onChange={(e) => setLabOrderForm({ ...labOrderForm, testCategory: e.target.value })}
              >
                <option value="Biochemistry">Biochemistry</option>
                <option value="Hematology">Hematology</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Immunology">Immunology</option>
                <option value="Radiology">Radiology</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sample Specimen Type</label>
              <select
                className="form-control"
                value={labOrderForm.sampleType}
                onChange={(e) => setLabOrderForm({ ...labOrderForm, sampleType: e.target.value })}
              >
                <option value="Blood (Serum)">Blood (Serum)</option>
                <option value="Whole Blood (EDTA)">Whole Blood (EDTA)</option>
                <option value="Urine">Urine</option>
                <option value="Swab">Swab</option>
                <option value="Saliva">Saliva</option>
                <option value="Biopsy">Biopsy</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Indication / Special Notes</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Clinical reason for lab request..."
              value={labOrderForm.notes}
              onChange={(e) => setLabOrderForm({ ...labOrderForm, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsLabOrderOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Dispatching...' : 'Dispatch Lab Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Patient Medical History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Complete Patient Longitudinal Medical History"
        maxWidth={750}
      >
        {selectedPatientHistory && (
          <div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedPatientHistory.patient?.fullName}</h4>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                DOB: {selectedPatientHistory.patient?.dateOfBirth || 'N/A'} • Blood Group: {selectedPatientHistory.patient?.bloodGroup || 'N/A'} • Emergency: {selectedPatientHistory.patient?.emergencyContact || 'N/A'}
              </p>
              {selectedPatientHistory.patient?.medicalHistoryNotes && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#b91c1c' }}>
                  <strong>Recorded Allergies / Conditions:</strong> {selectedPatientHistory.patient?.medicalHistoryNotes}
                </div>
              )}
            </div>

            <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Prior Consultations:</h5>
            {(!selectedPatientHistory.consultations || selectedPatientHistory.consultations.length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No past consultations recorded.</p>
            ) : (
              selectedPatientHistory.consultations.map((c) => (
                <div key={c.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 8, marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Attending: Dr. {c.doctorName}</span>
                    <span>{new Date(c.consultationDateTime).toLocaleString()}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--primary-dark)', marginTop: '0.2rem' }}>
                    Diagnosis: {c.diagnosis}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Notes: {c.doctorNotes}
                  </div>
                </div>
              ))
            )}

            <h5 style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>Prior Diagnostic Lab Reports:</h5>
            {(!selectedPatientHistory.labTests || selectedPatientHistory.labTests.length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No lab records found.</p>
            ) : (
              selectedPatientHistory.labTests.map((l) => (
                <div key={l.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 8, marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{l.testName}</strong>
                    <Badge status={l.status} />
                  </div>
                  {l.findings && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Findings: {l.findings}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* AI Assistant Modal */}
      <AiModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        initialType="CONSULTATION_SUMMARY"
      />
    </div>
  );
};

export default DoctorDashboard;
