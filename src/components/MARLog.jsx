import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function MARLog() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ child_id: '', date: new Date().toISOString().slice(0,10), time: '', medication_name: '', dose: '', route: 'Oral', administered_by: '', witnessed_by: '', status: 'Given', refusal_reason: '', prn_reason: '', notes: '' });

  const load = () => { api('/api/logs/mar').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/mar', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Medication Administration Record (MAR)</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 1 · Pharmacy Act · Misuse of Drugs Act</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print</button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Record Administration</button>
        </div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Time</label><input className="input" type="time" value={form.time} onChange={e => F('time', e.target.value)} /></div>
            <div className="form-group"><label>Medication Name</label><input className="input" value={form.medication_name} onChange={e => F('medication_name', e.target.value)} /></div>
            <div className="form-group"><label>Dose</label><input className="input" value={form.dose} onChange={e => F('dose', e.target.value)} placeholder="e.g. 500mg" /></div>
            <div className="form-group"><label>Route</label><select className="input" value={form.route} onChange={e => F('route', e.target.value)}>{['Oral','Topical','Inhaler','Injection','Eye Drops','Ear Drops','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Administered By</label><select className="input" value={form.administered_by} onChange={e => F('administered_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Witnessed By</label><select className="input" value={form.witnessed_by} onChange={e => F('witnessed_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Given','Refused','Withheld','Self-Administered','Not Available','PRN Given'].map(s => <option key={s}>{s}</option>)}</select></div>
            {form.status === 'Refused' && <div className="form-group"><label>Refusal Reason</label><input className="input" value={form.refusal_reason} onChange={e => F('refusal_reason', e.target.value)} /></div>}
            {form.status === 'PRN Given' && <div className="form-group"><label>PRN Reason</label><input className="input" value={form.prn_reason} onChange={e => F('prn_reason', e.target.value)} /></div>}
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => F('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Time</th><th>Child</th><th>Medication</th><th>Dose</th><th>Route</th><th>Given By</th><th>Witness</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{r.time}</td><td>{childName(r.child_id)}</td><td><strong>{r.medication_name}</strong></td><td>{r.dose}</td><td>{r.route}</td><td>{userName(r.administered_by)}</td><td>{userName(r.witnessed_by)}</td><td><span className={`badge badge-${r.status === 'Given' || r.status === 'PRN Given' ? 'active' : r.status === 'Refused' ? 'archived' : 'draft'}`}>{r.status}</span></td></tr>))}
          {records.length === 0 && <tr><td colSpan={9}><div className="empty-state"><div className="icon">💊</div><p>No medication records yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
