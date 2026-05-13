import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function CarePlanLog() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ child_id: '', keyworker_id: '', date: new Date().toISOString().slice(0,10), placement_date: '', legal_status: 'Voluntary Care (s.4)', objectives: '', health_needs: '', education_needs: '', family_contact: '', life_skills: '', review_date: '', review_outcome: '', status: 'Active' });

  const load = () => { api('/api/logs/careplans').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/careplans', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Statutory Care Plan & Placement Plan</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 2 · S.I. 674/2017 · Child Care Act 1991</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Plan</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Keyworker</label><select className="input" value={form.keyworker_id} onChange={e => F('keyworker_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Plan Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Placement Date</label><input className="input" type="date" value={form.placement_date} onChange={e => F('placement_date', e.target.value)} /></div>
            <div className="form-group"><label>Legal Status</label><select className="input" value={form.legal_status} onChange={e => F('legal_status', e.target.value)}>{['Voluntary Care (s.4)','Care Order (s.18)','Interim Care (s.17)','Emergency Care (s.13)','Special Care','Supervision Order'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Review Date</label><input className="input" type="date" value={form.review_date} onChange={e => F('review_date', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Objectives & Goals</label><textarea className="input" rows={3} value={form.objectives} onChange={e => F('objectives', e.target.value)} /></div>
            <div className="form-group"><label>Health Needs</label><textarea className="input" rows={2} value={form.health_needs} onChange={e => F('health_needs', e.target.value)} /></div>
            <div className="form-group"><label>Education Needs</label><textarea className="input" rows={2} value={form.education_needs} onChange={e => F('education_needs', e.target.value)} /></div>
            <div className="form-group"><label>Family Contact Arrangements</label><textarea className="input" rows={2} value={form.family_contact} onChange={e => F('family_contact', e.target.value)} /></div>
            <div className="form-group"><label>Life Skills & Independence</label><textarea className="input" rows={2} value={form.life_skills} onChange={e => F('life_skills', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Review Outcome</label><textarea className="input" rows={2} value={form.review_outcome} onChange={e => F('review_outcome', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Child</th><th>Keyworker</th><th>Date</th><th>Legal Status</th><th>Objectives</th><th>Review</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td><strong>{childName(r.child_id)}</strong></td><td>{userName(r.keyworker_id)}</td><td>{r.date}</td><td style={{ fontSize: 11 }}>{r.legal_status}</td><td style={{ fontSize: 11, maxWidth: 200 }}>{(r.objectives || '').slice(0, 80)}</td><td>{r.review_date || '—'}</td><td><span className={`badge badge-${r.status === 'Active' ? 'active' : 'archived'}`}>{r.status}</span></td></tr>))}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">📋</div><p>No care plans recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
