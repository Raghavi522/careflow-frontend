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
  ClipboardList,
  FlaskConical,
  Receipt,
  Plus,
  XCircle,
  Eye,
  CheckCircle,
  User,
  CreditCard,
  AlertCircle
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedLabTest, setSelectedLabTest] = useState(null);

  // Form states
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    appointmentDateTime: '',
    reason: '',
    notes: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, docRes, profRes] = await Promise.all([
        api.get('/api/patients/dashboard'),
        api.get('/api/doctors/public'),
        api.get('/api/patients/profile')
      ]);
      setDashboard(dashRes.data);
      setDoctors(docRes.data || []);
      setProfile(profRes.data);
    } catch (e) {
      console.error('Error fetching patient data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/patients/appointments', {
        doctorId: Number(bookingForm.doctorId),
        appointmentDateTime: bookingForm.appointmentDateTime,
        reason: bookingForm.reason,
        notes: bookingForm.notes
      });
      setBookingSuccess('Appointment successfully booked!');
      setBookingForm({ doctorId: '', appointmentDateTime: '', reason: '', notes: '' });
      await fetchDashboardData();
      setTimeout(() => {
        setIsBookModalOpen(false);
        setBookingSuccess('');
      }, 1500);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setBookingError(err.response.data.message);
      } else {
        setBookingError('Failed to book appointment. Please verify details.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/api/patients/appointments/${id}/cancel`);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handlePayBill = async (billId) => {
    if (!window.confirm('Proceed with secure simulated card payment?')) return;
    try {
      await api.put(`/api/admin/bills/${billId}/pay`, { paymentMethod: 'Card (Patient Portal)' });
      await fetchDashboardData();
      alert('Payment successful! Your invoice has been updated.');
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    }
  };

  return (
    <div className="app-container">
      <Sidebar onOpenAi={() => setIsAiOpen(true)} />

      <div className="main-wrapper">
        <Navbar
          title={`Welcome back, ${user?.fullName || 'Patient'}`}
          subtitle="CareFlow Patient Health Portal & Appointment Center"
          onOpenAi={() => setIsAiOpen(true)}
        />

        <main className="content-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div className="spinner spinner-primary" style={{ width: 40, height: 40 }}></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your medical records...</p>
            </div>
          ) : (
            <>
              {/* Quick Actions & Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Patient Health Overview
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Blood Group: {profile?.bloodGroup || 'Not set'} • ID: CF-PT-{user?.id}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setIsProfileModalOpen(true)}>
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setIsBookModalOpen(true)}>
                    <Plus size={16} />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <StatCard
                  icon={Calendar}
                  label="Upcoming Appointments"
                  value={dashboard?.upcomingAppointments?.length || 0}
                  color="#0284c7"
                  bgColor="#e0f2fe"
                />
                <StatCard
                  icon={CalendarCheck}
                  label="Completed Visits"
                  value={dashboard?.completedAppointments?.length || 0}
                  color="#10b981"
                  bgColor="#d1fae5"
                />
                <StatCard
                  icon={ClipboardList}
                  label="Active Prescriptions"
                  value={dashboard?.recentPrescriptions?.length || 0}
                  color="#8b5cf6"
                  bgColor="#ede9fe"
                />
                <StatCard
                  icon={Receipt}
                  label="Pending Invoices"
                  value={`$${dashboard?.totalPendingAmount || 0}`}
                  color="#f59e0b"
                  bgColor="#fef3c7"
                />
              </div>

              {/* Upcoming Appointments */}
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">
                    <Calendar size={18} color="var(--primary)" />
                    <span>Upcoming Scheduled Appointments</span>
                  </h4>
                  <button className="btn btn-primary btn-sm" onClick={() => setIsBookModalOpen(true)}>
                    <Plus size={14} /> Schedule New
                  </button>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Doctor</th>
                          <th>Specialty / Dept</th>
                          <th>Date & Time</th>
                          <th>Room</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!dashboard?.upcomingAppointments || dashboard.upcomingAppointments.length === 0) ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                              No upcoming appointments. Click "Schedule New" to book an appointment with a specialist.
                            </td>
                          </tr>
                        ) : (
                          dashboard.upcomingAppointments.map((apt) => (
                            <tr key={apt.id}>
                              <td style={{ fontWeight: 600 }}>{apt.doctorName}</td>
                              <td>{apt.specialization} ({apt.departmentName})</td>
                              <td>{new Date(apt.appointmentDateTime).toLocaleString()}</td>
                              <td>{apt.roomNumber || 'TBD'}</td>
                              <td><Badge status={apt.status} /></td>
                              <td>
                                {apt.status === 'SCHEDULED' && (
                                  <button
                                    className="btn btn-outline btn-sm btn-danger"
                                    onClick={() => handleCancelAppointment(apt.id)}
                                  >
                                    <XCircle size={14} /> Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Two Column Section: Prescriptions & Lab Tests */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                {/* Prescriptions */}
                <div className="card" style={{ marginBottom: 0 }}>
                  <div className="card-header">
                    <h4 className="card-title">
                      <ClipboardList size={18} color="#8b5cf6" />
                      <span>Recent Prescriptions</span>
                    </h4>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Prescribed By</th>
                            <th>Date</th>
                            <th>Medicines</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!dashboard?.recentPrescriptions || dashboard.recentPrescriptions.length === 0) ? (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                                No prescriptions on file.
                              </td>
                            </tr>
                          ) : (
                            dashboard.recentPrescriptions.map((p) => (
                              <tr key={p.id}>
                                <td style={{ fontWeight: 600 }}>{p.doctorName}</td>
                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td>{p.items?.length || 0} item(s)</td>
                                <td>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setSelectedPrescription(p)}
                                  >
                                    <Eye size={14} /> View
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Lab Results */}
                <div className="card" style={{ marginBottom: 0 }}>
                  <div className="card-header">
                    <h4 className="card-title">
                      <FlaskConical size={18} color="#0d9488" />
                      <span>Diagnostic Lab Results</span>
                    </h4>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Test Name</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!dashboard?.recentLabResults || dashboard.recentLabResults.length === 0) ? (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                                No lab requests on file.
                              </td>
                            </tr>
                          ) : (
                            dashboard.recentLabResults.map((lab) => (
                              <tr key={lab.id}>
                                <td style={{ fontWeight: 600 }}>{lab.testName}</td>
                                <td>{lab.testCategory}</td>
                                <td><Badge status={lab.status} /></td>
                                <td>
                                  {lab.status === 'COMPLETED' ? (
                                    <button
                                      className="btn btn-outline btn-sm"
                                      onClick={() => setSelectedLabTest(lab)}
                                    >
                                      <Eye size={14} /> Report
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In progress</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Section */}
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">
                    <Receipt size={18} color="#f59e0b" />
                    <span>Invoices & Medical Bills</span>
                  </h4>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Description</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!dashboard?.pendingBills || dashboard.pendingBills.length === 0) ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                              No outstanding bills. All accounts are settled!
                            </td>
                          </tr>
                        ) : (
                          dashboard.pendingBills.map((b) => (
                            <tr key={b.id}>
                              <td>INV-{b.id}</td>
                              <td style={{ fontWeight: 500 }}>{b.description}</td>
                              <td>{new Date(b.billDate).toLocaleDateString()}</td>
                              <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${b.amount}</td>
                              <td><Badge status={b.status} /></td>
                              <td>
                                {b.status === 'PENDING' && (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handlePayBill(b.id)}
                                  >
                                    <CreditCard size={14} /> Pay Now
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Doctor Appointment"
      >
        {bookingError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{bookingError}</span>
          </div>
        )}
        {bookingSuccess && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CheckCircle size={18} />
            <span>{bookingSuccess}</span>
          </div>
        )}

        <form onSubmit={handleBookAppointment}>
          <div className="form-group">
            <label className="form-label">Select Doctor & Specialty *</label>
            <select
              className="form-control"
              value={bookingForm.doctorId}
              onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
              required
            >
              <option value="">-- Choose Attending Physician --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.fullName} — {doc.specialization} ({doc.departmentName}) • Fee: ${doc.consultationFee}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Date & Time *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={bookingForm.appointmentDateTime}
              onChange={(e) => setBookingForm({ ...bookingForm, appointmentDateTime: e.target.value })}
              required
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
              Note: System automatically detects physician schedule conflicts to prevent double-booking.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Symptom / Reason for Visit *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Follow-up ECG, recurrent headaches, knee stiffness"
              value={bookingForm.reason}
              onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Medical Notes for Doctor</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Any ongoing medications or relevant history..."
              value={bookingForm.notes}
              onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Verifying Availability...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Prescription View Modal */}
      <Modal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        title="Prescription Details"
      >
        {selectedPrescription && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block' }}>Doctor: {selectedPrescription.doctorName}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Date: {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Badge status="ACTIVE" text="Official Rx" />
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

      {/* Lab Test Results Modal */}
      <Modal
        isOpen={!!selectedLabTest}
        onClose={() => setSelectedLabTest(null)}
        title="Official Diagnostic Laboratory Report"
      >
        {selectedLabTest && (
          <div>
            <div style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{selectedLabTest.testName}</h4>
                <Badge status="COMPLETED" />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Category: {selectedLabTest.testCategory} • Sample: {selectedLabTest.sampleType}
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clinical Findings:</span>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {selectedLabTest.findings || 'Findings recorded.'}
              </div>
            </div>

            {selectedLabTest.normalRange && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reference Biological Range:</span>
                <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {selectedLabTest.normalRange}
                </div>
              </div>
            )}

            {selectedLabTest.comments && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Technician Diagnostic Comments:</span>
                <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: '0.85rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  {selectedLabTest.comments}
                </div>
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Verified by: {selectedLabTest.technicianName || 'Laboratory Staff'}</span>
              <span>Completed: {selectedLabTest.completedAt ? new Date(selectedLabTest.completedAt).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Patient Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Patient Profile & Health Details"
      >
        {profile && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</span>
                <p style={{ fontWeight: 600 }}>{profile.fullName}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</span>
                <p style={{ fontWeight: 600 }}>{profile.email}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date of Birth</span>
                <p style={{ fontWeight: 600 }}>{profile.dateOfBirth || 'Not specified'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blood Group</span>
                <p style={{ fontWeight: 600 }}><Badge status="INFO" text={profile.bloodGroup || 'Unknown'} /></p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gender</span>
                <p style={{ fontWeight: 600 }}>{profile.gender || 'Not specified'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</span>
                <p style={{ fontWeight: 600 }}>{profile.phone || 'N/A'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</span>
              <p style={{ fontWeight: 500 }}>{profile.address || 'N/A'}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Emergency Contact</span>
              <p style={{ fontWeight: 500 }}>{profile.emergencyContact || 'N/A'}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Documented Medical History</span>
              <p style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {profile.medicalHistoryNotes || 'No chronic conditions or allergies on file.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Clinical Assistant Modal */}
      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default PatientDashboard;
