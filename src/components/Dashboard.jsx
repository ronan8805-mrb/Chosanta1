import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../App';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    api('/api/dashboard').then(setStats).catch(console.error);
    api('/api/alerts').then(setAlerts).catch(() => {});
  }, []);

  if (!stats) return <div className="loading-screen"><div className="spinner" /></div>;

  const sevColor = { critical: '#e74c3c', high: '#e65100', moderate: '#f39c12' };
  const sevBg = { critical: 'rgba(231,76,60,0.08)', high: 'rgba(230,81,0,0.06)', moderate: 'rgba(243,156,18,0.06)' };
  const critAlerts = alerts.filter(a => a.severity === 'critical');
  const highAlerts = alerts.filter(a => a.severity === 'high');

  return (
    <div>
      <div className="page-header"><h1>Dashboard</h1></div>

      {/* GOVERNANCE ALERTS PANEL */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 20, border: critAlerts.length > 0 ? '2px solid #e74c3c' : '1px solid rgba(201,168,76,0.3)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: critAlerts.length > 0 ? 'linear-gradient(135deg, #3d0c0c, #1a0505)' : 'linear-gradient(135deg, #1a1508, #0d0b05)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🚨</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: critAlerts.length > 0 ? '#ff6b6b' : '#c9a84c' }}>
                Governance Alerts — {critAlerts.length} Critical · {highAlerts.length} High · {alerts.length} Total
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#9a9484' }}>Auto-monitored per HIQA Standards</span>
          </div>
          <div style={{ padding: '8px 12px', maxHeight: 220, overflow: 'auto' }}>
            {alerts.map((a, i) => (
              <div key={i} onClick={() => navigate(a.link)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', marginBottom: 4, borderRadius: 6, background: sevBg[a.severity], cursor: 'pointer', transition: 'all 0.15s', border: '1px solid transparent' }}
                onMouseOver={e => e.currentTarget.style.borderColor = sevColor[a.severity]}
                onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: sevColor[a.severity], flexShrink: 0, boxShadow: `0 0 6px ${sevColor[a.severity]}` }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: sevColor[a.severity], minWidth: 55 }}>{a.severity.toUpperCase()}</span>
                <span style={{ fontSize: 11, color: '#9a9484', minWidth: 80 }}>{a.category}</span>
                <span style={{ fontSize: 12, flex: 1 }}>{a.message}</span>
                <span style={{ fontSize: 11, color: '#666' }}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRIMARY KPIs */}
      <div className="dashboard-grid">
        <div className="stat-card info"><div className="stat-value">{stats.totalChildren}</div><div className="stat-label">Active Children</div></div>
        <div className={`stat-card ${stats.openIncidents > 0 ? 'danger' : 'success'}`}><div className="stat-value">{stats.openIncidents}</div><div className="stat-label">Open Incidents</div></div>
        <div className={`stat-card ${stats.pendingPICReview > 0 ? 'warning' : 'success'}`}><div className="stat-value">{stats.pendingPICReview}</div><div className="stat-label">Pending PIC Review</div></div>
        <div className="stat-card"><div className="stat-value">{stats.totalStaff}</div><div className="stat-label">Active Staff</div></div>
        <div className={`stat-card ${stats.trainingExpired > 0 ? 'danger' : 'success'}`}><div className="stat-value">{stats.trainingExpired}</div><div className="stat-label">Training Expired</div></div>
        <div className={`stat-card ${stats.trainingExpiring > 0 ? 'warning' : 'success'}`}><div className="stat-value">{stats.trainingExpiring}</div><div className="stat-label">Expiring (30d)</div></div>
        <div className={`stat-card ${stats.openComplaints > 0 ? 'warning' : 'success'}`}><div className="stat-value">{stats.openComplaints}</div><div className="stat-label">Open Complaints</div></div>
        <div className={`stat-card ${stats.overdueSupervision > 0 ? 'danger' : 'success'}`}><div className="stat-value">{stats.overdueSupervision}</div><div className="stat-label">Supervision Overdue</div></div>
      </div>

      {/* SECONDARY GOVERNANCE KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginTop: 12, marginBottom: 20 }}>
        {[
          { v: stats.overdueCareReviews, l: 'Care Plans Overdue', d: stats.overdueCareReviews > 0 },
          { v: stats.qipActionsOpen, l: 'QIP Actions Open', d: stats.qipActionsOpen > 3 },
          { v: stats.fireEquipOverdue, l: 'Fire Equip Overdue', d: stats.fireEquipOverdue > 0 },
          { v: stats.missingNoInterview, l: 'Missing No Interview', d: stats.missingNoInterview > 0 },
          { v: stats.openMaintenance, l: 'Open Maintenance', d: stats.openMaintenance > 3 },
          { v: stats.overdueDocuments, l: 'Doc Reviews Due', d: stats.overdueDocuments > 0 },
        ].map((s, i) => (
          <div key={i} style={{ background: s.d ? 'rgba(231,76,60,0.06)' : 'rgba(201,168,76,0.04)', border: `1px solid ${s.d ? 'rgba(231,76,60,0.2)' : 'rgba(201,168,76,0.1)'}`, borderRadius: 8, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.d ? '#e74c3c' : '#c9a84c' }}>{s.v}</div>
            <div style={{ fontSize: 10, color: '#9a9484', marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header"><h3>Recent Incidents</h3></div>
          <div className="card-body">
            {stats.recentIncidents.length === 0
              ? <div className="empty-state"><p>No incidents recorded</p></div>
              : <table className="data-table">
                  <thead><tr><th>Date</th><th>Category</th><th>Severity</th><th>Child</th><th>Status</th></tr></thead>
                  <tbody>
                    {stats.recentIncidents.map(i => (
                      <tr key={i.id}>
                        <td>{i.date}</td><td>{i.category}</td>
                        <td><span className={`badge badge-${i.severity?.toLowerCase()}`}>{i.severity}</span></td>
                        <td>{i.child_name || '—'}</td>
                        <td><span className={`badge badge-${i.status?.toLowerCase()}`}>{i.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Recent Handovers</h3></div>
          <div className="card-body">
            {stats.recentHandovers.length === 0
              ? <div className="empty-state"><p>No handovers recorded</p></div>
              : <table className="data-table">
                  <thead><tr><th>Date</th><th>Shift</th><th>Leader</th></tr></thead>
                  <tbody>
                    {stats.recentHandovers.map(h => (
                      <tr key={h.id}><td>{h.date}</td><td>{h.shift_type}</td><td>{h.leader_name}</td></tr>
                    ))}
                  </tbody>
                </table>}
          </div>
        </div>
      </div>
    </div>
  );
}
