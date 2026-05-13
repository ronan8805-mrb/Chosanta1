import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function StaffAppraisals() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ staff_id: '', date: new Date().toISOString().slice(0,10), appraiser_id: '', period_covered: '', achievements: '', areas_for_development: '', goals_set: '', training_needs: '', wellbeing_check: '', overall_rating: 'Meets Expectations', staff_comments: '', next_review: '' });

  const load = () => { api('/api/logs/appraisals').then(setRecords).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { await api('/api/logs/appraisals', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Annual Performance Appraisals</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 6 · Staff Development & Performance</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Appraisal</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Staff Member</label><select className="input" value={form.staff_id} onChange={e => F('staff_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Appraiser</label><select className="input" value={form.appraiser_id} onChange={e => F('appraiser_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>Period Covered</label><input className="input" value={form.period_covered} onChange={e => F('period_covered', e.target.value)} placeholder="e.g. May 2025 – May 2026" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Key Achievements</label><textarea className="input" rows={3} value={form.achievements} onChange={e => F('achievements', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Areas for Development</label><textarea className="input" rows={2} value={form.areas_for_development} onChange={e => F('areas_for_development', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Goals Set for Next Period</label><textarea className="input" rows={2} value={form.goals_set} onChange={e => F('goals_set', e.target.value)} /></div>
            <div className="form-group"><label>Training Needs Identified</label><textarea className="input" rows={2} value={form.training_needs} onChange={e => F('training_needs', e.target.value)} /></div>
            <div className="form-group"><label>Wellbeing Check-In</label><textarea className="input" rows={2} value={form.wellbeing_check} onChange={e => F('wellbeing_check', e.target.value)} /></div>
            <div className="form-group"><label>Overall Rating</label><select className="input" value={form.overall_rating} onChange={e => F('overall_rating', e.target.value)}>{['Outstanding','Exceeds Expectations','Meets Expectations','Needs Improvement','Unsatisfactory'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Next Review Date</label><input className="input" type="date" value={form.next_review} onChange={e => F('next_review', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Staff Member Comments</label><textarea className="input" rows={2} value={form.staff_comments} onChange={e => F('staff_comments', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Staff</th><th>Date</th><th>Appraiser</th><th>Period</th><th>Rating</th><th>Training Needs</th><th>Next Review</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td><strong>{userName(r.staff_id)}</strong></td><td>{r.date}</td><td>{userName(r.appraiser_id)}</td><td>{r.period_covered || '—'}</td><td><span className={`badge badge-${r.overall_rating === 'Outstanding' || r.overall_rating === 'Exceeds Expectations' ? 'active' : r.overall_rating === 'Unsatisfactory' ? 'archived' : 'draft'}`}>{r.overall_rating}</span></td><td style={{ fontSize: 11, maxWidth: 180 }}>{r.training_needs || '—'}</td><td>{r.next_review || '—'}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">⭐</div><p>No appraisals recorded</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
