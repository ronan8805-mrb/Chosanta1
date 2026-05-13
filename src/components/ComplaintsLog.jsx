import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function ComplaintsLog() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date_received: new Date().toISOString().slice(0,10), complainant: '', received_via: 'Verbal', category: 'Service Quality', description: '', investigating_officer: '', outcome: '', response_date: '', within_timeframe: 1, learning: '', status: 'Open' });

  const load = () => { api('/api/logs/complaints').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/complaints', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Complaints Review & Quality Audit</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-CLR-001 · HIQA Standard 4 · S.I. 674/2017</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Complaint</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date Received</label><input className="input" type="date" value={form.date_received} onChange={e => F('date_received', e.target.value)} /></div>
            <div className="form-group"><label>Complainant</label><input className="input" value={form.complainant} onChange={e => F('complainant', e.target.value)} placeholder="Name or Anonymous" /></div>
            <div className="form-group"><label>Received Via</label><select className="input" value={form.received_via} onChange={e => F('received_via', e.target.value)}>{['Verbal','Written','Email','Phone','Advocate','Anonymous'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Category</label><select className="input" value={form.category} onChange={e => F('category', e.target.value)}>{['Service Quality','Staff Conduct','Communication','Facilities','Safeguarding','Medication','Rights','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Description</label><textarea className="input" rows={3} value={form.description} onChange={e => F('description', e.target.value)} /></div>
            <div className="form-group"><label>Investigating Officer</label><select className="input" value={form.investigating_officer} onChange={e => F('investigating_officer', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Open','Under Investigation','Resolved','Escalated','Closed'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Outcome / Findings</label><textarea className="input" rows={2} value={form.outcome} onChange={e => F('outcome', e.target.value)} /></div>
            <div className="form-group"><label>Response Date</label><input className="input" type="date" value={form.response_date} onChange={e => F('response_date', e.target.value)} /></div>
            <div className="form-group"><label>Within Timeframe?</label><select className="input" value={form.within_timeframe} onChange={e => F('within_timeframe', parseInt(e.target.value))}><option value={1}>Yes (within 30 days)</option><option value={0}>No</option></select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Learning / Service Change</label><textarea className="input" rows={2} value={form.learning} onChange={e => F('learning', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Complainant</th><th>Via</th><th>Category</th><th>Description</th><th>Officer</th><th>Status</th><th>Timeframe</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date_received}</td><td>{r.complainant}</td><td>{r.received_via}</td><td>{r.category}</td><td style={{ fontSize: 11, maxWidth: 200 }}>{r.description}</td><td>{userName(r.investigating_officer)}</td><td><span className={`badge badge-${r.status === 'Resolved' || r.status === 'Closed' ? 'active' : 'draft'}`}>{r.status}</span></td><td>{r.within_timeframe ? '✅' : '❌'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">📝</div><p>No complaints recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
