import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function ComplimentsLog() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), from_whom: '', source: 'Family', feedback: '', relates_to: '', shared_with_staff: 0, child_voice: '' });

  const load = () => { api('/api/logs/compliments').then(setRecords).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/compliments', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Compliments & Positive Feedback Log</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-CPF-001 · HIQA Standard 4</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Feedback</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>From Whom</label><input className="input" value={form.from_whom} onChange={e => F('from_whom', e.target.value)} placeholder="e.g. Parent, Social Worker" /></div>
            <div className="form-group"><label>Source</label><select className="input" value={form.source} onChange={e => F('source', e.target.value)}>{['Family','Child/Young Person','Social Worker','Guardian Ad Litem','External Professional','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Relates To</label><input className="input" value={form.relates_to} onChange={e => F('relates_to', e.target.value)} placeholder="Staff member or service area" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Feedback / Compliment (direct words where possible)</label><textarea className="input" rows={3} value={form.feedback} onChange={e => F('feedback', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Child Voice (direct quote if from child)</label><textarea className="input" rows={2} value={form.child_voice} onChange={e => F('child_voice', e.target.value)} /></div>
            <div className="form-group"><label>Shared with Staff?</label><select className="input" value={form.shared_with_staff} onChange={e => F('shared_with_staff', parseInt(e.target.value))}><option value={0}>Not Yet</option><option value={1}>Yes — Shared at Team Meeting</option></select></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>From</th><th>Source</th><th>Feedback</th><th>Relates To</th><th>Shared</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{r.from_whom}</td><td>{r.source}</td><td style={{ fontSize: 11, maxWidth: 280 }}>{r.feedback}</td><td>{r.relates_to || '—'}</td><td>{r.shared_with_staff ? '✅' : '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="icon">⭐</div><p>No compliments recorded yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
