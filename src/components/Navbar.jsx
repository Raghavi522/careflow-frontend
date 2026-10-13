import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Sparkles, Check, CheckCheck } from 'lucide-react';
import Modal from './Modal';

const Navbar = ({ title, subtitle, onOpenAi }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const countRes = await api.get('/api/notifications/unread-count');
      setUnreadCount(countRes.data.unreadCount || 0);

      const notifRes = await api.get('/api/notifications');
      setNotifications(notifRes.data || []);
    } catch (e) {
      // Ignore background errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="top-navbar">
        <div className="navbar-title-group">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="navbar-actions">
          {/* AI Helper trigger */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', borderColor: '#bae6fd' }}
            onClick={onOpenAi}
          >
            <Sparkles size={16} />
            <span>AI Care Assistant</span>
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            className="btn btn-outline btn-icon"
            style={{ position: 'relative' }}
            onClick={() => setIsNotifOpen(true)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: '#ef4444',
                color: '#ffffff',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Notifications Modal */}
      <Modal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} title="System Notifications">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </span>
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No notifications found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: n.readStatus ? '#ffffff' : '#f0f9ff',
                  border: `1px solid ${n.readStatus ? 'var(--border)' : '#bae6fd'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: n.readStatus ? 'var(--text-primary)' : '#0369a1' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                {!n.readStatus && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
};

export default Navbar;
