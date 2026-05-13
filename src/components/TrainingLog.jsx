import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function TrainingLog() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ staff_id: '', training_title: '', category: 'Mandatory', provider: '', date_completed: '', expiry_date: '', competent: 1, cert_on_file: 0 });

  const load = () => { api('/api/logs/training').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/training', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Training Attendance & Competency Sign-Off</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-TAS-001 · HIQA Standard 6</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Record</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Staff Member</label><select className="input" value={form.staff_id} onChange={e => F('staff_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Training Title</label><input className="input" value={form.training_title} onChange={e => F('training_title', e.target.value)} placeholder="e.g. TCI Refresher" /></div>
            <div className="form-group"><label>Category</label><select className="input" value={form.category} onChange={e => F('category', e.target.value)}>{['Mandatory','Safeguarding','Fire Safety','First Aid','Manual Handling','TCI','Medication','GDPR','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Provider / Trainer</label><input className="input" value={form.provider} onChange={e => F('provider', e.target.value)} /></div>
            <div className="form-group"><label>Date Completed</label><input className="input" type="date" value={form.date_completed} onChange={e => F('date_completed', e.target.value)} /></div>
            <div className="form-group"><label>Expiry / Next Due</label><input className="input" type="date" value={form.expiry_date} onChange={e => F('expiry_date', e.target.value)} /></div>
            <div className="form-group"><label>Competent?</label><select className="input" value={form.competent} onChange={e => F('competent', parseInt(e.target.value))}><option value={1}>Yes</option><option value={0}>No — Refresher Needed</option></select></div>
            <div className="form-group"><label>Certificate on File?</label><select className="input" value={form.cert_on_file} onChange={e => F('cert_on_file', parseInt(e.target.value))}><option value={0}>No</option><option value={1}>Yes</option></select></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Staff</th><th>Training</th><th>Category</th><th>Provider</th><th>Completed</th><th>Expiry</th><th>Competent</th><th>Cert</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{userName(r.staff_id)}</td><td><strong>{r.training_title}</strong></td><td>{r.category}</td><td>{r.provider}</td><td>{r.date_completed}</td><td style={{ color: r.expiry_date && r.expiry_date < new Date().toISOString().slice(0,10) ? '#e74c3c' : 'inherit' }}>{r.expiry_date || '—'}</td><td>{r.competent ? '✅' : '❌'}</td><td>{r.cert_on_file ? '📄' : '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">🎓</div><p>No training records yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
