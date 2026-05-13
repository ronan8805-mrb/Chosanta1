import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function StaffInduction() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ staff_id: '', start_date: new Date().toISOString().slice(0,10), mentor_id: '', policies_read: 0, safeguarding_training: 0, fire_safety_training: 0, first_aid_training: 0, medication_training: 0, manual_handling: 0, children_first: 0, house_orientation: 0, emergency_procedures: 0, data_protection: 0, lone_working: 0, completion_date: '', sign_off_by: '', notes: '', status: 'In Progress' });

  const load = () => { api('/api/logs/induction').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/induction', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const yn = v => v ? '✅' : '⬜';

  const checkItems = [
    ['policies_read', 'All Policies Read & Signed'],
    ['safeguarding_training', 'Safeguarding / Child Protection'],
    ['fire_safety_training', 'Fire Safety & Evacuation'],
    ['first_aid_training', 'First Aid'],
    ['medication_training', 'Medication Administration'],
    ['manual_handling', 'Manual Handling'],
    ['children_first', 'Children First Act 2015'],
    ['house_orientation', 'House Orientation & Tour'],
    ['emergency_procedures', 'Emergency Procedures'],
    ['data_protection', 'Data Protection / GDPR'],
    ['lone_working', 'Lone Working Policy'],
  ];

  const countDone = (r) => checkItems.filter(([k]) => r[k]).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Staff Induction Checklist</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 6 · Safer Recruitment · S.I. 674/2017</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Induction</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Staff Member</label><select className="input" value={form.staff_id} onChange={e => F('staff_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Start Date</label><input className="input" type="date" value={form.start_date} onChange={e => F('start_date', e.target.value)} /></div>
            <div className="form-group"><label>Mentor / Buddy</label><select className="input" value={form.mentor_id} onChange={e => F('mentor_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['In Progress','Completed','Overdue','Extended'].map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <h4 style={{ marginTop: 16, marginBottom: 12, color: '#c9a84c' }}>✅ Induction Checklist</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {checkItems.map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(201,168,76,0.05)', borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(201,168,76,0.1)' }}>
                <input type="checkbox" checked={!!form[key]} onChange={e => F(key, e.target.checked ? 1 : 0)} />
                <span style={{ fontSize: 13 }}>{label}</span>
              </label>
            ))}
          </div>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="form-group"><label>Completion Date</label><input className="input" type="date" value={form.completion_date} onChange={e => F('completion_date', e.target.value)} /></div>
            <div className="form-group"><label>Signed Off By</label><select className="input" value={form.sign_off_by} onChange={e => F('sign_off_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => F('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Staff</th><th>Start</th><th>Mentor</th><th>Progress</th><th>Completed</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => {const done = countDone(r); const pct = Math.round(done/checkItems.length*100); return (<tr key={r.id}><td><strong>{userName(r.staff_id)}</strong></td><td>{r.start_date}</td><td>{userName(r.mentor_id)}</td><td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#27ae60' : '#c9a84c', borderRadius: 3 }} /></div><span style={{ fontSize: 11 }}>{done}/{checkItems.length}</span></div></td><td>{r.completion_date || '—'}</td><td><span className={`badge badge-${r.status === 'Completed' ? 'active' : r.status === 'Overdue' ? 'archived' : 'draft'}`}>{r.status}</span></td></tr>)})}
          {records.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="icon">📝</div><p>No induction records</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
