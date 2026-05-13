import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function RoomSearchLog() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), time: '', child_id: '', area_searched: '', reason: '', authorised_by: '', staff_1: '', staff_2: '', items_found: '', actions_taken: '', child_informed: 1, child_response: '' });

  const load = () => { api('/api/logs/roomsearch').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/roomsearch', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Room Search & Contraband Log</h1><p style={{ color: '#9a9484', fontSize: 12 }}>CM-RSC-001 · HIQA Standard 3</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Search</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Time</label><input className="input" type="time" value={form.time} onChange={e => F('time', e.target.value)} /></div>
            <div className="form-group"><label>Child / Young Person</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Room / Area</label><input className="input" value={form.area_searched} onChange={e => F('area_searched', e.target.value)} placeholder="e.g. Bedroom 3" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Reason for Search</label><textarea className="input" rows={2} value={form.reason} onChange={e => F('reason', e.target.value)} /></div>
            <div className="form-group"><label>Authorised By</label><select className="input" value={form.authorised_by} onChange={e => F('authorised_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Staff Conducting</label><select className="input" value={form.staff_1} onChange={e => F('staff_1', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Staff Witness</label><select className="input" value={form.staff_2} onChange={e => F('staff_2', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Items Found</label><textarea className="input" rows={2} value={form.items_found} onChange={e => F('items_found', e.target.value)} placeholder="Description, quantity, location found" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Actions Taken</label><textarea className="input" rows={2} value={form.actions_taken} onChange={e => F('actions_taken', e.target.value)} /></div>
            <div className="form-group"><label>Child Informed?</label><select className="input" value={form.child_informed} onChange={e => F('child_informed', parseInt(e.target.value))}><option value={1}>Yes</option><option value={0}>No</option></select></div>
            <div className="form-group"><label>Child Response</label><input className="input" value={form.child_response} onChange={e => F('child_response', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Time</th><th>Child</th><th>Area</th><th>Reason</th><th>Items Found</th><th>Actions</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{r.time}</td><td>{childName(r.child_id)}</td><td>{r.area_searched}</td><td style={{ fontSize: 11, maxWidth: 160 }}>{r.reason}</td><td style={{ fontSize: 11 }}>{r.items_found || 'None'}</td><td style={{ fontSize: 11 }}>{r.actions_taken || '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">🚪</div><p>No room searches recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
