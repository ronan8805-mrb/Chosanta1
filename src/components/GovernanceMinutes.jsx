import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function GovernanceMinutes() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), time: '10:00', venue: 'Silverwings Centre', chaired_by: '', minutes_by: '', attendees: '', apologies: '', actions_from_last: '', agenda_items: '', incident_summary: '', compliance_update: '', safeguarding_update: '', training_update: '', risk_register_update: '', qip_update: '', next_meeting: '' });

  const load = () => { api('/api/logs/governance').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/governance', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Governance & Compliance Meeting Minutes</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-GMM-001 · HIQA Standard 5</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Minutes</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h4 style={{ marginBottom: 12, color: '#c9a84c' }}>📋 Meeting Details</h4>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Time</label><input className="input" type="time" value={form.time} onChange={e => F('time', e.target.value)} /></div>
            <div className="form-group"><label>Venue</label><input className="input" value={form.venue} onChange={e => F('venue', e.target.value)} /></div>
            <div className="form-group"><label>Chaired By</label><select className="input" value={form.chaired_by} onChange={e => F('chaired_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Minutes By</label><select className="input" value={form.minutes_by} onChange={e => F('minutes_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Next Meeting</label><input className="input" type="date" value={form.next_meeting} onChange={e => F('next_meeting', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Attendees</label><input className="input" value={form.attendees} onChange={e => F('attendees', e.target.value)} placeholder="Names, separated by commas" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Apologies</label><input className="input" value={form.apologies} onChange={e => F('apologies', e.target.value)} /></div>
          </div>
          <h4 style={{ marginTop: 20, marginBottom: 12, color: '#c9a84c' }}>📝 Agenda & Updates</h4>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Actions from Last Meeting</label><textarea className="input" rows={2} value={form.actions_from_last} onChange={e => F('actions_from_last', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Agenda Items & Discussion</label><textarea className="input" rows={3} value={form.agenda_items} onChange={e => F('agenda_items', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Incident Summary (this period)</label><textarea className="input" rows={2} value={form.incident_summary} onChange={e => F('incident_summary', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Compliance & Regulatory Update</label><textarea className="input" rows={2} value={form.compliance_update} onChange={e => F('compliance_update', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Safeguarding Update</label><textarea className="input" rows={2} value={form.safeguarding_update} onChange={e => F('safeguarding_update', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Training & HR Update</label><textarea className="input" rows={2} value={form.training_update} onChange={e => F('training_update', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Risk Register Update</label><textarea className="input" rows={2} value={form.risk_register_update} onChange={e => F('risk_register_update', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Quality Improvement Plan (QIP)</label><textarea className="input" rows={2} value={form.qip_update} onChange={e => F('qip_update', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save Minutes</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Chair</th><th>Venue</th><th>Attendees</th><th>Incidents</th><th>Next</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{userName(r.chaired_by)}</td><td>{r.venue}</td><td style={{ fontSize: 11 }}>{r.attendees || '—'}</td><td style={{ fontSize: 11, maxWidth: 200 }}>{r.incident_summary || '—'}</td><td>{r.next_meeting || '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="icon">🏛</div><p>No governance minutes recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
