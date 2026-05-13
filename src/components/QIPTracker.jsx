import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function QIPTracker() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), standard: '', finding: '', action: '', owner: '', target_date: '', progress: '', evidence: '', priority: 'Medium', status: 'Open', source: 'Internal Review' });

  const load = () => { api('/api/logs/qip').then(setRecords).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/qip', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };

  const standards = ['Standard 1 — Rights','Standard 2 — Safeguarding','Standard 3 — Risk','Standard 4 — Communication','Standard 5 — Governance','Standard 6 — Workforce','Standard 7 — Premises','S.I. 674/2017','Children First Act','Fire Safety','Medication Management','Other'];
  const stats = { open: records.filter(r => r.status === 'Open').length, progress: records.filter(r => r.status === 'In Progress').length, closed: records.filter(r => r.status === 'Closed').length };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Quality Improvement Plan (QIP)</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 5 · Continuous Improvement · S.I. 674/2017 Reg. 23</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Action</button>
      </div>
      {records.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'center', padding: 16 }}><div style={{ fontSize: 28, fontWeight: 700, color: '#e74c3c' }}>{stats.open}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Open</div></div>
          <div className="card" style={{ textAlign: 'center', padding: 16 }}><div style={{ fontSize: 28, fontWeight: 700, color: '#f39c12' }}>{stats.progress}</div><div style={{ fontSize: 11, color: '#9a9484' }}>In Progress</div></div>
          <div className="card" style={{ textAlign: 'center', padding: 16 }}><div style={{ fontSize: 28, fontWeight: 700, color: '#27ae60' }}>{stats.closed}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Closed</div></div>
        </div>
      )}
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date Identified</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Source</label><select className="input" value={form.source} onChange={e => F('source', e.target.value)}>{['Internal Review','HIQA Inspection','Tusla Monitoring','Complaints Analysis','Staff Feedback','Incident Trend','Governance Meeting','External Audit'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Standard / Regulation</label><select className="input" value={form.standard} onChange={e => F('standard', e.target.value)}><option value="">Select...</option>{standards.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Priority</label><select className="input" value={form.priority} onChange={e => F('priority', e.target.value)}>{['Low','Medium','High','Critical'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Finding / Gap Identified</label><textarea className="input" rows={2} value={form.finding} onChange={e => F('finding', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Action Required</label><textarea className="input" rows={2} value={form.action} onChange={e => F('action', e.target.value)} /></div>
            <div className="form-group"><label>Owner</label><input className="input" value={form.owner} onChange={e => F('owner', e.target.value)} /></div>
            <div className="form-group"><label>Target Date</label><input className="input" type="date" value={form.target_date} onChange={e => F('target_date', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Open','In Progress','Closed','Overdue'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Progress Update</label><textarea className="input" rows={2} value={form.progress} onChange={e => F('progress', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Evidence of Completion</label><textarea className="input" rows={2} value={form.evidence} onChange={e => F('evidence', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Source</th><th>Standard</th><th>Finding</th><th>Action</th><th>Owner</th><th>Target</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td style={{ fontSize: 11 }}>{r.source}</td><td style={{ fontSize: 11 }}>{r.standard}</td><td style={{ fontSize: 11, maxWidth: 160 }}>{r.finding}</td><td style={{ fontSize: 11, maxWidth: 160 }}>{r.action}</td><td>{r.owner}</td><td>{r.target_date || '—'}</td><td><span className={`badge badge-${r.priority === 'Critical' ? 'archived' : r.priority === 'High' ? 'draft' : 'active'}`}>{r.priority}</span></td><td><span className={`badge badge-${r.status === 'Closed' ? 'active' : r.status === 'Overdue' ? 'archived' : 'draft'}`}>{r.status}</span></td></tr>))}
          {records.length === 0 && <tr><td colSpan={9}><div className="empty-state"><div className="icon">📈</div><p>No QIP actions recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
