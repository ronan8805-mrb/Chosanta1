import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function RiskRegister() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ risk_id: '', description: '', location: '', likelihood: 'Possible', impact: 'Moderate', rating: 'Medium', controls: '', responsible: '', review_date: '', status: 'Active' });

  const load = () => { api('/api/logs/riskregister').then(setRecords).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/riskregister', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); setForm({ ...form, risk_id: '', description: '', controls: '' }); load(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Risk Register & Index</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 3 · Risk Management Framework</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Risk</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Risk ID</label><input className="input" value={form.risk_id} onChange={e => F('risk_id', e.target.value)} placeholder="e.g. R-001" /></div>
            <div className="form-group"><label>Location / Area</label><input className="input" value={form.location} onChange={e => F('location', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Description of Risk</label><textarea className="input" rows={2} value={form.description} onChange={e => F('description', e.target.value)} /></div>
            <div className="form-group"><label>Likelihood</label><select className="input" value={form.likelihood} onChange={e => F('likelihood', e.target.value)}>{['Rare','Unlikely','Possible','Likely','Almost Certain'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Impact</label><select className="input" value={form.impact} onChange={e => F('impact', e.target.value)}>{['Negligible','Minor','Moderate','Major','Catastrophic'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Rating</label><select className="input" value={form.rating} onChange={e => F('rating', e.target.value)}>{['Low','Medium','High','Critical'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Control Measures in Place</label><textarea className="input" rows={2} value={form.controls} onChange={e => F('controls', e.target.value)} /></div>
            <div className="form-group"><label>Responsible Person</label><input className="input" value={form.responsible} onChange={e => F('responsible', e.target.value)} /></div>
            <div className="form-group"><label>Review Date</label><input className="input" type="date" value={form.review_date} onChange={e => F('review_date', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>ID</th><th>Description</th><th>Location</th><th>Likelihood</th><th>Impact</th><th>Rating</th><th>Controls</th><th>Owner</th><th>Review</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td><code style={{ fontSize: 10, background: 'rgba(201,168,76,0.15)', color: '#c9a84c', padding: '2px 6px', borderRadius: 3 }}>{r.risk_id}</code></td><td style={{ fontSize: 11, maxWidth: 180 }}>{r.description}</td><td>{r.location}</td><td style={{ fontSize: 11 }}>{r.likelihood}</td><td style={{ fontSize: 11 }}>{r.impact}</td><td><span className={`badge badge-${r.rating === 'Critical' ? 'archived' : r.rating === 'High' ? 'draft' : 'active'}`}>{r.rating}</span></td><td style={{ fontSize: 11, maxWidth: 160 }}>{r.controls}</td><td>{r.responsible}</td><td>{r.review_date || '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={9}><div className="empty-state"><div className="icon">📊</div><p>No risks registered</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
