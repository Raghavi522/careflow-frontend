import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  CalendarCheck,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  Receipt,
  FileText,
  Building2,
  Sparkles,
  LogOut,
  User,
  HeartPulse
} from 'lucide-react';

const Sidebar = ({ onOpenAi }) => {
  const { user, logout, isAdmin, isReceptionist, isDoctor, isLabTech, isPatient } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleNameMap = {
    ADMIN: 'Hospital Admin',
    RECEPTIONIST: 'Reception Desk',
    DOCTOR: 'Medical Staff',
    LAB_TECHNICIAN: 'Diagnostics Lab',
    PATIENT: 'Patient Portal'
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <HeartPulse size={22} color="#ffffff" />
        </div>
        <div>
          <div className="sidebar-title">CareFlow</div>
          <span className="sidebar-role-badge">{roleNameMap[user?.role] || user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Patient Navigation */}
        {isPatient && (
          <>
            <NavLink to="/patient/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/patient/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>Appointments</span>
            </NavLink>
            <NavLink to="/patient/prescriptions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={18} />
              <span>Prescriptions</span>
            </NavLink>
            <NavLink to="/patient/labs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FlaskConical size={18} />
              <span>Lab Results</span>
            </NavLink>
            <NavLink to="/patient/bills" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Receipt size={18} />
              <span>Invoices & Bills</span>
            </NavLink>
            <NavLink to="/patient/doctors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Stethoscope size={18} />
              <span>Doctors Directory</span>
            </NavLink>
          </>
        )}

        {/* Doctor Navigation */}
        {isDoctor && (
          <>
            <NavLink to="/doctor/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Doctor Dashboard</span>
            </NavLink>
            <NavLink to="/doctor/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CalendarCheck size={18} />
              <span>Appointments</span>
            </NavLink>
            <NavLink to="/doctor/consultations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Stethoscope size={18} />
              <span>Consultations</span>
            </NavLink>
            <NavLink to="/doctor/prescriptions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={18} />
              <span>Prescriptions</span>
            </NavLink>
            <NavLink to="/doctor/labs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FlaskConical size={18} />
              <span>Lab Orders</span>
            </NavLink>
          </>
        )}

        {/* Receptionist Navigation */}
        {isReceptionist && (
          <>
            <NavLink to="/receptionist/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Reception Desk</span>
            </NavLink>
            <NavLink to="/receptionist/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <UserPlus size={18} />
              <span>Patients Registry</span>
            </NavLink>
            <NavLink to="/receptionist/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>Appointments</span>
            </NavLink>
            <NavLink to="/receptionist/doctors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Stethoscope size={18} />
              <span>Doctors Schedule</span>
            </NavLink>
          </>
        )}

        {/* Lab Technician Navigation */}
        {isLabTech && (
          <>
            <NavLink to="/lab/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Laboratory Hub</span>
            </NavLink>
            <NavLink to="/lab/tests" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FlaskConical size={18} />
              <span>All Test Requests</span>
            </NavLink>
          </>
        )}

        {/* Administrator Navigation */}
        {isAdmin && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Executive Overview</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>User Directory</span>
            </NavLink>
            <NavLink to="/admin/departments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Building2 size={18} />
              <span>Departments</span>
            </NavLink>
            <NavLink to="/admin/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>Hospital Schedule</span>
            </NavLink>
            <NavLink to="/admin/billing" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Receipt size={18} />
              <span>Billing & Revenue</span>
            </NavLink>
            <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Audit Trails</span>
            </NavLink>
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          {/* AI Assistant Quick Trigger */}
          <button
            type="button"
            className="sidebar-link"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(13, 148, 136, 0.25))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8'
            }}
            onClick={onOpenAi}
          >
            <Sparkles size={18} color="#38bdf8" />
            <span>AI Care Assistant</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <User size={18} />
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
            <div className="sidebar-user-email">{user?.email || ''}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#cbd5e1' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
