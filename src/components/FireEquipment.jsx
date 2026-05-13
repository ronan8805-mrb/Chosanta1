import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function FireEquipment() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ equipment_type: 'Fire Extinguisher', location: '', serial_number: '', install_date: '', last_service: '', next_service: '', contractor: '', status: 'In Service', notes: '' });

  const load = () => { api('/api/logs/fireequipment').then(setRecords).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/fireequipment', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); setForm({ ...form, location: '', serial_number: '', notes: '' }); load(); };

  const overdue = records.filter(r => r.next_service && new Date(r.next_service) < new Date()).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Fire Safety Equipment Service Log</h1><p style={{ color: '#9a9484', fontSize: 12 }}>Fire Services Acts 1981–2003 · S.I. 360/2006 · HIQA Standard 7</p></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {overdue > 0 && <div style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.4)', padding: '8px 16px', borderRadius: 8 }}><span style={{ color: '#e74c3c', fontWeight: 700 }}>⚠️ {overdue} overdue</span></div>}
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Equipment</button>
        </div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Equipment Type</label><select className="input" value={form.equipment_type} onChange={e => F('equipment_type', e.target.value)}>{['Fire Extinguisher','Fire Blanket','Smoke Detector','Heat Detector','Fire Alarm Panel','Emergency Lighting','Fire Door','Sprinkler System','Fire Hose Reel','CO Detector'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Location</label><input className="input" value={form.location} onChange={e => F('location', e.target.value)} placeholder="e.g. Kitchen, Ground Floor Hallway" /></div>
            <div className="form-group"><label>Serial Number</label><input className="input" value={form.serial_number} onChange={e => F('serial_number', e.target.value)} /></div>
            <div className="form-group"><label>Install Date</label><input className="input" type="date" value={form.install_date} onChange={e => F('install_date', e.target.value)} /></div>
            <div className="form-group"><label>Last Service</label><input className="input" type="date" value={form.last_service} onChange={e => F('last_service', e.target.value)} /></div>
            <div className="form-group"><label>Next Service Due</label><input className="input" type="date" value={form.next_service} onChange={e => F('next_service', e.target.value)} /></div>
            <div className="form-group"><label>Contractor</label><input className="input" value={form.contractor} onChange={e => F('contractor', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['In Service','Needs Service','Out of Service','Replaced','Condemned'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => F('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Type</th><th>Location</th><th>Serial</th><th>Last Service</th><th>Next Due</th><th>Contractor</th><th>Status</th></tr></thead>
          <tbody>{records.map(r => { const isOverdue = r.next_service && new Date(r.next_service) < new Date(); return (<tr key={r.id} style={isOverdue ? { background: 'rgba(231,76,60,0.08)' } : {}}><td><strong>{r.equipment_type}</strong></td><td>{r.location}</td><td style={{ fontSize: 11 }}>{r.serial_number || '—'}</td><td>{r.last_service || '—'}</td><td style={{ color: isOverdue ? '#e74c3c' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>{r.next_service || '—'} {isOverdue ? '⚠️' : ''}</td><td>{r.contractor || '—'}</td><td><span className={`badge badge-${r.status === 'In Service' ? 'active' : r.status === 'Condemned' ? 'archived' : 'draft'}`}>{r.status}</span></td></tr>)})}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">🧯</div><p>No fire equipment registered</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
