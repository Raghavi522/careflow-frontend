import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import AiModal from '../components/AiModal';
import {
  Calendar,
  Users,
  UserPlus,
  Stethoscope,
  Search,
  Plus,
  CalendarCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Edit
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRegisterPatientOpen, setIsRegisterPatientOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Form states
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    email: '',
    password: 'Patient@123',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDateTime: '',
    reason: '',
    notes: ''
  });

  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, patRes, docRes] = await Promise.all([
        api.get('/api/receptionist/dashboard'),
        api.get(`/api/receptionist/patients?query=${searchQuery}`),
        api.get('/api/receptionist/doctors')
      ]);
      setDashboard(dashRes.data);
      setPatients(patRes.data || []);
      setDoctors(docRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/receptionist/patients', patientForm);
      setActionSuccess('Patient registered successfully!');
      setPatientForm({
        fullName: '',
        email: '',
        password: 'Patient@123',
        phone: '',
        dateOfBirth: '',
        gender: 'Male',
        bloodGroup: 'O+',
        address: '',
        emergencyContact: ''
      });
      await fetchData();
      setTimeout(() => {
        setIsRegisterPatientOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/receptionist/appointments', {
        patientId: Number(scheduleForm.patientId),
        doctorId: Number(scheduleForm.doctorId),
        appointmentDateTime: scheduleForm.appointmentDateTime,
        reason: scheduleForm.reason,
        notes: scheduleForm.notes
      });
      setActionSuccess('Appointment successfully booked!');
      setScheduleForm({ patientId: '', doctorId: '', appointmentDateTime: '', reason: '', notes: '' });
      await fetchData();
      setTimeout(() => {
        setIsScheduleOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      // Backend conflict detection or validation error
      setActionError(err.response?.data?.message || 'Scheduling conflict or error detected.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedAppointment || !rescheduleDateTime) return;
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.put(`/api/receptionist/appointments/${selectedAppointment.id}/reschedule?dateTime=${encodeURIComponent(rescheduleDateTime)}`);
      setActionSuccess('Appointment successfully rescheduled!');
      await fetchData();
      setTimeout(() => {
        setIsRescheduleOpen(false);
        setSelectedAppointment(null);
        setRescheduleDateTime('');
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Conflict detected: Doctor unavailable at this time.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/api/receptionist/appointments/${id}/cancel`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="app-container">
      <Sidebar onOpenAi={() => setIsAiOpen(true)} />

      <div className="main-wrapper">
        <Navbar
          title="Reception & Patient Care Coordination"
          subtitle="Manage appointments, patient intake, and physician availability"
          onOpenAi={() => setIsAiOpen(true)}
        />

        <main className="content-body">
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: 450 }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Search patient by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setIsRegisterPatientOpen(true)}>
                <UserPlus size={16} />
                <span>Register New Patient</span>
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setIsScheduleOpen(true)}>
                <Plus size={16} />
                <span>Schedule Appointment</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              icon={Calendar}
              label="Today's Appointments"
              value={dashboard?.todayAppointmentsCount || 0}
              color="#0284c7"
              bgColor="#e0f2fe"
            />
            <StatCard
              icon={Users}
              label="Registered Patients"
              value={dashboard?.totalPatients || 0}
              color="#10b981"
              bgColor="#d1fae5"
            />
            <StatCard
              icon={Stethoscope}
              label="On-Duty Physicians"
              value={dashboard?.totalDoctors || 0}
              color="#8b5cf6"
              bgColor="#ede9fe"
            />
          </div>

          {/* Today's Appointments Table */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <CalendarCheck size={18} color="var(--primary)" />
                <span>Today's Hospital Appointments Schedule</span>
              </h4>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Specialty</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!dashboard?.todayAppointments || dashboard.todayAppointments.length === 0) ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No appointments scheduled for today. Click "Schedule Appointment" to book.
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
                          <td>{apt.doctorName}</td>
                          <td>{apt.specialization}</td>
                          <td>{apt.reason}</td>
                          <td><Badge status={apt.status} /></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                                <>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                      setSelectedAppointment(apt);
                                      setIsRescheduleOpen(true);
                                    }}
                                  >
                                    <Clock size={14} /> Reschedule
                                  </button>
                                  <button
                                    className="btn btn-outline btn-sm btn-danger"
                                    onClick={() => handleCancelAppointment(apt.id)}
                                  >
                                    <XCircle size={14} /> Cancel
                                  </button>
                                </>
                              )}
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

          {/* Patients Registry Table */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <Users size={18} color="#0d9488" />
                <span>Patient Search & Quick Registry</span>
              </h4>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Blood Group</th>
                      <th>Emergency Contact</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          No matching patients found.
                        </td>
                      </tr>
                    ) : (
                      patients.map((pat) => (
                        <tr key={pat.userId}>
                          <td style={{ fontWeight: 600 }}>{pat.fullName}</td>
                          <td>{pat.email}</td>
                          <td>{pat.phone || 'N/A'}</td>
                          <td><Badge status="INFO" text={pat.bloodGroup || 'N/A'} /></td>
                          <td>{pat.emergencyContact || 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setScheduleForm(prev => ({ ...prev, patientId: pat.userId }));
                                setIsScheduleOpen(true);
                              }}
                            >
                              <Plus size={14} /> Book Visit
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
        </main>
      </div>

      {/* Register Patient Modal */}
      <Modal
        isOpen={isRegisterPatientOpen}
        onClose={() => setIsRegisterPatientOpen(false)}
        title="Reception: Register New Patient"
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

        <form onSubmit={handleRegisterPatient}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={patientForm.fullName}
                onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                value={patientForm.email}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                value={patientForm.dateOfBirth}
                onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-control"
                value={patientForm.gender}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-control"
                value={patientForm.bloodGroup}
                onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              className="form-control"
              value={patientForm.address}
              onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emergency Contact</label>
            <input
              type="tel"
              className="form-control"
              value={patientForm.emergencyContact}
              onChange={(e) => setPatientForm({ ...patientForm, emergencyContact: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsRegisterPatientOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Appointment Modal with Conflict Prevention */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Appointment (Conflict Protected)"
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

        <form onSubmit={handleScheduleAppointment}>
          <div className="form-group">
            <label className="form-label">Select Patient *</label>
            <select
              className="form-control"
              value={scheduleForm.patientId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, patientId: e.target.value })}
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.userId} value={p.userId}>
                  {p.fullName} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Doctor & Department *</label>
            <select
              className="form-control"
              value={scheduleForm.doctorId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, doctorId: e.target.value })}
              required
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} — {d.specialization} ({d.departmentName}) • Room {d.roomNumber || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Appointment Date & Time *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={scheduleForm.appointmentDateTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, appointmentDateTime: e.target.value })}
              required
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
              CareFlow Backend automatically verifies schedule conflicts to prevent double-booking.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Visit Reason *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Annual cardiology checkup, consultation"
              value={scheduleForm.reason}
              onChange={(e) => setScheduleForm({ ...scheduleForm, reason: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Front Desk Notes</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Any intake notes from patient..."
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Validating Availability...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
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

        <form onSubmit={handleReschedule}>
          <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
            <div><strong>Patient:</strong> {selectedAppointment?.patientName}</div>
            <div><strong>Doctor:</strong> {selectedAppointment?.doctorName}</div>
            <div><strong>Current Time:</strong> {selectedAppointment && new Date(selectedAppointment.appointmentDateTime).toLocaleString()}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Select New Date & Time *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={rescheduleDateTime}
              onChange={(e) => setRescheduleDateTime(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Verifying Conflict...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Assistant Modal */}
      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default ReceptionistDashboard;
