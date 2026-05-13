import React, { useState, useEffect } from 'react';
import { api } from '../App';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const scoreColor = s => s >= 80 ? '#27ae60' : s >= 60 ? '#f39c12' : '#e74c3c';
const scoreBg    = s => s >= 80 ? 'rgba(39,174,96,0.08)' : s >= 60 ? 'rgba(243,156,18,0.08)' : 'rgba(231,76,60,0.08)';
const scoreLabel = s => s >= 80 ? 'Good' : s >= 60 ? 'Requires Attention' : 'Critical';

function Gauge({ score }) {
  const color = scoreColor(score);
  const deg   = (score / 100) * 360;
  return (
    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
      <div style={{
        width: 180, height: 180, borderRadius: '50%',
        background: `conic-gradient(${color} 0deg ${deg}deg, #243b53 ${deg}deg 360deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'var(--card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{score}%</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>COMPLIANCE</div>
          <div style={{ fontSize: 10, color, fontWeight: 700 }}>{scoreLabel(score)}</div>
        </div>
      </div>
    </div>
  );
}

function ComplianceBar({ label, score, detail }) {
  const color = scoreColor(score);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ height: 8, background: '#e8e6e1', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)`, borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{detail}</div>
    </div>
  );
}

function TrendBar({ month, count, serious, maxCount }) {
  const h = maxCount > 0 ? Math.max(8, Math.round((count / maxCount) * 90)) : 8;
  const sh = maxCount > 0 ? Math.max(0, Math.round((serious / maxCount) * 90)) : 0;
  const label = month ? month.slice(5) : '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--navy)' }}>{count}</div>
      <div style={{ width: 28, height: 90, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 1 }}>
        <div style={{ height: sh, background: '#e74c3c', borderRadius: '3px 3px 0 0', width: '100%' }} title={`${serious} serious`} />
        <div style={{ height: h - sh, background: '#c9a84c', borderRadius: sh > 0 ? 0 : '3px 3px 0 0', width: '100%' }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function KPICard({ icon, label, value, sub, danger }) {
  return (
    <div style={{ background: danger ? 'rgba(231,76,60,0.06)' : 'var(--card)', border: `1px solid ${danger ? 'rgba(231,76,60,0.2)' : 'var(--border)'}`, borderRadius: 10, padding: '16px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: danger ? '#e74c3c' : 'var(--navy)', margin: '4px 0' }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function BoardPortal() {
  const { user } = useAuth();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api('/api/board/dashboard')
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  if (user.role_level < 4) return <div style={{ padding: 40, textAlign: 'center' }}><h2>🔒 Board & Director Access Only</h2></div>;
  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading Governance Intelligence...</p></div>;
  if (!data)   return <div style={{ padding: 40 }}><p>Failed to load board data. Is the server running?</p></div>;

  const { overallScore, compliance, incidents, safeguarding, risks, qip, complaints, governance, staffing, recentAudit, sites } = data;
  const maxTrend = Math.max(...(incidents.trend || []).map(t => t.count), 1);

  const safeguardingCritical = safeguarding.pendingScreen > 0 || safeguarding.missingNoInterview > 0;
  const riskCritical = risks.critical > 0 || risks.high > 2;

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: 'var(--navy)', marginBottom: 4 }}>Board Governance Portal</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Organisation-wide compliance intelligence · Generated {new Date(data.generated_at).toLocaleString('en-IE')}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load}>↻ Refresh</button>
      </div>

      {/* ── ROW 1: GAUGE + SAFEGUARDING + RISKS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 16, marginBottom: 20 }}>

        {/* Compliance Gauge */}
        <div className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase' }}>Overall Compliance</div>
          <Gauge score={overallScore} />
          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>Weighted across 8 governance domains</div>
        </div>

        {/* Safeguarding Panel */}
        <div className="card" style={{ padding: 20, borderLeft: `4px solid ${safeguardingCritical ? '#e74c3c' : '#27ae60'}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>🛡️ Safeguarding Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '📋', label: 'Open Referrals', v: safeguarding.openReferrals, danger: safeguarding.openReferrals > 0 },
              { icon: '⏳', label: 'Pending Screening', v: safeguarding.pendingScreen, danger: safeguarding.pendingScreen > 0 },
              { icon: '🔍', label: 'Missing No Interview', v: safeguarding.missingNoInterview, danger: safeguarding.missingNoInterview > 0 },
              { icon: '🛑', label: 'Restrictive Practice Open', v: safeguarding.restrictiveOpen, danger: safeguarding.restrictiveOpen > 0 },
              { icon: '📡', label: 'SEN Unacknowledged', v: safeguarding.senUnacknowledged, danger: safeguarding.senUnacknowledged > 0 },
              { icon: '⚠️', label: 'Critical Incidents', v: incidents.critical, danger: incidents.critical > 0 },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: item.danger ? 'rgba(231,76,60,0.06)' : 'rgba(39,174,96,0.06)', border: `1px solid ${item.danger ? 'rgba(231,76,60,0.15)' : 'rgba(39,174,96,0.15)'}` }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.danger ? '#e74c3c' : '#27ae60', lineHeight: 1 }}>{item.v}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Register */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>📉 Risk Register</div>
          {[
            { label: 'Critical', count: risks.critical, color: '#c62828', bg: '#fce4ec' },
            { label: 'High', count: risks.high, color: '#e65100', bg: '#fff3e0' },
            { label: 'Medium', count: risks.medium, color: '#f57f17', bg: '#fff8e1' },
            { label: 'Low', count: risks.low, color: '#2e7d32', bg: '#e8f5e9' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 6, background: r.bg, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>{r.label} Risk</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: r.color }}>{r.count}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
              <span>🔥 Fire Equipment Overdue</span><strong style={{ color: risks.fireOverdue > 0 ? '#e74c3c' : 'inherit' }}>{risks.fireOverdue}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              <span>🚶 PEEP Reviews Overdue</span><strong style={{ color: risks.peepOverdue > 0 ? '#e74c3c' : 'inherit' }}>{risks.peepOverdue}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: COMPLIANCE BARS + INCIDENT TREND ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>📊 Compliance Breakdown</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
            {Object.values(compliance).map((c, i) => (
              <ComplianceBar key={i} label={c.label} score={c.score} detail={c.detail} />
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>📈 Incident Trend (6 months)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#c9a84c', display: 'inline-block' }} /><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total</span>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#e74c3c', display: 'inline-block', marginLeft: 8 }} /><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Serious</span>
          </div>
          {incidents.trend.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No incidents in last 6 months</p>
            : <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120, paddingTop: 20 }}>
                {incidents.trend.map((t, i) => <TrendBar key={i} {...t} maxCount={maxTrend} />)}
              </div>
          }
          <div style={{ marginTop: 16, padding: '10px 12px', background: incidents.open > 0 ? 'rgba(231,76,60,0.06)' : 'rgba(39,174,96,0.06)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Currently Open</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: incidents.open > 0 ? '#e74c3c' : '#27ae60' }}>{incidents.open}</div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: KPI GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        <KPICard icon="📝" label="QIP Open" value={qip.open + qip.inProgress} sub={`${qip.overdue} overdue`} danger={qip.overdue > 0} />
        <KPICard icon="⚠️" label="QIP Overdue" value={qip.overdue} danger={qip.overdue > 0} />
        <KPICard icon="📣" label="Open Complaints" value={complaints.open} sub={`${complaints.overdue} overdue`} danger={complaints.overdue > 0} />
        <KPICard icon="✅" label="Gov. Actions Open" value={governance.actionsOpen} sub={`${governance.actionsOverdue} overdue`} danger={governance.actionsOverdue > 0} />
        <KPICard icon="🎓" label="Expired Training" value={staffing.expiredTraining} danger={staffing.expiredTraining > 0} />
        <KPICard icon="👁" label="Supervision Overdue" value={staffing.overdueSupervision} danger={staffing.overdueSupervision > 0} />
      </div>

      {/* ── ROW 4: STAFFING TABLE + RECENT AUDIT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><h3>👥 Staff Compliance Matrix</h3></div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Role</th><th>Last Supervision</th><th>Expired Training</th><th>Status</th></tr></thead>
            <tbody>
              {staffing.staffDetail.map(s => {
                const supOk = s.recent_sup > 0;
                const trainOk = s.expired_training === 0;
                const ok = supOk && trainOk;
                return (
                  <tr key={s.id}>
                    <td><strong>{s.full_name}</strong></td>
                    <td>{s.role_name}</td>
                    <td style={{ color: supOk ? 'inherit' : '#e74c3c', fontWeight: supOk ? 400 : 700 }}>
                      {s.last_supervision ? new Date(s.last_supervision).toLocaleDateString('en-IE') : 'Never'}
                    </td>
                    <td style={{ color: trainOk ? '#27ae60' : '#e74c3c', fontWeight: 700 }}>{s.expired_training}</td>
                    <td><span className={`badge ${ok ? 'badge-active' : 'badge-critical'}`}>{ok ? 'Compliant' : 'Action Needed'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header"><h3>📁 Recent Audit Actions</h3></div>
          <div style={{ padding: '8px 0' }}>
            {recentAudit.map((a, i) => (
              <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{a.action.replace(/_/g, ' ')}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {a.actor || 'System'} · {a.table_name} · {new Date(a.timestamp).toLocaleString('en-IE')}
                </div>
              </div>
            ))}
            {recentAudit.length === 0 && <div className="empty-state"><p>No audit entries yet</p></div>}
          </div>
        </div>
      </div>

      {/* ── ROW 5: SITES ── */}
      {sites.length > 1 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3>🏠 Registered Sites / Centres</h3></div>
          <table className="data-table">
            <thead><tr><th>Centre Name</th><th>Address</th><th>Tusla Registration</th><th>Capacity</th><th>Status</th></tr></thead>
            <tbody>
              {sites.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.address || '—'}</td>
                  <td>{s.tusla_reg || '—'}</td>
                  <td>{s.capacity || '—'}</td>
                  <td><span className="badge badge-active">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
