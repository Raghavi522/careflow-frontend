import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import AiModal from '../components/AiModal';
import { Calendar, Clock, Stethoscope, User, XCircle } from 'lucide-react';

const AppointmentsPage = () => {
  const { user, isPatient, isDoctor, isReceptionist, isAdmin } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/patients/appointments';
      if (isDoctor) endpoint = '/api/doctors/appointments';
      else if (isReceptionist || isAdmin) endpoint = '/api/receptionist/appointments';

      const res = await api.get(endpoint);
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      if (isPatient) {
        await api.put(`/api/patients/appointments/${id}/cancel`);
      } else {
        await api.put(`/api/receptionist/appointments/${id}/cancel`);
      }
      await fetchAppointments();
    } catch (e) {
      alert(e.response?.data?.message || 'Error cancelling appointment');
    }
  };

  return (
    <div className="app-container">
      <Sidebar onOpenAi={() => setIsAiOpen(true)} />

      <div className="main-wrapper">
        <Navbar
          title="Appointments & Clinical Visits"
          subtitle="Complete chronological hospital appointment schedule"
          onOpenAi={() => setIsAiOpen(true)}
        />

        <main className="content-body">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <Calendar size={18} color="var(--primary)" />
                <span>Appointments Registry ({appointments.length})</span>
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
                        <th>Date & Time</th>
                        <th>Patient</th>
                        <th>Attending Doctor</th>
                        <th>Specialty / Dept</th>
                        <th>Reason for Encounter</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No appointment records found.
                          </td>
                        </tr>
                      ) : (
                        appointments.map((apt) => (
                          <tr key={apt.id}>
                            <td style={{ fontWeight: 600 }}>
                              {new Date(apt.appointmentDateTime).toLocaleString()}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.patientPhone || apt.patientEmail}</div>
                            </td>
                            <td>{apt.doctorName}</td>
                            <td>{apt.specialization} ({apt.departmentName})</td>
                            <td>{apt.reason}</td>
                            <td><Badge status={apt.status} /></td>
                            <td>
                              {apt.status === 'SCHEDULED' && (
                                <button
                                  className="btn btn-outline btn-sm btn-danger"
                                  onClick={() => handleCancel(apt.id)}
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
              )}
            </div>
          </div>
        </main>
      </div>

      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default AppointmentsPage;
