import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function HouseRiskAssessment() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), assessed_by: '', area: '', hazard: '', risk_level: 'Low', existing_controls: '', additional_actions: '', responsible: '', target_date: '', status: 'Open' });

  const load = () => { api('/api/logs/houserisk').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/houserisk', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">House Risk Assessment</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 7 · Safety, Health & Welfare at Work Act 2005</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Hazard</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Assessed By</label><select className="input" value={form.assessed_by} onChange={e => F('assessed_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Area</label><select className="input" value={form.area} onChange={e => F('area', e.target.value)}><option value="">Select...</option>{['Kitchen','Living Room','Bedrooms','Bathrooms','Stairs/Landing','Garden/External','Office','Laundry','Storage','Whole Building'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Risk Level</label><select className="input" value={form.risk_level} onChange={e => F('risk_level', e.target.value)}>{['Low','Medium','High','Critical'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Hazard Description</label><textarea className="input" rows={2} value={form.hazard} onChange={e => F('hazard', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Existing Controls</label><textarea className="input" rows={2} value={form.existing_controls} onChange={e => F('existing_controls', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Additional Actions Required</label><textarea className="input" rows={2} value={form.additional_actions} onChange={e => F('additional_actions', e.target.value)} /></div>
            <div className="form-group"><label>Responsible Person</label><input className="input" value={form.responsible} onChange={e => F('responsible', e.target.value)} /></div>
            <div className="form-group"><label>Target Date</label><input className="input" type="date" value={form.target_date} onChange={e => F('target_date', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Area</th><th>Hazard</th><th>Level</th><th>Controls</th><th>Actions</th><th>Owner</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{r.area}</td><td style={{ fontSize: 11, maxWidth: 180 }}>{r.hazard}</td><td><span className={`badge badge-${r.risk_level === 'Critical' ? 'archived' : r.risk_level === 'High' ? 'draft' : 'active'}`}>{r.risk_level}</span></td><td style={{ fontSize: 11, maxWidth: 160 }}>{r.existing_controls || '—'}</td><td style={{ fontSize: 11, maxWidth: 160 }}>{r.additional_actions || '—'}</td><td>{r.responsible || '—'}</td><td><span className={`badge badge-${r.status === 'Closed' ? 'active' : 'draft'}`}>{r.status}</span></td></tr>))}
          {records.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">🏠</div><p>No house risk assessments recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
