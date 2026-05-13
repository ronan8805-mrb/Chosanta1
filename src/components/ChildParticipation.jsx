import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function ChildParticipation() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), type: 'House Meeting', facilitator_id: '', children_present: '', topics: '', child_feedback: '', requests: '', actions: '', action_owner: '', action_status: 'Open', notes: '' });

  const load = () => { api('/api/logs/participation').then(setRows).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/participation', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const types = ['House Meeting','Individual Consultation','Feedback Survey','Care Plan Review','Advocacy Referral','Complaints (child)','Welcome Meeting','Farewell / Discharge'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><h1 className="page-title">Children's Participation & Voice</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 1 (Rights) · Standard 4 (Communication) · UNCRC Article 12</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Record</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid #27ae60' }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Type</label><select className="input" value={form.type} onChange={e => F('type', e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="form-group"><label>Facilitator</label><select className="input" value={form.facilitator_id} onChange={e => F('facilitator_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Children Present</label><input className="input" value={form.children_present} onChange={e => F('children_present', e.target.value)} placeholder="Names or initials" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Topics Discussed</label><textarea className="input" rows={2} value={form.topics} onChange={e => F('topics', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Children's Feedback (in their own words)</label><textarea className="input" rows={2} value={form.child_feedback} onChange={e => F('child_feedback', e.target.value)} placeholder="Record what children said using their own language" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Requests / Suggestions from Children</label><textarea className="input" rows={2} value={form.requests} onChange={e => F('requests', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Actions Arising</label><textarea className="input" rows={2} value={form.actions} onChange={e => F('actions', e.target.value)} /></div>
            <div className="form-group"><label>Action Owner</label><input className="input" value={form.action_owner} onChange={e => F('action_owner', e.target.value)} /></div>
            <div className="form-group"><label>Action Status</label><select className="input" value={form.action_status} onChange={e => F('action_status', e.target.value)}>{['Open','In Progress','Completed','Deferred'].map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Type</th><th>Facilitator</th><th>Children</th><th>Feedback</th><th>Actions</th><th>Status</th></tr></thead>
          <tbody>{rows.map(r => (<tr key={r.id}><td><strong>{r.date}</strong></td><td>{r.type}</td><td>{userName(r.facilitator_id)}</td><td style={{ fontSize: 11 }}>{r.children_present || '—'}</td><td style={{ fontSize: 11, maxWidth: 200 }}>{r.child_feedback || '—'}</td><td style={{ fontSize: 11, maxWidth: 180 }}>{r.actions || '—'}</td><td><span className={`badge badge-${r.action_status === 'Completed' ? 'active' : 'draft'}`}>{r.action_status}</span></td></tr>))}
          {rows.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">🗣️</div><p>No participation records — HIQA will ask for evidence of child voice</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
