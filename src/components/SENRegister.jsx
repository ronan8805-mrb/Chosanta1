import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function SENRegister() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), child_id: '', category: 'Safeguarding', description: '', reported_to: 'Tusla', reported_by: '', method: 'NIMS Portal', nims_ref: '', acknowledged: 0, acknowledgement_date: '', outcome: '' });

  const load = () => { api('/api/logs/sen').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/sen', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Significant Event Notification (SEN) Register</h1><p style={{ color: '#9a9484', fontSize: 12 }}>Tusla NIMS · HIQA Standard 3 · 24-hour reporting requirement</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New SEN</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Category</label><select className="input" value={form.category} onChange={e => F('category', e.target.value)}>{['Safeguarding','Physical Injury','Absconding','Restraint','Medication Error','Death','Allegation Against Staff','Self-Harm','Criminal Activity','Fire','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Reported To</label><select className="input" value={form.reported_to} onChange={e => F('reported_to', e.target.value)}>{['Tusla','HIQA','An Garda Síochána','HSE','Multiple Agencies'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Description</label><textarea className="input" rows={3} value={form.description} onChange={e => F('description', e.target.value)} /></div>
            <div className="form-group"><label>Reported By</label><select className="input" value={form.reported_by} onChange={e => F('reported_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Method</label><select className="input" value={form.method} onChange={e => F('method', e.target.value)}>{['NIMS Portal','Phone','Email','In Person'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>NIMS Ref</label><input className="input" value={form.nims_ref} onChange={e => F('nims_ref', e.target.value)} /></div>
            <div className="form-group"><label>Acknowledged?</label><select className="input" value={form.acknowledged} onChange={e => F('acknowledged', parseInt(e.target.value))}><option value={0}>Awaiting</option><option value={1}>Yes</option></select></div>
            {form.acknowledged === 1 && <div className="form-group"><label>Acknowledgement Date</label><input className="input" type="date" value={form.acknowledgement_date} onChange={e => F('acknowledgement_date', e.target.value)} /></div>}
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Outcome</label><textarea className="input" rows={2} value={form.outcome} onChange={e => F('outcome', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save SEN</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Child</th><th>Category</th><th>Description</th><th>Reported To</th><th>NIMS Ref</th><th>Acknowledged</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{childName(r.child_id)}</td><td><span className={`badge badge-${r.category === 'Safeguarding' ? 'archived' : 'draft'}`}>{r.category}</span></td><td style={{ fontSize: 11, maxWidth: 220 }}>{r.description}</td><td>{r.reported_to}</td><td>{r.nims_ref || '—'}</td><td>{r.acknowledged ? '✅' : '⏳'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">📡</div><p>No SENs recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
