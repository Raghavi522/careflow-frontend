import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import AiModal from '../components/AiModal';
import {
  FlaskConical,
  Clock,
  CheckCircle,
  Play,
  FileCheck,
  AlertCircle,
  Eye,
  Search,
  Filter
} from 'lucide-react';

const LabDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [tests, setTests] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Result entry form
  const [resultForm, setResultForm] = useState({
    findings: '',
    normalRange: '',
    comments: ''
  });

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, testsRes] = await Promise.all([
        api.get('/api/lab/dashboard'),
        api.get('/api/lab/tests')
      ]);
      setDashboard(dashRes.data);
      setTests(testsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (testId, newStatus) => {
    try {
      await api.put(`/api/lab/tests/${testId}/status?status=${newStatus}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update test status');
    }
  };

  const handleOpenResultEntry = (test) => {
    setSelectedTest(test);
    setResultForm({
      findings: test.findings || '',
      normalRange: test.normalRange || 'Standard reference ranges applicable',
      comments: test.comments || 'Test conducted according to standard clinical laboratory protocol.'
    });
    setActionError('');
    setActionSuccess('');
    setIsResultModalOpen(true);
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      await api.post(`/api/lab/tests/${selectedTest.id}/result`, resultForm);
      setActionSuccess('Diagnostic result entered & test marked COMPLETED!');
      await fetchData();
      setTimeout(() => {
        setIsResultModalOpen(false);
        setActionSuccess('');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit test findings');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'PENDING' && t.status === 'REQUESTED') ||
      (activeTab === 'IN_PROGRESS' && t.status === 'IN_PROGRESS') ||
      (activeTab === 'COMPLETED' && t.status === 'COMPLETED');

    const matchesSearch =
      t.testName.toLowerCase().includes(search.toLowerCase()) ||
      t.patientName.toLowerCase().includes(search.toLowerCase()) ||
      t.doctorName.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="app-container">
      <Sidebar onOpenAi={() => setIsAiOpen(true)} />

      <div className="main-wrapper">
        <Navbar
          title="Diagnostic Pathology & Clinical Laboratory Hub"
          subtitle="Process physician specimen orders, update testing workflows, and publish diagnostic findings"
          onOpenAi={() => setIsAiOpen(true)}
        />

        <main className="content-body">
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              icon={Clock}
              label="Pending Test Orders"
              value={dashboard?.totalPendingCount || 0}
              color="#f59e0b"
              bgColor="#fef3c7"
            />
            <StatCard
              icon={FlaskConical}
              label="In Progress / Bench"
              value={dashboard?.totalInProgressCount || 0}
              color="#0284c7"
              bgColor="#e0f2fe"
            />
            <StatCard
              icon={CheckCircle}
              label="Completed & Published"
              value={dashboard?.totalCompletedCount || 0}
              color="#10b981"
              bgColor="#d1fae5"
            />
          </div>

          {/* Filtering and Search Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('ALL')}
              >
                All Orders ({tests.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('PENDING')}
              >
                Pending Requests ({dashboard?.totalPendingCount || 0})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'IN_PROGRESS' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('IN_PROGRESS')}
              >
                In Processing ({dashboard?.totalInProgressCount || 0})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'COMPLETED' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('COMPLETED')}
              >
                Completed Archive ({dashboard?.totalCompletedCount || 0})
              </button>
            </div>

            <div style={{ position: 'relative', width: 300 }}>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search test, patient, or physician..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Diagnostic Orders Table */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <FlaskConical size={18} color="#0284c7" />
                <span>Laboratory Worklist</span>
              </h4>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Investigation</th>
                      <th>Specimen / Category</th>
                      <th>Patient</th>
                      <th>Ordering Physician</th>
                      <th>Status</th>
                      <th>Laboratory Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTests.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No matching diagnostic test orders found in this view.
                        </td>
                      </tr>
                    ) : (
                      filteredTests.map((test) => (
                        <tr key={test.id}>
                          <td style={{ fontWeight: 600 }}>LAB-{test.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{test.testName}</div>
                            {test.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{test.notes}</div>}
                          </td>
                          <td>{test.sampleType} ({test.testCategory})</td>
                          <td>{test.patientName}</td>
                          <td>Dr. {test.doctorName}</td>
                          <td><Badge status={test.status} /></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              {test.status === 'REQUESTED' && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleUpdateStatus(test.id, 'IN_PROGRESS')}
                                >
                                  <Play size={14} /> Start Testing
                                </button>
                              )}

                              {(test.status === 'IN_PROGRESS' || test.status === 'REQUESTED') && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleOpenResultEntry(test)}
                                >
                                  <FileCheck size={14} /> Enter Results
                                </button>
                              )}

                              {test.status === 'COMPLETED' && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => {
                                    setSelectedTest(test);
                                    setIsViewModalOpen(true);
                                  }}
                                >
                                  <Eye size={14} /> View Report
                                </button>
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
        </main>
      </div>

      {/* Enter Result Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Enter Official Diagnostic Findings"
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

        <form onSubmit={handleSubmitResult}>
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--border)' }}>
            <div><strong>Test:</strong> {selectedTest?.testName}</div>
            <div><strong>Patient:</strong> {selectedTest?.patientName}</div>
            <div><strong>Ordered By:</strong> Dr. {selectedTest?.doctorName}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantitative Findings & Values *</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="e.g. Hemoglobin: 14.2 g/dL, WBC: 6,800 /mcL, Platelets: 240,000 /mcL..."
              value={resultForm.findings}
              onChange={(e) => setResultForm({ ...resultForm, findings: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Reference Biological Ranges</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Normal: 13.5 - 17.5 g/dL (Adult Male)"
              value={resultForm.normalRange}
              onChange={(e) => setResultForm({ ...resultForm, normalRange: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technician Interpretation & Clinical Remarks</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Any remarks, morphological notes, or cautionary observations..."
              value={resultForm.comments}
              onChange={(e) => setResultForm({ ...resultForm, comments: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem', background: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsResultModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Publishing...' : 'Publish Findings & Complete'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Result Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Published Diagnostic Report"
      >
        {selectedTest && (
          <div>
            <div style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{selectedTest.testName}</h4>
                <Badge status="COMPLETED" />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Patient: {selectedTest.patientName} • Doctor: Dr. {selectedTest.doctorName}
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reported Findings:</span>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9rem', marginTop: '0.25rem', whiteSpace: 'pre-line' }}>
                {selectedTest.findings}
              </div>
            </div>

            {selectedTest.normalRange && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Normal Range:</span>
                <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {selectedTest.normalRange}
                </div>
              </div>
            )}

            {selectedTest.comments && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Technician Remarks:</span>
                <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: '0.85rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  {selectedTest.comments}
                </div>
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Verified by: {selectedTest.technicianName || 'Laboratory Staff'}</span>
              <span>Published: {selectedTest.completedAt ? new Date(selectedTest.completedAt).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Assistant Modal */}
      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default LabDashboard;
