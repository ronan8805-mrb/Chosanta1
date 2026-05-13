import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function MedicationAudit() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), auditor_id: '', period_covered: '', mar_accurate: 1, storage_correct: 1, controlled_drugs_ok: 1, expiry_check: 1, findings: '', actions: '', fire_drill_date: '', fire_drill_time: '', evacuation_time: '', all_evacuated: 1, fire_issues: '' });

  const load = () => { api('/api/logs/medaudits').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/medaudits', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const yn = v => v ? '✅' : '❌';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Medication Audit & Fire Drill Log</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-MAD-001 · HIQA Standard 1 · Fire Services Acts</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Audit</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h4 style={{ marginBottom: 12, color: '#c9a84c' }}>💊 Medication Audit</h4>
          <div className="form-grid">
            <div className="form-group"><label>Audit Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Auditor</label><select className="input" value={form.auditor_id} onChange={e => F('auditor_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Period Covered</label><input className="input" value={form.period_covered} onChange={e => F('period_covered', e.target.value)} placeholder="e.g. April 2026" /></div>
            <div className="form-group"><label>MAR Charts Accurate?</label><select className="input" value={form.mar_accurate} onChange={e => F('mar_accurate', parseInt(e.target.value))}><option value={1}>Compliant</option><option value={0}>Non-Compliant</option></select></div>
            <div className="form-group"><label>Storage Correct?</label><select className="input" value={form.storage_correct} onChange={e => F('storage_correct', parseInt(e.target.value))}><option value={1}>Compliant</option><option value={0}>Non-Compliant</option></select></div>
            <div className="form-group"><label>Controlled Drugs?</label><select className="input" value={form.controlled_drugs_ok} onChange={e => F('controlled_drugs_ok', parseInt(e.target.value))}><option value={1}>Compliant</option><option value={0}>Non-Compliant</option></select></div>
            <div className="form-group"><label>Expiry Check?</label><select className="input" value={form.expiry_check} onChange={e => F('expiry_check', parseInt(e.target.value))}><option value={1}>Compliant</option><option value={0}>Non-Compliant</option></select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Findings & Observations</label><textarea className="input" rows={2} value={form.findings} onChange={e => F('findings', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Priority Actions</label><textarea className="input" rows={2} value={form.actions} onChange={e => F('actions', e.target.value)} /></div>
          </div>
          <h4 style={{ marginTop: 20, marginBottom: 12, color: '#c9a84c' }}>🔥 Fire Drill</h4>
          <div className="form-grid">
            <div className="form-group"><label>Fire Drill Date</label><input className="input" type="date" value={form.fire_drill_date} onChange={e => F('fire_drill_date', e.target.value)} /></div>
            <div className="form-group"><label>Time</label><input className="input" type="time" value={form.fire_drill_time} onChange={e => F('fire_drill_time', e.target.value)} /></div>
            <div className="form-group"><label>Evacuation Time</label><input className="input" value={form.evacuation_time} onChange={e => F('evacuation_time', e.target.value)} placeholder="e.g. 2 min 30 sec" /></div>
            <div className="form-group"><label>All Evacuated?</label><select className="input" value={form.all_evacuated} onChange={e => F('all_evacuated', parseInt(e.target.value))}><option value={1}>Yes</option><option value={0}>No</option></select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Issues / Learning</label><textarea className="input" rows={2} value={form.fire_issues} onChange={e => F('fire_issues', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Auditor</th><th>MAR</th><th>Storage</th><th>CD</th><th>Expiry</th><th>Fire Drill</th><th>Evac Time</th><th>All Out</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{userName(r.auditor_id)}</td><td>{yn(r.mar_accurate)}</td><td>{yn(r.storage_correct)}</td><td>{yn(r.controlled_drugs_ok)}</td><td>{yn(r.expiry_check)}</td><td>{r.fire_drill_date || '—'}</td><td>{r.evacuation_time || '—'}</td><td>{r.fire_drill_date ? yn(r.all_evacuated) : '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={9}><div className="empty-state"><div className="icon">💊</div><p>No medication audits yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
