import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../App';

const CATEGORIES = ['Safeguarding','Governance','Emergency Placement','Care Planning','Risk Management','Staff & HR','Training','Medication','Fire & Health Safety','Complaints & Feedback','Children\'s Participation','Incident Management','Inspection Evidence','Policies & Procedures','Templates & Forms'];
const STATUSES = ['Draft','Active','Needs Review','Archived'];

export default function DocumentLibrary() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    const q = new URLSearchParams();
    if (catFilter) q.set('category', catFilter);
    if (statusFilter) q.set('status', statusFilter);
    api(`/api/documents?${q}`).then(setDocs).catch(() => {});
  };
  useEffect(() => { load(); }, [catFilter, statusFilter]);

  const openNew = () => { setEditing(null); setForm({ title: '', category: '', status: 'Draft', review_date: '', ref_code: '', hiqa_ref: '', notes: '' }); setShowModal(true); };
  const openEdit = (d) => { setEditing(d); setForm({ ...d }); setShowModal(true); };

  const save = async () => {
    if (editing) await api(`/api/documents/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
    else await api('/api/documents', { method: 'POST', body: JSON.stringify(form) });
    setShowModal(false); load();
  };
  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = docs.filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()) || (d.ref_code||'').toLowerCase().includes(search.toLowerCase()));

  // Group by category for summary
  const catCounts = {};
  docs.forEach(d => { catCounts[d.category] = (catCounts[d.category] || 0) + 1; });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Document Library</h1>
          <p style={{ fontSize: 12, color: '#9a9484', marginTop: 2 }}>HIQA Standards 2018 · S.I. 674/2017 · Tusla ACIMS</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Document</button>
      </div>

      {/* Category summary cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {Object.entries(catCounts).sort((a,b) => b[1]-a[1]).map(([cat, count]) => (
          <button key={cat} onClick={() => setCatFilter(catFilter === cat ? '' : cat)}
            style={{ padding: '6px 12px', borderRadius: 20, border: catFilter === cat ? '2px solid #c9a84c' : '1px solid #e0ddd8', background: catFilter === cat ? 'linear-gradient(135deg, #c9a84c, #e0c070)' : '#fff', color: catFilter === cat ? '#0d1b2a' : '#3d3830', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {cat} <span style={{ background: catFilter === cat ? 'rgba(0,0,0,0.15)' : '#f0ede8', padding: '1px 6px', borderRadius: 10, fontSize: 10 }}>{count}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <input className="toolbar-filter" style={{ flex: 1 }} placeholder="🔍 Search by title or ref code..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="toolbar-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All Status</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
        <span style={{ fontSize: 12, color: '#999' }}>{filtered.length} of {docs.length} documents</span>
      </div>

      <div className="card">
        <table className="data-table">
          <thead><tr><th>Ref</th><th>Title</th><th>Category</th><th>HIQA / Legislation</th><th>Status</th><th>Review Date</th><th>v</th><th></th></tr></thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td><code style={{ fontSize: 10, background: '#f0ede8', padding: '2px 6px', borderRadius: 3, color: '#0d1b2a', fontWeight: 600 }}>{d.ref_code || '—'}</code></td>
                <td><strong>{d.title}</strong>{d.notes && <div style={{ fontSize: 10, color: '#9a9484', marginTop: 2 }}>{d.notes.slice(0,60)}...</div>}</td>
                <td><span style={{ fontSize: 11 }}>{d.category}</span></td>
                <td style={{ fontSize: 10, color: '#5c5648', maxWidth: 180 }}>{d.hiqa_ref || '—'}</td>
                <td><span className={`badge badge-${d.status?.toLowerCase().replace(' ','-')}`}>{d.status}</span></td>
                <td style={{ color: d.review_date && d.review_date < new Date().toISOString().slice(0,10) ? '#e74c3c' : 'inherit', fontSize: 12 }}>{d.review_date || '—'}</td>
                <td style={{ fontSize: 11 }}>v{d.version}</td>
                <td style={{ display: 'flex', gap: 4 }}>
                  {d.file_path && <button className="btn btn-sm btn-primary" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => window.open(`http://localhost:3001/policies/${d.file_path}`, '_blank')}>👁 View</button>}
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(d)}>✏️</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">📁</div><p>No documents found</p></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0d1b2a, #1b2d42)', color: '#fff', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ color: '#fff' }}>{editing ? '✏️ Edit Document' : '📁 Add Document'}</h2>
              <button className="modal-close" style={{ color: '#fff' }} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full"><label>Title</label><input value={form.title||''} onChange={e => F('title',e.target.value)} /></div>
                <div className="form-group"><label>Ref Code</label><input value={form.ref_code||''} onChange={e => F('ref_code',e.target.value)} placeholder="e.g. CM-CSP-001" /></div>
                <div className="form-group"><label>Category</label><select value={form.category||''} onChange={e => F('category',e.target.value)}><option value="">Select...</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={e => F('status',e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="form-group"><label>Review Date</label><input type="date" value={form.review_date||''} onChange={e => F('review_date',e.target.value)} /></div>
                <div className="form-group full"><label>HIQA / Legislative Reference</label><input value={form.hiqa_ref||''} onChange={e => F('hiqa_ref',e.target.value)} placeholder="e.g. HIQA Standard 2 · Children First Act 2015" /></div>
                <div className="form-group full"><label>Notes</label><textarea value={form.notes||''} onChange={e => F('notes',e.target.value)} rows={3} /></div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '2px solid #c9a84c' }}><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>💾 Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
