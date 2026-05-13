import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function MaintenanceLog() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date_reported: new Date().toISOString().slice(0,10), description: '', location: '', risk_level: 'Low', reported_by: '', contractor: '', date_completed: '', cost: '', pic_signoff: 0, status: 'Open' });

  const load = () => { api('/api/logs/maintenance').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { const d = { ...form }; if (d.cost) d.cost = parseFloat(d.cost); else delete d.cost; await api('/api/logs/maintenance', { method: 'POST', body: JSON.stringify(d) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Maintenance & Repairs Log</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-MRL-001 · HIQA Standard 7</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Report Issue</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date Reported</label><input className="input" type="date" value={form.date_reported} onChange={e => F('date_reported', e.target.value)} /></div>
            <div className="form-group"><label>Location</label><input className="input" value={form.location} onChange={e => F('location', e.target.value)} placeholder="e.g. Kitchen, Room 3" /></div>
            <div className="form-group"><label>Risk Level</label><select className="input" value={form.risk_level} onChange={e => F('risk_level', e.target.value)}>{['Low','Medium','High','Critical'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Reported By</label><select className="input" value={form.reported_by} onChange={e => F('reported_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Issue Description</label><textarea className="input" rows={2} value={form.description} onChange={e => F('description', e.target.value)} /></div>
            <div className="form-group"><label>Contractor</label><input className="input" value={form.contractor} onChange={e => F('contractor', e.target.value)} /></div>
            <div className="form-group"><label>Date Completed</label><input className="input" type="date" value={form.date_completed} onChange={e => F('date_completed', e.target.value)} /></div>
            <div className="form-group"><label>Cost (€)</label><input className="input" type="number" step="0.01" value={form.cost} onChange={e => F('cost', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Open','In Progress','Awaiting Parts','Completed'].map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Location</th><th>Issue</th><th>Risk</th><th>Contractor</th><th>Status</th><th>Cost</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date_reported}</td><td>{r.location}</td><td style={{ maxWidth: 200, fontSize: 11 }}>{r.description}</td><td><span className={`badge badge-${r.risk_level === 'Critical' ? 'archived' : r.risk_level === 'High' ? 'draft' : 'active'}`}>{r.risk_level}</span></td><td>{r.contractor || '—'}</td><td><span className={`badge badge-${r.status === 'Completed' ? 'active' : 'draft'}`}>{r.status}</span></td><td>{r.cost ? `€${r.cost}` : '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">🔧</div><p>No maintenance records yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
