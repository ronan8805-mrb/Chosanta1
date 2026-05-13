import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function StaffRoster() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ week_commencing: '', staff_id: '', monday: 'Off', tuesday: 'Off', wednesday: 'Off', thursday: 'Off', friday: 'Off', saturday: 'Off', sunday: 'Off', total_hours: '', notes: '' });

  const load = () => { api('/api/logs/roster').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { const d = { ...form }; if (d.total_hours) d.total_hours = parseFloat(d.total_hours); else delete d.total_hours; await api('/api/logs/roster', { method: 'POST', body: JSON.stringify(d) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const shifts = ['Off', 'Day (8-20)', 'Night (20-8)', 'Long Day (8-22)', 'Sleepover', 'Annual Leave', 'Sick', 'Training'];
  const shiftColor = s => s === 'Off' ? '#5c5648' : s.includes('Sick') ? '#e74c3c' : s.includes('Leave') ? '#3498db' : s.includes('Training') ? '#9b59b6' : '#27ae60';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Staff Roster & Rota</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 6 · Staffing & Workforce Planning</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print</button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Shift</button>
        </div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Week Commencing</label><input className="input" type="date" value={form.week_commencing} onChange={e => F('week_commencing', e.target.value)} /></div>
            <div className="form-group"><label>Staff Member</label><select className="input" value={form.staff_id} onChange={e => F('staff_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
              <div className="form-group" key={day}><label>{day.charAt(0).toUpperCase() + day.slice(1)}</label><select className="input" value={form[day]} onChange={e => F(day, e.target.value)}>{shifts.map(s => <option key={s}>{s}</option>)}</select></div>
            ))}
            <div className="form-group"><label>Total Hours</label><input className="input" type="number" value={form.total_hours} onChange={e => F('total_hours', e.target.value)} /></div>
            <div className="form-group"><label>Notes</label><input className="input" value={form.notes} onChange={e => F('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Week</th><th>Staff</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th><th>Hrs</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.week_commencing}</td><td><strong>{userName(r.staff_id)}</strong></td>{['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => <td key={d} style={{ fontSize: 10, color: shiftColor(r[d] || 'Off'), fontWeight: 600 }}>{r[d] || 'Off'}</td>)}<td>{r.total_hours || '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={10}><div className="empty-state"><div className="icon">📅</div><p>No roster entries yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
