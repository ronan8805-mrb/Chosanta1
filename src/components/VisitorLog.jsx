import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function VisitorLog() {
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => api('/api/visitors').then(setRows).catch(() => {});
  useEffect(() => { load(); api('/api/children').then(setChildren).catch(() => {}); }, []);

  const openNew = () => { setEditing(null); setForm({ date: new Date().toISOString().slice(0,10), visitor_name: '', organisation: '', purpose: '', child_id: '', time_in: new Date().toTimeString().slice(0,5), time_out: '', supervised: true, refused: false, refusal_reason: '' }); setShowModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ ...r, supervised: !!r.supervised, refused: !!r.refused }); setShowModal(true); };

  const save = async () => {
    if (editing) await api(`/api/visitors/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
    else await api('/api/visitors', { method: 'POST', body: JSON.stringify(form) });
    setShowModal(false); load();
  };
  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header"><h1>Visitor Log &amp; Access Register</h1><button className="btn btn-primary" onClick={openNew}>+ Log Visitor</button></div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Date</th><th>Visitor</th><th>Organisation</th><th>Purpose</th><th>Child</th><th>In</th><th>Out</th><th>Supervised</th><th>Refused</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.date}</td><td>{r.visitor_name}</td><td>{r.organisation||'—'}</td><td>{r.purpose}</td>
                <td>{r.child_name||'—'}</td><td>{r.time_in}</td><td>{r.time_out||'—'}</td>
                <td>{r.supervised ? '✅' : '❌'}</td><td>{r.refused ? '🚫' : '—'}</td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => openEdit(r)}>✏️ Edit</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10}><div className="empty-state"><div className="icon">👤</div><p>No visitors recorded</p></div></td></tr>}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? 'Edit Visitor' : 'Log New Visitor'}</h2><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => F('date',e.target.value)} /></div>
                <div className="form-group"><label>Visitor Name</label><input value={form.visitor_name||''} onChange={e => F('visitor_name',e.target.value)} /></div>
                <div className="form-group"><label>Organisation / Relationship</label><input value={form.organisation||''} onChange={e => F('organisation',e.target.value)} /></div>
                <div className="form-group"><label>Purpose</label><input value={form.purpose||''} onChange={e => F('purpose',e.target.value)} /></div>
                <div className="form-group"><label>Visiting Child</label><select value={form.child_id||''} onChange={e => F('child_id',e.target.value)}><option value="">N/A / General</option>{children.map(c => <option key={c.id} value={c.id}>{c.ref_code} — {c.first_name} {c.last_name}</option>)}</select></div>
                <div className="form-group"><label>Time In</label><input type="time" value={form.time_in||''} onChange={e => F('time_in',e.target.value)} /></div>
                <div className="form-group"><label>Time Out</label><input type="time" value={form.time_out||''} onChange={e => F('time_out',e.target.value)} /></div>
                <div className="form-group"><label><input type="checkbox" checked={form.supervised} onChange={e => F('supervised',e.target.checked)} /> Supervised Visit</label></div>
                <div className="form-group"><label><input type="checkbox" checked={form.refused} onChange={e => F('refused',e.target.checked)} /> Entry Refused</label></div>
                {form.refused && <div className="form-group full"><label>Reason for Refusal</label><textarea value={form.refusal_reason||''} onChange={e => F('refusal_reason',e.target.value)} rows={2} /></div>}
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>💾 Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
