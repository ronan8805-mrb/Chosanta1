import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function SupervisionLog() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ staff_id: '', supervisor_id: '', date: new Date().toISOString().slice(0,10), session_no: 1, duration: '60 mins', location: 'Office', workload_notes: '', wellbeing_notes: '', training_notes: '', actions: '', next_date: '' });

  const load = () => { api('/api/logs/supervision').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/supervision', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Staff Supervision Record</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-SSR-001 · HIQA Standard 6</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Session</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Staff Member</label><select className="input" value={form.staff_id} onChange={e => F('staff_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Supervisor</label><select className="input" value={form.supervisor_id} onChange={e => F('supervisor_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Session #</label><input className="input" type="number" value={form.session_no} onChange={e => F('session_no', parseInt(e.target.value))} /></div>
            <div className="form-group"><label>Duration</label><input className="input" value={form.duration} onChange={e => F('duration', e.target.value)} /></div>
            <div className="form-group"><label>Location</label><input className="input" value={form.location} onChange={e => F('location', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Workload & Caseload Discussion</label><textarea className="input" rows={2} value={form.workload_notes} onChange={e => F('workload_notes', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Staff Wellbeing & Support</label><textarea className="input" rows={2} value={form.wellbeing_notes} onChange={e => F('wellbeing_notes', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Training & Development</label><textarea className="input" rows={2} value={form.training_notes} onChange={e => F('training_notes', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Agreed Actions</label><textarea className="input" rows={2} value={form.actions} onChange={e => F('actions', e.target.value)} /></div>
            <div className="form-group"><label>Next Session Date</label><input className="input" type="date" value={form.next_date} onChange={e => F('next_date', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Staff</th><th>Supervisor</th><th>#</th><th>Duration</th><th>Actions</th><th>Next</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td><strong>{userName(r.staff_id)}</strong></td><td>{userName(r.supervisor_id)}</td><td>{r.session_no}</td><td>{r.duration}</td><td style={{ fontSize: 11, maxWidth: 200 }}>{r.actions || '—'}</td><td>{r.next_date || '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">👁</div><p>No supervision records yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
