import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function ComplianceReview() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), reviewer_id: '', period_covered: '', standard: '', finding: 'Compliant', evidence: '', actions: '', owner: '', target_date: '', status: 'Open' });

  const load = () => { api('/api/logs/compliancereview').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/compliancereview', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  const standards = ['Standard 1 — Rights','Standard 2 — Safeguarding','Standard 3 — Risk','Standard 4 — Communication','Standard 5 — Governance','Standard 6 — Workforce','Standard 7 — Premises','S.I. 674/2017 — Regulations','Children First Act 2015','Fire Services Acts','Health Act 2007'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Internal Compliance Review</h1><p style={{ color: '#9a9484', fontSize: 12 }}>Self-Assessment against HIQA Standards 2018 · Tusla Requirements</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Finding</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Review Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Reviewer</label><select className="input" value={form.reviewer_id} onChange={e => F('reviewer_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Period Covered</label><input className="input" value={form.period_covered} onChange={e => F('period_covered', e.target.value)} placeholder="e.g. Q1 2026" /></div>
            <div className="form-group"><label>Standard / Regulation</label><select className="input" value={form.standard} onChange={e => F('standard', e.target.value)}><option value="">Select...</option>{standards.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Finding</label><select className="input" value={form.finding} onChange={e => F('finding', e.target.value)}>{['Compliant','Substantially Compliant','Non-Compliant','Not Inspected'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Owner</label><input className="input" value={form.owner} onChange={e => F('owner', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Evidence</label><textarea className="input" rows={2} value={form.evidence} onChange={e => F('evidence', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Actions Required</label><textarea className="input" rows={2} value={form.actions} onChange={e => F('actions', e.target.value)} /></div>
            <div className="form-group"><label>Target Date</label><input className="input" type="date" value={form.target_date} onChange={e => F('target_date', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Open','In Progress','Closed','Escalated'].map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Reviewer</th><th>Standard</th><th>Finding</th><th>Actions</th><th>Owner</th><th>Target</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{userName(r.reviewer_id)}</td><td style={{ fontSize: 11 }}>{r.standard}</td><td><span className={`badge badge-${r.finding === 'Compliant' ? 'active' : r.finding === 'Non-Compliant' ? 'archived' : 'draft'}`}>{r.finding}</span></td><td style={{ fontSize: 11, maxWidth: 200 }}>{r.actions || '—'}</td><td>{r.owner || '—'}</td><td>{r.target_date || '—'}</td><td><span className={`badge badge-${r.status === 'Closed' ? 'active' : 'draft'}`}>{r.status}</span></td></tr>))}
          {records.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">📊</div><p>No compliance reviews recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
