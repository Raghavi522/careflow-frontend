import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import AiModal from '../components/AiModal';
import { Receipt, CreditCard, XCircle } from 'lucide-react';

const BillingPage = () => {
  const { isPatient, isAdmin } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const endpoint = isPatient ? '/api/patients/bills' : '/api/admin/bills';
      const res = await api.get(endpoint);
      setBills(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePay = async (billId) => {
    if (!window.confirm('Confirm settlement of this invoice?')) return;
    try {
      await api.put(`/api/admin/bills/${billId}/pay`, { paymentMethod: isPatient ? 'Online Portal (Card)' : 'Cashier Desk' });
      await fetchBills();
      alert('Invoice marked as PAID!');
    } catch (e) {
      alert(e.response?.data?.message || 'Error processing payment');
    }
  };

  return (
    <div className="app-container">
      <Sidebar onOpenAi={() => setIsAiOpen(true)} />

      <div className="main-wrapper">
        <Navbar
          title="Hospital Invoices & Billing Management"
          subtitle="Patient medical charges, itemized services, and payment status tracking"
          onOpenAi={() => setIsAiOpen(true)}
        />

        <main className="content-body">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <Receipt size={18} color="#f59e0b" />
                <span>Invoice Registry ({bills.length})</span>
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
                        <th>Invoice #</th>
                        {!isPatient && <th>Patient</th>}
                        <th>Description</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Method</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.length === 0 ? (
                        <tr>
                          <td colSpan={isPatient ? 7 : 8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No invoice records found.
                          </td>
                        </tr>
                      ) : (
                        bills.map((b) => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 600 }}>INV-{b.id}</td>
                            {!isPatient && (
                              <td>
                                <div style={{ fontWeight: 600 }}>{b.patientName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.patientEmail}</div>
                              </td>
                            )}
                            <td style={{ fontWeight: 500 }}>{b.description}</td>
                            <td>{new Date(b.billDate).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 700 }}>${b.amount}</td>
                            <td><Badge status={b.status} /></td>
                            <td>{b.paymentMethod || '—'}</td>
                            <td>
                              {b.status === 'PENDING' && (
                                <button className="btn btn-primary btn-sm" onClick={() => handlePay(b.id)}>
                                  <CreditCard size={12} /> Pay Now
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

export default BillingPage;
