import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function HSInspection() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), inspected_by: '', area: 'Whole Building', fire_exits_ok: 1, fire_equip_ok: 1, lighting_ok: 1, floors_ok: 1, kitchen_ok: 1, bathrooms_ok: 1, hazards: '', actions_required: '', status: 'Complete' });

  const load = () => { api('/api/logs/hsinspections').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/hsinspections', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const check = v => v ? '✅' : '❌';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Weekly Health & Safety Inspection</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-WHI-001 · Safety, Health & Welfare at Work Act 2005</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Inspection</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Inspected By</label><select className="input" value={form.inspected_by} onChange={e => F('inspected_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Area</label><select className="input" value={form.area} onChange={e => F('area', e.target.value)}>{['Whole Building','Ground Floor','First Floor','Kitchen','Garden/External','Fire Exits'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Fire Exits Clear?</label><select className="input" value={form.fire_exits_ok} onChange={e => F('fire_exits_ok', parseInt(e.target.value))}><option value={1}>OK</option><option value={0}>Issue Found</option></select></div>
            <div className="form-group"><label>Fire Equipment?</label><select className="input" value={form.fire_equip_ok} onChange={e => F('fire_equip_ok', parseInt(e.target.value))}><option value={1}>OK</option><option value={0}>Issue Found</option></select></div>
            <div className="form-group"><label>Lighting?</label><select className="input" value={form.lighting_ok} onChange={e => F('lighting_ok', parseInt(e.target.value))}><option value={1}>OK</option><option value={0}>Issue Found</option></select></div>
            <div className="form-group"><label>Floors/Stairs?</label><select className="input" value={form.floors_ok} onChange={e => F('floors_ok', parseInt(e.target.value))}><option value={1}>OK</option><option value={0}>Issue Found</option></select></div>
            <div className="form-group"><label>Kitchen?</label><select className="input" value={form.kitchen_ok} onChange={e => F('kitchen_ok', parseInt(e.target.value))}><option value={1}>OK</option><option value={0}>Issue Found</option></select></div>
            <div className="form-group"><label>Bathrooms?</label><select className="input" value={form.bathrooms_ok} onChange={e => F('bathrooms_ok', parseInt(e.target.value))}><option value={1}>OK</option><option value={0}>Issue Found</option></select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Hazards Identified</label><textarea className="input" rows={2} value={form.hazards} onChange={e => F('hazards', e.target.value)} placeholder="Describe any hazards found..." /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Actions Required</label><textarea className="input" rows={2} value={form.actions_required} onChange={e => F('actions_required', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Inspector</th><th>Area</th><th>Exits</th><th>Equip</th><th>Light</th><th>Floor</th><th>Kitchen</th><th>Bath</th><th>Hazards</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{userName(r.inspected_by)}</td><td>{r.area}</td><td>{check(r.fire_exits_ok)}</td><td>{check(r.fire_equip_ok)}</td><td>{check(r.lighting_ok)}</td><td>{check(r.floors_ok)}</td><td>{check(r.kitchen_ok)}</td><td>{check(r.bathrooms_ok)}</td><td style={{ fontSize: 11 }}>{r.hazards || 'None'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={10}><div className="empty-state"><div className="icon">🏥</div><p>No inspections yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
