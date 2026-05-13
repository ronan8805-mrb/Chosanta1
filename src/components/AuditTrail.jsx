import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function AuditTrail() {
  const [docs, setDocs] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [tab, setTab] = useState('documents');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState({});

  const load = () => {
    api('/api/documents').then(setDocs).catch(() => {});
    api('/api/audit').then(setAuditLog).catch(() => {});
  };
  useEffect(load, []);

  const categories = ['All', ...new Set(docs.map(d => d.category))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b));
  const filtered = docs.filter(d => {
    if (filter !== 'All' && d.category !== filter) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !(d.ref_code || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openEdit = (d) => { setForm({ ...d }); setEditDoc(d); };
  const saveEdit = async () => {
    await api(`/api/documents/${editDoc.id}`, { method: 'PUT', body: JSON.stringify(form) });
    setEditDoc(null);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Audit Trail & Policy Documents</h1>
          <p style={{ color: '#9a9484', fontSize: 13 }}>
            HIQA Standards 2018 · S.I. 674/2017 · Tusla ACIMS — {docs.length} documents tracked
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1b2d42', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        <button onClick={() => setTab('documents')} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === 'documents' ? 'linear-gradient(135deg, #c9a84c, #e0c070)' : 'transparent', color: tab === 'documents' ? '#0d1b2a' : '#9a9484' }}>
          📋 Policy Documents ({docs.length})
        </button>
        <button onClick={() => setTab('audit')} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === 'audit' ? 'linear-gradient(135deg, #c9a84c, #e0c070)' : 'transparent', color: tab === 'audit' ? '#0d1b2a' : '#9a9484' }}>
          🔍 System Audit Log ({auditLog.length})
        </button>
      </div>

      {tab === 'documents' && (
        <>
          {/* Category Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {categories.map(c => {
              const count = c === 'All' ? docs.length : docs.filter(d => d.category === c).length;
              return (
                <button key={c} onClick={() => setFilter(c)}
                  style={{ padding: '5px 12px', borderRadius: 20, border: filter === c ? 'none' : '1px solid #3d3830', background: filter === c ? 'linear-gradient(135deg, #c9a84c, #e0c070)' : 'transparent', color: filter === c ? '#0d1b2a' : '#9a9484', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  {c} <span style={{ opacity: 0.7, marginLeft: 4 }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by title or ref code..." className="input" style={{ flex: 1, maxWidth: 500 }} />
            <span style={{ color: '#9a9484', fontSize: 12 }}>{filtered.length} of {docs.length} documents</span>
          </div>

          {/* Document Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {filtered.map(d => (
              <div key={d.id} style={{ background: 'linear-gradient(135deg, #1b2d42, #0d1b2a)', borderRadius: 10, padding: 18, border: '1px solid rgba(201,168,76,0.15)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #c9a84c, #e0c070, #c9a84c)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <code style={{ fontSize: 10, background: 'rgba(201,168,76,0.15)', color: '#c9a84c', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{d.ref_code || '—'}</code>
                  <span className={`badge badge-${d.status?.toLowerCase()}`} style={{ fontSize: 9 }}>{d.status}</span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0ede8', marginBottom: 6, lineHeight: 1.3 }}>{d.title}</h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.06)', color: '#9a9484', padding: '2px 8px', borderRadius: 10 }}>{d.category}</span>
                  {d.hiqa_ref && <span style={{ fontSize: 9, background: 'rgba(201,168,76,0.1)', color: '#c9a84c', padding: '2px 8px', borderRadius: 10 }}>{d.hiqa_ref}</span>}
                </div>
                {d.notes && <p style={{ fontSize: 10, color: '#7a7568', marginBottom: 12, lineHeight: 1.5 }}>{d.notes}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  {d.file_path && (
                    <button onClick={() => window.open(`http://localhost:3001/policies/${d.file_path}`, '_blank')} style={{ flex: 1, padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg, #c9a84c, #e0c070)', color: '#0d1b2a' }}>
                      📄 View Policy
                    </button>
                  )}
                  <button onClick={() => openEdit(d)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(201,168,76,0.3)', background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#c9a84c' }}>
                    ✏️ Edit
                  </button>
                </div>
                <div style={{ marginTop: 8, fontSize: 9, color: '#5c5648', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Review: {d.review_date || '—'}</span>
                  <span>v{d.version}</span>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <div className="empty-state"><div className="icon">📁</div><p>No documents match your filter</p></div>}
        </>
      )}

      {tab === 'audit' && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🔍 System Audit Log</h3>
          <table className="data-table">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Table</th><th>Record</th></tr></thead>
            <tbody>
              {auditLog.map(a => (
                <tr key={a.id}>
                  <td style={{ fontSize: 11 }}>{new Date(a.timestamp).toLocaleString()}</td>
                  <td>{a.full_name || 'System'}</td>
                  <td><span className={`badge badge-${a.action === 'CREATE' ? 'active' : 'draft'}`}>{a.action}</span></td>
                  <td style={{ fontSize: 11 }}>{a.table_name}</td>
                  <td style={{ fontSize: 11 }}>#{a.record_id}</td>
                </tr>
              ))}
              {auditLog.length === 0 && <tr><td colSpan={5}><div className="empty-state"><div className="icon">📝</div><p>No audit entries yet</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editDoc && (
        <div className="modal-overlay" onClick={() => setEditDoc(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3 style={{ marginBottom: 16 }}>Edit Document — {editDoc.ref_code}</h3>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Title</label>
                <input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="input" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {[...new Set(docs.map(d => d.category))].sort().map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="input" value={form.status || ''} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['Active', 'Draft', 'Under Review', 'Archived'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Ref Code</label>
                <input className="input" value={form.ref_code || ''} onChange={e => setForm({ ...form, ref_code: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Review Date</label>
                <input className="input" type="date" value={form.review_date || ''} onChange={e => setForm({ ...form, review_date: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>HIQA / Legislation Reference</label>
                <input className="input" value={form.hiqa_ref || ''} onChange={e => setForm({ ...form, hiqa_ref: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Notes</label>
                <textarea className="input" rows={3} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setEditDoc(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
