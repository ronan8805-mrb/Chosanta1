import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function NightChecks() {
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), time: '', staff_id: '', child_id: '', status: 'Asleep', presentation: '', concerns: '', action_taken: '' });

  const load = () => { api('/api/logs/nightchecks').then(setRows).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/nightchecks', { method: 'POST', body: JSON.stringify(form) }); setForm({ ...form, time: new Date().toTimeString().slice(0,5), child_id: '', status: 'Asleep', presentation: '', concerns: '', action_taken: '' }); load(); };
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  // Quick-add for all children at once
  const quickAdd = async () => {
    const time = new Date().toTimeString().slice(0,5);
    for (const child of children.filter(c => c.status === 'Active')) {
      await api('/api/logs/nightchecks', { method: 'POST', body: JSON.stringify({ date: form.date, time, staff_id: form.staff_id, child_id: child.id, status: 'Asleep' }) });
    }
    load();
  };

  const todayChecks = rows.filter(r => r.date === new Date().toISOString().slice(0,10));
  const statuses = ['Asleep','Awake — settled','Awake — unsettled','Awake — distressed','Not in bed','Absent from room','Checked — door closed'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><h1 className="page-title">Night Welfare Checks</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 7 · Waking Night Staff · Minimum 30-minute intervals</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print</button>
          <button className="btn btn-ghost" onClick={quickAdd} title="Log all children as Asleep at current time">⚡ Quick Check All</button>
          <button className="btn btn-primary" onClick={() => { setForm({ ...form, time: new Date().toTimeString().slice(0,5) }); setShowForm(!showForm); }}>+ Record Check</button>
        </div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Time</label><input className="input" type="time" value={form.time} onChange={e => F('time', e.target.value)} /></div>
            <div className="form-group"><label>Staff</label><select className="input" value={form.staff_id} onChange={e => F('staff_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Presentation</label><input className="input" value={form.presentation} onChange={e => F('presentation', e.target.value)} placeholder="e.g. Calm, restless, crying" /></div>
            {form.status !== 'Asleep' && <>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Concerns</label><textarea className="input" rows={2} value={form.concerns} onChange={e => F('concerns', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Action Taken</label><textarea className="input" rows={2} value={form.action_taken} onChange={e => F('action_taken', e.target.value)} /></div>
            </>}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save Check</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card" style={{ marginBottom: 12, padding: 12, fontSize: 12 }}>Tonight's checks: <strong>{todayChecks.length}</strong> recorded</div>
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Time</th><th>Staff</th><th>Child</th><th>Status</th><th>Presentation</th><th>Concerns</th></tr></thead>
          <tbody>{rows.map(r => (<tr key={r.id} style={r.status !== 'Asleep' ? { background: 'rgba(243,156,18,0.06)' } : {}}><td>{r.date}</td><td><strong>{r.time}</strong></td><td>{userName(r.staff_id)}</td><td>{childName(r.child_id)}</td><td><span style={{ color: r.status === 'Asleep' ? '#27ae60' : '#e65100', fontSize: 12 }}>{r.status}</span></td><td style={{ fontSize: 11 }}>{r.presentation || '—'}</td><td style={{ fontSize: 11 }}>{r.concerns || '—'}</td></tr>))}
          {rows.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">🌙</div><p>No night checks recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
