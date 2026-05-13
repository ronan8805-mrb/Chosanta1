import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function ChildRiskAssessment() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ child_id: '', date: new Date().toISOString().slice(0,10), assessed_by: '', risk_area: 'Self-Harm', risk_description: '', likelihood: 'Possible', impact: 'Moderate', risk_level: 'Medium', control_measures: '', review_date: '', status: 'Active' });

  const load = () => { api('/api/logs/childrisk').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/childrisk', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Child-Specific Risk Assessment Log</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 3 · Risk Management · Individual Safety Plans</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Assessment</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Assessed By</label><select className="input" value={form.assessed_by} onChange={e => F('assessed_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Risk Area</label><select className="input" value={form.risk_area} onChange={e => F('risk_area', e.target.value)}>{['Self-Harm','Absconding','Aggression','Substance Misuse','Sexual Exploitation','Criminal Activity','Bullying','Online Safety','Mental Health','Physical Health','Family Contact','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Risk Description</label><textarea className="input" rows={2} value={form.risk_description} onChange={e => F('risk_description', e.target.value)} /></div>
            <div className="form-group"><label>Likelihood</label><select className="input" value={form.likelihood} onChange={e => F('likelihood', e.target.value)}>{['Rare','Unlikely','Possible','Likely','Almost Certain'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Impact</label><select className="input" value={form.impact} onChange={e => F('impact', e.target.value)}>{['Negligible','Minor','Moderate','Major','Catastrophic'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Risk Level</label><select className="input" value={form.risk_level} onChange={e => F('risk_level', e.target.value)}>{['Low','Medium','High','Critical'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Control Measures</label><textarea className="input" rows={3} value={form.control_measures} onChange={e => F('control_measures', e.target.value)} placeholder="What measures are in place to mitigate this risk?" /></div>
            <div className="form-group"><label>Review Date</label><input className="input" type="date" value={form.review_date} onChange={e => F('review_date', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Active','Under Review','Closed','Escalated'].map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Child</th><th>Risk Area</th><th>Level</th><th>Description</th><th>Controls</th><th>Review</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td><strong>{childName(r.child_id)}</strong></td><td>{r.risk_area}</td><td><span className={`badge badge-${r.risk_level === 'Critical' ? 'archived' : r.risk_level === 'High' ? 'draft' : 'active'}`}>{r.risk_level}</span></td><td style={{ fontSize: 11, maxWidth: 180 }}>{r.risk_description}</td><td style={{ fontSize: 11, maxWidth: 180 }}>{r.control_measures}</td><td>{r.review_date || '—'}</td><td><span className={`badge badge-${r.status === 'Active' ? 'active' : r.status === 'Escalated' ? 'archived' : 'draft'}`}>{r.status}</span></td></tr>))}
          {records.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">⚠️</div><p>No child risk assessments recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
