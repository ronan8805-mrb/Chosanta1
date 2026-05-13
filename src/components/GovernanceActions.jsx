import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function GovernanceActions() {
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source: 'Governance Meeting', date: new Date().toISOString().slice(0,10), action: '', owner: '', target_date: '', priority: 'Medium', progress: '', evidence: '', status: 'Open' });

  const load = () => api('/api/logs/govactions').then(setRows).catch(() => {});
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/govactions', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };

  const open = rows.filter(r => r.status === 'Open').length;
  const overdue = rows.filter(r => r.status === 'Open' && r.target_date && new Date(r.target_date) < new Date()).length;
  const sources = ['Governance Meeting','QIP','Inspection Finding','Complaint','Incident Review','Risk Register','Staff Meeting','Compliance Review','Internal Audit','External Audit'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><h1 className="page-title">Governance Action Tracker</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 5 · Linked to QIP · Meeting Actions · Inspection Follow-Up</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Action</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 24, fontWeight: 700 }}>{rows.length}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Total Actions</div></div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 24, fontWeight: 700, color: open > 0 ? '#f39c12' : '#27ae60' }}>{open}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Open</div></div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 24, fontWeight: 700, color: overdue > 0 ? '#e74c3c' : '#27ae60' }}>{overdue}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Overdue</div></div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 24, fontWeight: 700, color: '#27ae60' }}>{rows.filter(r => r.status === 'Closed').length}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Closed</div></div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Source</label><select className="input" value={form.source} onChange={e => F('source', e.target.value)}>{sources.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Date Raised</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Priority</label><select className="input" value={form.priority} onChange={e => F('priority', e.target.value)}>{['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}</select></div>
            <div className="form-group"><label>Owner</label><input className="input" value={form.owner} onChange={e => F('owner', e.target.value)} /></div>
            <div className="form-group"><label>Target Date</label><input className="input" type="date" value={form.target_date} onChange={e => F('target_date', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Open','In Progress','Closed','Deferred'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Action Required</label><textarea className="input" rows={2} value={form.action} onChange={e => F('action', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Progress / Update</label><textarea className="input" rows={2} value={form.progress} onChange={e => F('progress', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Evidence</label><input className="input" value={form.evidence} onChange={e => F('evidence', e.target.value)} placeholder="e.g. Policy updated, training delivered, audit complete" /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Source</th><th>Action</th><th>Owner</th><th>Target</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>{rows.map(r => { const od = r.status === 'Open' && r.target_date && new Date(r.target_date) < new Date(); return (<tr key={r.id} style={od ? { background: 'rgba(231,76,60,0.06)' } : {}}><td>{r.date}</td><td style={{ fontSize: 11 }}>{r.source}</td><td style={{ fontSize: 12, maxWidth: 250 }}>{r.action}</td><td>{r.owner || '—'}</td><td style={{ color: od ? '#e74c3c' : 'inherit' }}>{r.target_date || '—'} {od ? '⚠️' : ''}</td><td><span className={`badge badge-${r.priority?.toLowerCase()}`}>{r.priority}</span></td><td><span className={`badge badge-${r.status === 'Closed' ? 'active' : r.status === 'Open' ? 'draft' : 'warning'}`}>{r.status}</span></td></tr>)})}
          {rows.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">📋</div><p>No governance actions tracked</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
