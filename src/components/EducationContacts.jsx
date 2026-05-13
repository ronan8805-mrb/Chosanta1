import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function EducationContacts() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ child_id: '', school: '', year_class: '', school_contact: '', school_phone: '', senco_contact: '', month: new Date().toISOString().slice(0,7), days_attended: '', days_absent: '', absence_reason: '', school_feedback: '', notes: '' });

  const load = () => { api('/api/logs/educontacts').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { const d = { ...form }; if (d.days_attended) d.days_attended = parseInt(d.days_attended); else delete d.days_attended; if (d.days_absent) d.days_absent = parseInt(d.days_absent); else delete d.days_absent; await api('/api/logs/educontacts', { method: 'POST', body: JSON.stringify(d) }); setShowForm(false); load(); };
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Education & School Contact Records</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 2 · Education (Welfare) Act 2000</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Record</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>School</label><input className="input" value={form.school} onChange={e => F('school', e.target.value)} /></div>
            <div className="form-group"><label>Year / Class</label><input className="input" value={form.year_class} onChange={e => F('year_class', e.target.value)} /></div>
            <div className="form-group"><label>School Contact</label><input className="input" value={form.school_contact} onChange={e => F('school_contact', e.target.value)} /></div>
            <div className="form-group"><label>School Phone</label><input className="input" value={form.school_phone} onChange={e => F('school_phone', e.target.value)} /></div>
            <div className="form-group"><label>SENCO Contact</label><input className="input" value={form.senco_contact} onChange={e => F('senco_contact', e.target.value)} /></div>
            <div className="form-group"><label>Month</label><input className="input" type="month" value={form.month} onChange={e => F('month', e.target.value)} /></div>
            <div className="form-group"><label>Days Attended</label><input className="input" type="number" value={form.days_attended} onChange={e => F('days_attended', e.target.value)} /></div>
            <div className="form-group"><label>Days Absent</label><input className="input" type="number" value={form.days_absent} onChange={e => F('days_absent', e.target.value)} /></div>
            <div className="form-group"><label>Absence Reason</label><input className="input" value={form.absence_reason} onChange={e => F('absence_reason', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>School Feedback</label><textarea className="input" rows={2} value={form.school_feedback} onChange={e => F('school_feedback', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => F('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Child</th><th>School</th><th>Month</th><th>Attended</th><th>Absent</th><th>Reason</th><th>Feedback</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td><strong>{childName(r.child_id)}</strong></td><td>{r.school}</td><td>{r.month}</td><td style={{ color: '#27ae60', fontWeight: 600 }}>{r.days_attended ?? '—'}</td><td style={{ color: r.days_absent > 3 ? '#e74c3c' : 'inherit', fontWeight: 600 }}>{r.days_absent ?? '—'}</td><td style={{ fontSize: 11 }}>{r.absence_reason || '—'}</td><td style={{ fontSize: 11, maxWidth: 200 }}>{r.school_feedback || '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">🎓</div><p>No education records yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
