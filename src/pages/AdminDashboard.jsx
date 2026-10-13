import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import AiModal from '../components/AiModal';
import {
  Users,
  Stethoscope,
  Building2,
  Calendar,
  Receipt,
  FileText,
  UserCheck,
  UserX,
  Plus,
  CreditCard,
  XCircle,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ShieldAlert,
  Activity
} from 'lucide-react';

const AdminDashboard = ({ initialTab = 'USERS' }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [bills, setBills] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Modals
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false);
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Forms
  const [userForm, setUserForm] = useState({
    email: '',
    password: 'Password@123',
    fullName: '',
    phone: '',
    role: 'RECEPTIONIST'
  });

  const [doctorForm, setDoctorForm] = useState({
    email: '',
    password: 'Doctor@123',
    fullName: '',
    phone: '',
    departmentId: '',
    specialization: '',
    qualification: '',
    consultationFee: '100.00',
    roomNumber: 'Suite 101'
  });

  const [deptForm, setDeptForm] = useState({
    name: '',
    description: ''
  });

  const [billForm, setBillForm] = useState({
    patientId: '',
    description: '',
    amount: ''
  });

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, deptsRes, billsRes, logsRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/departments'),
        api.get('/api/admin/bills'),
        api.get('/api/admin/audit-logs')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setDepartments(deptsRes.data || []);
      setBills(billsRes.data || []);
      setAuditLogs(logsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/status`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/admin/users', userForm);
      setActionSuccess('User successfully created!');
      setUserForm({ email: '', password: 'Password@123', fullName: '', phone: '', role: 'RECEPTIONIST' });
      await fetchData();
      setTimeout(() => {
        setIsCreateUserOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/admin/doctors', doctorForm);
      setActionSuccess('Physician and department profile successfully configured!');
      setDoctorForm({
        email: '',
        password: 'Doctor@123',
        fullName: '',
        phone: '',
        departmentId: '',
        specialization: '',
        qualification: '',
        consultationFee: '100.00',
        roomNumber: 'Suite 101'
      });
      await fetchData();
      setTimeout(() => {
        setIsCreateDoctorOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create doctor profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/admin/departments', deptForm);
      setActionSuccess('Department created successfully!');
      setDeptForm({ name: '', description: '' });
      await fetchData();
      setTimeout(() => {
        setIsCreateDeptOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create department');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post('/api/admin/bills', {
        patientId: Number(billForm.patientId),
        description: billForm.description,
        amount: Number(billForm.amount)
      });
      setActionSuccess('Invoice successfully generated!');
      setBillForm({ patientId: '', description: '', amount: '' });
      await fetchData();
      setTimeout(() => {
        setIsCreateBillOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkBillPaid = async (billId) => {
    try {
      await api.put(`/api/admin/bills/${billId}/pay`, { paymentMethod: 'Hospital Cashier Desk' });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleCancelBill = async (billId) => {
    try {
      await api.put(`/api/admin/bills/${billId}/cancel`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel bill');
    }
  };

  const patientUsers = users.filter((u) => u.role === 'PATIENT');

  return (
    <div className="app-container">
      <Sidebar onOpenAi={() => setIsAiOpen(true)} />

      <div className="main-wrapper">
        <Navbar
          title="Hospital Executive Dashboard"
          subtitle="System oversight, role-based user management, revenue cycle, and immutable audit logging"
          onOpenAi={() => setIsAiOpen(true)}
        />

        <main className="content-body">
          {/* Executive Stats Grid */}
          <div className="stats-grid">
            <StatCard
              icon={Users}
              label="Total Patients"
              value={stats?.totalPatients || 0}
              color="#0284c7"
              bgColor="#e0f2fe"
            />
            <StatCard
              icon={Stethoscope}
              label="Attending Doctors"
              value={stats?.totalDoctors || 0}
              color="#0d9488"
              bgColor="#ccfbf1"
            />
            <StatCard
              icon={Calendar}
              label="Today's Appointments"
              value={stats?.todayAppointments || 0}
              color="#8b5cf6"
              bgColor="#ede9fe"
            />
            <StatCard
              icon={Receipt}
              label="Pending Invoices"
              value={stats?.pendingBills || 0}
              color="#f59e0b"
              bgColor="#fef3c7"
            />
          </div>

          {/* Section Navigation Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'USERS' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('USERS')}
              >
                User Directory ({users.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'DEPTS' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('DEPTS')}
              >
                Departments ({departments.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'BILLING' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('BILLING')}
              >
                Billing & Invoices ({bills.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'AUDIT' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('AUDIT')}
              >
                Audit Trails ({auditLogs.length})
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {activeTab === 'USERS' && (
                <>
                  <button className="btn btn-outline btn-sm" onClick={() => setIsCreateUserOpen(true)}>
                    <Plus size={14} /> Add Staff User
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setIsCreateDoctorOpen(true)}>
                    <Plus size={14} /> Register Doctor Profile
                  </button>
                </>
              )}
              {activeTab === 'DEPTS' && (
                <button className="btn btn-primary btn-sm" onClick={() => setIsCreateDeptOpen(true)}>
                  <Plus size={14} /> New Department
                </button>
              )}
              {activeTab === 'BILLING' && (
                <button className="btn btn-primary btn-sm" onClick={() => setIsCreateBillOpen(true)}>
                  <Plus size={14} /> Generate Invoice
                </button>
              )}
              <button className="btn btn-outline btn-sm" style={{ color: '#0284c7', borderColor: '#bae6fd' }} onClick={() => setIsAiOpen(true)}>
                <Sparkles size={14} /> AI Operations Summary
              </button>
            </div>
          </div>

          {/* TAB 1: USERS DIRECTORY */}
          {activeTab === 'USERS' && (
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <Users size={18} color="var(--primary)" />
                  <span>Hospital System User Directory</span>
                </h4>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Full Name</th>
                        <th>Email Address</th>
                        <th>System Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600 }}>CF-USR-{u.id}</td>
                          <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                          <td>{u.email}</td>
                          <td><Badge status={u.role} /></td>
                          <td>
                            <Badge status={u.active ? 'ACTIVE' : 'INACTIVE'} />
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className={`btn btn-sm ${u.active ? 'btn-outline btn-danger' : 'btn-primary'}`}
                              onClick={() => handleToggleUserStatus(u.id)}
                            >
                              {u.active ? (
                                <>
                                  <UserX size={12} /> Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck size={12} /> Activate
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENTS */}
          {activeTab === 'DEPTS' && (
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <Building2 size={18} color="#0d9488" />
                  <span>Hospital Clinical Departments</span>
                </h4>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Dept ID</th>
                        <th>Department Name</th>
                        <th>Operational Scope & Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((d) => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600 }}>DEPT-{d.id}</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{d.name}</td>
                          <td>{d.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING & INVOICES */}
          {activeTab === 'BILLING' && (
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <Receipt size={18} color="#f59e0b" />
                  <span>Hospital Patient Invoices & Revenue</span>
                </h4>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Patient</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Payment Method</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((b) => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 600 }}>INV-{b.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{b.patientName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.patientEmail}</div>
                          </td>
                          <td>{b.description}</td>
                          <td style={{ fontWeight: 700 }}>${b.amount}</td>
                          <td>{new Date(b.billDate).toLocaleDateString()}</td>
                          <td><Badge status={b.status} /></td>
                          <td>{b.paymentMethod || '—'}</td>
                          <td>
                            {b.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="btn btn-outline btn-sm" onClick={() => handleMarkBillPaid(b.id)}>
                                  <CreditCard size={12} /> Mark Paid
                                </button>
                                <button className="btn btn-outline btn-sm btn-danger" onClick={() => handleCancelBill(b.id)}>
                                  <XCircle size={12} /> Void
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'AUDIT' && (
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <FileText size={18} color="#475569" />
                  <span>Immutable System Audit Trail</span>
                </h4>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User Account</th>
                        <th>Role</th>
                        <th>Action Performed</th>
                        <th>Details</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td style={{ fontWeight: 600 }}>{log.userEmail}</td>
                          <td><Badge status={log.userRole} /></td>
                          <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{log.action}</td>
                          <td>{log.description}</td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.ipAddress || '127.0.0.1'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Staff User Modal */}
      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="Admin: Provision System Staff User"
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

        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              value={userForm.fullName}
              onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password *</label>
            <input
              type="password"
              className="form-control"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Role *</label>
            <select
              className="form-control"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            >
              <option value="RECEPTIONIST">RECEPTIONIST</option>
              <option value="LAB_TECHNICIAN">LAB_TECHNICIAN</option>
              <option value="ADMIN">ADMINISTRATOR</option>
            </select>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsCreateUserOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Provision User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Doctor Modal */}
      <Modal
        isOpen={isCreateDoctorOpen}
        onClose={() => setIsCreateDoctorOpen(false)}
        title="Admin: Register Physician & Department Profile"
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

        <form onSubmit={handleCreateDoctor}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Doctor Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Dr. Jane Smith"
                value={doctorForm.fullName}
                onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Doctor Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="dr.smith@careflow.com"
                value={doctorForm.email}
                onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                value={doctorForm.password}
                onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-control"
                value={doctorForm.departmentId}
                onChange={(e) => setDoctorForm({ ...doctorForm, departmentId: e.target.value })}
                required
              >
                <option value="">-- Assign Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Pediatric Cardiology"
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Academic Qualifications</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MD, FACS - Stanford"
                value={doctorForm.qualification}
                onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Consultation Fee ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={doctorForm.consultationFee}
                onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Clinic Suite / Room Number</label>
              <input
                type="text"
                className="form-control"
                value={doctorForm.roomNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, roomNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsCreateDoctorOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Registering Doctor...' : 'Register Doctor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Department Modal */}
      <Modal
        isOpen={isCreateDeptOpen}
        onClose={() => setIsCreateDeptOpen(false)}
        title="Admin: Create Hospital Department"
      >
        <form onSubmit={handleCreateDept}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Dermatology"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Scope & Clinical Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Clinical domain details..."
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
            ></textarea>
          </div>
          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsCreateDeptOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Bill Modal */}
      <Modal
        isOpen={isCreateBillOpen}
        onClose={() => setIsCreateBillOpen(false)}
        title="Admin: Generate Patient Medical Bill"
      >
        <form onSubmit={handleCreateBill}>
          <div className="form-group">
            <label className="form-label">Select Patient *</label>
            <select
              className="form-control"
              value={billForm.patientId}
              onChange={(e) => setBillForm({ ...billForm, patientId: e.target.value })}
              required
            >
              <option value="">-- Choose Patient --</option>
              {patientUsers.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Description *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Diagnostic Cardiac Ultrasound & Consultation"
              value={billForm.description}
              onChange={(e) => setBillForm({ ...billForm, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              placeholder="150.00"
              value={billForm.amount}
              onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
              required
            />
          </div>
          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsCreateBillOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Assistant Modal */}
      <AiModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        initialType="ADMIN_SUMMARY"
        initialContext={`Total Patients: ${stats?.totalPatients}, Total Doctors: ${stats?.totalDoctors}, Today's Appointments: ${stats?.todayAppointments}, Pending Labs: ${stats?.pendingLabTests}, Pending Bills: ${stats?.pendingBills}`}
      />
    </div>
  );
};

export default AdminDashboard;
