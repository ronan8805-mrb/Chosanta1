import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function StaffAttendance() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), staff_id: '', shift: 'Day', status: 'Present', absence_reason: '', certified: 0, return_date: '', notes: '' });

  const load = () => { api('/api/logs/attendance').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/attendance', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); setForm({ date: new Date().toISOString().slice(0,10), staff_id: '', shift: 'Day', status: 'Present', absence_reason: '', certified: 0, return_date: '', notes: '' }); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Staff Attendance, Sick Leave & Staffing Stability</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-SAL-001 · HIQA Standard 6</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Record</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Staff Member</label><select className="input" value={form.staff_id} onChange={e => F('staff_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Shift</label><select className="input" value={form.shift} onChange={e => F('shift', e.target.value)}>{['Day','Night','Long Day','Sleepover'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Present','Absent - Sick','Absent - Annual Leave','Absent - Other','Late','Agency Cover'].map(s => <option key={s}>{s}</option>)}</select></div>
            {form.status.includes('Absent') && <><div className="form-group"><label>Absence Reason</label><input className="input" value={form.absence_reason} onChange={e => F('absence_reason', e.target.value)} /></div>
            <div className="form-group"><label>GP Certified?</label><select className="input" value={form.certified} onChange={e => F('certified', parseInt(e.target.value))}><option value={0}>No</option><option value={1}>Yes</option></select></div>
            <div className="form-group"><label>Return Date</label><input className="input" type="date" value={form.return_date} onChange={e => F('return_date', e.target.value)} /></div></>}
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => F('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save Record</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Staff</th><th>Shift</th><th>Status</th><th>Reason</th><th>Certified</th><th>Notes</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{userName(r.staff_id)}</td><td>{r.shift}</td><td><span className={`badge badge-${r.status === 'Present' ? 'active' : 'draft'}`}>{r.status}</span></td><td>{r.absence_reason || '—'}</td><td>{r.certified ? '✅' : '—'}</td><td style={{ fontSize: 11 }}>{r.notes || '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">📅</div><p>No attendance records yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
