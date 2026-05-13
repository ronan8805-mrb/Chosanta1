import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function ChildrenRegister() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ child_id: '', ref_code: '', admission_date: '', legal_status: 'Voluntary Care (s.4)', placement_type: 'Emergency', social_worker: '', sw_phone: '', tusla_area: '', guardian: '', guardian_phone: '', gp_name: '', gp_phone: '', school: '', allergies: '', dietary_needs: '', religion: '', status: 'Active' });

  const load = () => { api('/api/logs/childregister').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/childregister', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Children's Register</h1><p style={{ color: '#9a9484', fontSize: 12 }}>S.I. 259/1995 · Statutory Requirement · HIQA Standard 2</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print</button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Child</button>
        </div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Ref Code</label><input className="input" value={form.ref_code} onChange={e => F('ref_code', e.target.value)} placeholder="e.g. CYP-001" /></div>
            <div className="form-group"><label>Admission Date</label><input className="input" type="date" value={form.admission_date} onChange={e => F('admission_date', e.target.value)} /></div>
            <div className="form-group"><label>Legal Status</label><select className="input" value={form.legal_status} onChange={e => F('legal_status', e.target.value)}>{['Voluntary Care (s.4)','Care Order (s.18)','Interim Care (s.17)','Emergency Care (s.13)','Special Care','Supervision Order'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Placement Type</label><select className="input" value={form.placement_type} onChange={e => F('placement_type', e.target.value)}>{['Emergency','Short-Term','Medium-Term','Long-Term','Respite','Step-Down'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Social Worker</label><input className="input" value={form.social_worker} onChange={e => F('social_worker', e.target.value)} /></div>
            <div className="form-group"><label>SW Phone</label><input className="input" value={form.sw_phone} onChange={e => F('sw_phone', e.target.value)} /></div>
            <div className="form-group"><label>Tusla Area</label><input className="input" value={form.tusla_area} onChange={e => F('tusla_area', e.target.value)} /></div>
            <div className="form-group"><label>Guardian</label><input className="input" value={form.guardian} onChange={e => F('guardian', e.target.value)} /></div>
            <div className="form-group"><label>Guardian Phone</label><input className="input" value={form.guardian_phone} onChange={e => F('guardian_phone', e.target.value)} /></div>
            <div className="form-group"><label>GP Name</label><input className="input" value={form.gp_name} onChange={e => F('gp_name', e.target.value)} /></div>
            <div className="form-group"><label>GP Phone</label><input className="input" value={form.gp_phone} onChange={e => F('gp_phone', e.target.value)} /></div>
            <div className="form-group"><label>School</label><input className="input" value={form.school} onChange={e => F('school', e.target.value)} /></div>
            <div className="form-group"><label>Allergies</label><input className="input" value={form.allergies} onChange={e => F('allergies', e.target.value)} /></div>
            <div className="form-group"><label>Dietary Needs</label><input className="input" value={form.dietary_needs} onChange={e => F('dietary_needs', e.target.value)} /></div>
            <div className="form-group"><label>Religion</label><input className="input" value={form.religion} onChange={e => F('religion', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Ref</th><th>Child</th><th>Admission</th><th>Legal Status</th><th>Type</th><th>Social Worker</th><th>GP</th><th>School</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td><code style={{ fontSize: 10, background: 'rgba(201,168,76,0.15)', color: '#c9a84c', padding: '2px 6px', borderRadius: 3 }}>{r.ref_code}</code></td><td><strong>{childName(r.child_id)}</strong></td><td>{r.admission_date}</td><td style={{ fontSize: 11 }}>{r.legal_status}</td><td>{r.placement_type}</td><td>{r.social_worker || '—'}</td><td>{r.gp_name || '—'}</td><td>{r.school || '—'}</td><td><span className={`badge badge-${r.status === 'Active' ? 'active' : 'archived'}`}>{r.status}</span></td></tr>))}
          {records.length === 0 && <tr><td colSpan={9}><div className="empty-state"><div className="icon">👧</div><p>No children registered</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
