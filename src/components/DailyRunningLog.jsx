import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function DailyRunningLog() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), shift: 'Day', author_id: '', children_present: '', staff_on_duty: '', narrative: '', safeguarding_notes: '', medication_notes: '', education_notes: '', activities: '', mood_behaviour: '', visitors_contacts: '', significant_events: '', pic_reviewed: 0 });

  const load = () => { api('/api/logs/dailylog').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/dailylog', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Daily Running Log</h1><p style={{ color: '#9a9484', fontSize: 12 }}>Statutory Record · HIQA Standards 3 & 5 · S.I. 674/2017</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print</button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Entry</button>
        </div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Shift</label><select className="input" value={form.shift} onChange={e => F('shift', e.target.value)}>{['Day','Night','Long Day','Sleepover'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Author</label><select className="input" value={form.author_id} onChange={e => F('author_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Children Present</label><input className="input" value={form.children_present} onChange={e => F('children_present', e.target.value)} placeholder="Names/initials" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Staff on Duty</label><input className="input" value={form.staff_on_duty} onChange={e => F('staff_on_duty', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Daily Narrative</label><textarea className="input" rows={4} value={form.narrative} onChange={e => F('narrative', e.target.value)} placeholder="Full narrative account of the day/shift..." /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Mood & Behaviour</label><textarea className="input" rows={2} value={form.mood_behaviour} onChange={e => F('mood_behaviour', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Activities & Recreation</label><textarea className="input" rows={2} value={form.activities} onChange={e => F('activities', e.target.value)} /></div>
            <div className="form-group"><label>Safeguarding Notes</label><textarea className="input" rows={2} value={form.safeguarding_notes} onChange={e => F('safeguarding_notes', e.target.value)} /></div>
            <div className="form-group"><label>Medication Notes</label><textarea className="input" rows={2} value={form.medication_notes} onChange={e => F('medication_notes', e.target.value)} /></div>
            <div className="form-group"><label>Education Notes</label><textarea className="input" rows={2} value={form.education_notes} onChange={e => F('education_notes', e.target.value)} /></div>
            <div className="form-group"><label>Visitors / Contacts</label><textarea className="input" rows={2} value={form.visitors_contacts} onChange={e => F('visitors_contacts', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Significant Events</label><textarea className="input" rows={2} value={form.significant_events} onChange={e => F('significant_events', e.target.value)} /></div>
            <div className="form-group"><label>PIC Reviewed?</label><select className="input" value={form.pic_reviewed} onChange={e => F('pic_reviewed', parseInt(e.target.value))}><option value={0}>No</option><option value={1}>Yes</option></select></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save Entry</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Shift</th><th>Author</th><th>Narrative</th><th>Significant Events</th><th>PIC</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td>{r.shift}</td><td>{userName(r.author_id)}</td><td style={{ fontSize: 11, maxWidth: 300 }}>{(r.narrative || '').slice(0, 120)}...</td><td style={{ fontSize: 11, maxWidth: 200 }}>{r.significant_events || 'None'}</td><td>{r.pic_reviewed ? '✅' : '⏳'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="icon">📖</div><p>No daily log entries yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
