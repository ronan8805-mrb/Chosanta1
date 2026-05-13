import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function MissingChronology() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ child_id: '', date: new Date().toISOString().slice(0,10), time_out: '', time_back: '', duration: '', where_found: '', condition_on_return: '', medical_attention: 0, return_interview: 0, interview_date: '', interview_notes: '', ags_notified: 0, sen_submitted: 0, trigger_pattern: '' });

  const load = () => { api('/api/logs/missingchronology').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/missingchronology', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };
  const yn = v => v ? '✅' : '❌';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Missing Child Chronology & Return Interview</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-MCC-001 · HIQA Standard 3 · Children First Act 2015</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Entry</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h4 style={{ marginBottom: 12, color: '#c9a84c' }}>📍 Absence Details</h4>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Time Out</label><input className="input" type="time" value={form.time_out} onChange={e => F('time_out', e.target.value)} /></div>
            <div className="form-group"><label>Time Back</label><input className="input" type="time" value={form.time_back} onChange={e => F('time_back', e.target.value)} /></div>
            <div className="form-group"><label>Duration</label><input className="input" value={form.duration} onChange={e => F('duration', e.target.value)} placeholder="e.g. 3 hours" /></div>
            <div className="form-group"><label>Where Found</label><input className="input" value={form.where_found} onChange={e => F('where_found', e.target.value)} /></div>
            <div className="form-group"><label>Condition on Return</label><input className="input" value={form.condition_on_return} onChange={e => F('condition_on_return', e.target.value)} placeholder="e.g. Calm, Distressed, Intoxicated" /></div>
            <div className="form-group"><label>Medical Attention?</label><select className="input" value={form.medical_attention} onChange={e => F('medical_attention', parseInt(e.target.value))}><option value={0}>No</option><option value={1}>Yes</option></select></div>
            <div className="form-group"><label>AGS Notified?</label><select className="input" value={form.ags_notified} onChange={e => F('ags_notified', parseInt(e.target.value))}><option value={0}>No</option><option value={1}>Yes</option></select></div>
            <div className="form-group"><label>SEN Submitted?</label><select className="input" value={form.sen_submitted} onChange={e => F('sen_submitted', parseInt(e.target.value))}><option value={0}>No</option><option value={1}>Yes</option></select></div>
          </div>
          <h4 style={{ marginTop: 20, marginBottom: 12, color: '#c9a84c' }}>🗣 Return Interview</h4>
          <div className="form-grid">
            <div className="form-group"><label>Interview Conducted?</label><select className="input" value={form.return_interview} onChange={e => F('return_interview', parseInt(e.target.value))}><option value={0}>No</option><option value={1}>Yes</option></select></div>
            <div className="form-group"><label>Interview Date/Time</label><input className="input" value={form.interview_date} onChange={e => F('interview_date', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Child's Response (in their own words)</label><textarea className="input" rows={3} value={form.interview_notes} onChange={e => F('interview_notes', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Pattern / Trigger Analysis</label><textarea className="input" rows={2} value={form.trigger_pattern} onChange={e => F('trigger_pattern', e.target.value)} placeholder="Identified triggers, time patterns, etc." /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Child</th><th>Out</th><th>Back</th><th>Duration</th><th>Where Found</th><th>AGS</th><th>SEN</th><th>Interview</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td><strong>{childName(r.child_id)}</strong></td><td>{r.time_out}</td><td>{r.time_back}</td><td>{r.duration}</td><td>{r.where_found || '—'}</td><td>{yn(r.ags_notified)}</td><td>{yn(r.sen_submitted)}</td><td>{yn(r.return_interview)}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={9}><div className="empty-state"><div className="icon">📍</div><p>No chronology entries</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
