import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../App';
import { PrintHeader, PrintToolbar } from './Layout';

export default function AbsencePlans() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const blank = () => ({ child_id: '', date: new Date().toISOString().slice(0,10), triggers: '', early_warning_signs: '', deescalation_strategies: '', search_protocol: '', high_risk_locations: '', notification_order: '', return_interview_protocol: '', safety_plan: '', review_date: '', status: 'Active' });

  const load = () => { api('/api/logs/absenceplans').then(setRows).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const openNew = () => { setEditing(null); setForm(blank()); setShowForm(true); };
  const openEdit = (r) => { setEditing(r); setForm({ ...blank(), ...r }); setShowForm(true); };
  const submit = async () => {
    if (editing) await api(`/api/logs/absenceplans/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
    else await api('/api/logs/absenceplans', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false); load();
  };
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  return (
    <div>
      <PrintHeader title="Absence Management Plans" user={user} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><h1 className="page-title">Absence Management Plans</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 3 · Missing Child Protocol · Per-Child Standing Plan</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PrintToolbar title="Absence Plans" data={rows} filename="absence_plans" />
          <button className="btn btn-primary" onClick={openNew}>+ New Plan</button>
        </div>
      </div>
      <div style={{ background: '#fff8e7', borderLeft: '4px solid #c9a84c', borderRadius: '0 6px 6px 0', padding: '10px 16px', marginBottom: 16, fontSize: 12 }}>
        <strong>Required:</strong> Every child with 1+ absconding episode must have an individual Absence Management Plan. Plan must be reviewed after every episode and at minimum 3-monthly.
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderLeft: `4px solid ${editing ? '#c9a84c' : '#3498db'}` }}>
          <h3 style={{ marginBottom: 12, color: editing ? '#c9a84c' : '#0d1b2a' }}>{editing ? '✏️ Update Plan' : '🗺️ New Absence Plan'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Review Date</label><input className="input" type="date" value={form.review_date} onChange={e => F('review_date', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Active','Under Review','Archived'].map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="form-group"><label>Known Triggers for Absconding</label><textarea className="input" rows={2} value={form.triggers} onChange={e => F('triggers', e.target.value)} placeholder="e.g. Contact with family, peer conflict, anxiety before school" /></div>
          <div className="form-group"><label>Early Warning Signs</label><textarea className="input" rows={2} value={form.early_warning_signs} onChange={e => F('early_warning_signs', e.target.value)} placeholder="Behavioural indicators that absconding may be imminent" /></div>
          <div className="form-group"><label>De-escalation Strategies</label><textarea className="input" rows={2} value={form.deescalation_strategies} onChange={e => F('deescalation_strategies', e.target.value)} /></div>
          <div className="form-group"><label>Search Protocol (specific to this child)</label><textarea className="input" rows={2} value={form.search_protocol} onChange={e => F('search_protocol', e.target.value)} placeholder="e.g. Check skatepark first, then Main Street, then river walk" /></div>
          <div className="form-group"><label>High-Risk Locations</label><textarea className="input" rows={2} value={form.high_risk_locations} onChange={e => F('high_risk_locations', e.target.value)} /></div>
          <div className="form-group"><label>Notification Order</label><textarea className="input" rows={2} value={form.notification_order} onChange={e => F('notification_order', e.target.value)} placeholder="1. PIC → 2. On-Call → 3. Social Worker → 4. An Garda Síochána → 5. Parent" /></div>
          <div className="form-group"><label>Return Interview Protocol</label><textarea className="input" rows={2} value={form.return_interview_protocol} onChange={e => F('return_interview_protocol', e.target.value)} /></div>
          <div className="form-group"><label>Safety Plan</label><textarea className="input" rows={2} value={form.safety_plan} onChange={e => F('safety_plan', e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>💾 {editing ? 'Update Plan' : 'Save Plan'}</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Child</th><th>Date</th><th>Triggers</th><th>Search Protocol</th><th>Review</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map(r => (<tr key={r.id}><td><strong>{childName(r.child_id)}</strong></td><td>{r.date}</td><td style={{ fontSize: 11, maxWidth: 200 }}>{r.triggers || '—'}</td><td style={{ fontSize: 11, maxWidth: 200 }}>{r.search_protocol || '—'}</td><td>{r.review_date || '—'}</td><td><span className={`badge badge-${r.status === 'Active' ? 'active' : 'archived'}`}>{r.status}</span></td>
            <td><button className="btn btn-sm btn-ghost" onClick={() => openEdit(r)}>✏️</button></td></tr>))}
          {rows.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">🗺️</div><p>No absence management plans</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
