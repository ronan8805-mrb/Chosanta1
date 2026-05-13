import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function PEEPLog() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ child_id: '', date: new Date().toISOString().slice(0,10), mobility: 'Full', communication: 'Verbal', cognitive: 'No concerns', medical_needs: '', evacuation_method: 'Independent', assembly_point: 'Front Garden', assigned_staff: '', night_plan: '', equipment_needed: '', review_date: '', status: 'Active' });

  const load = () => { api('/api/logs/peeps').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/peeps', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Personal Emergency Evacuation Plans (PEEPs)</h1><p style={{ color: '#9a9484', fontSize: 12 }}>Fire Services Acts · HIQA Standard 7 · Per-Child Statutory Requirement</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print</button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New PEEP</button>
        </div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Mobility</label><select className="input" value={form.mobility} onChange={e => F('mobility', e.target.value)}>{['Full','Reduced - walks with aid','Wheelchair','Requires physical assistance','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Communication</label><select className="input" value={form.communication} onChange={e => F('communication', e.target.value)}>{['Verbal','Limited verbal','Non-verbal','Sign language','Requires interpreter','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Cognitive</label><select className="input" value={form.cognitive} onChange={e => F('cognitive', e.target.value)}>{['No concerns','May not respond to alarm','Requires direct instruction','Requires 1:1 support','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Evacuation Method</label><select className="input" value={form.evacuation_method} onChange={e => F('evacuation_method', e.target.value)}>{['Independent','Verbal prompting','Physical guidance','Carry/lift','Evacuation chair','Other'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Assembly Point</label><input className="input" value={form.assembly_point} onChange={e => F('assembly_point', e.target.value)} /></div>
            <div className="form-group"><label>Assigned Staff</label><select className="input" value={form.assigned_staff} onChange={e => F('assigned_staff', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Medical Needs (relevant to evacuation)</label><textarea className="input" rows={2} value={form.medical_needs} onChange={e => F('medical_needs', e.target.value)} placeholder="e.g. Asthma - inhaler must travel with child" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Night-Time Plan</label><textarea className="input" rows={2} value={form.night_plan} onChange={e => F('night_plan', e.target.value)} placeholder="How will this child be evacuated at night?" /></div>
            <div className="form-group"><label>Equipment Needed</label><input className="input" value={form.equipment_needed} onChange={e => F('equipment_needed', e.target.value)} placeholder="e.g. Torch, wheelchair" /></div>
            <div className="form-group"><label>Review Date</label><input className="input" type="date" value={form.review_date} onChange={e => F('review_date', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save PEEP</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Child</th><th>Mobility</th><th>Communication</th><th>Evacuation</th><th>Assembly</th><th>Assigned</th><th>Night Plan</th><th>Review</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td><strong>{childName(r.child_id)}</strong></td><td style={{ fontSize: 11 }}>{r.mobility}</td><td style={{ fontSize: 11 }}>{r.communication}</td><td style={{ fontSize: 11 }}>{r.evacuation_method}</td><td>{r.assembly_point}</td><td>{userName(r.assigned_staff)}</td><td style={{ fontSize: 11, maxWidth: 160 }}>{r.night_plan || '—'}</td><td>{r.review_date || '—'}</td><td><span className={`badge badge-${r.status === 'Active' ? 'active' : 'archived'}`}>{r.status}</span></td></tr>))}
          {records.length === 0 && <tr><td colSpan={9}><div className="empty-state"><div className="icon">🔥</div><p>No PEEPs recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
