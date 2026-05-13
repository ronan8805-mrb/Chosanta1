import React, { useState, useEffect } from 'react';
import { api } from '../App';
import { useAuth } from '../App';

const STATUS_CONFIG = {
  'Draft':          { color: '#9a9484', bg: '#f5f5f5',          label: 'Draft' },
  'Under Review':   { color: '#1565c0', bg: '#e3f2fd',          label: 'Under Review' },
  'Reviewed':       { color: '#6a1b9a', bg: '#f3e5f5',          label: 'Reviewed' },
  'Board Approved': { color: '#e65100', bg: '#fff3e0',          label: 'Board Approved' },
  'Active':         { color: '#2e7d32', bg: '#e8f5e9',          label: 'Active' },
  'Archived':       { color: '#757575', bg: '#f5f5f5',          label: 'Archived' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Draft'];
  return (
    <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:12, fontSize:11, fontWeight:700, color:cfg.color, background:cfg.bg }}>
      {cfg.label}
    </span>
  );
}

const WORKFLOW = ['Draft','Under Review','Reviewed','Board Approved','Active'];

function WorkflowStepper({ status }) {
  const current = WORKFLOW.indexOf(status);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, margin:'12px 0' }}>
      {WORKFLOW.map((step, i) => {
        const done = current > i;
        const active = current === i;
        const cfg = STATUS_CONFIG[step];
        return (
          <React.Fragment key={step}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background: done ? '#27ae60' : active ? cfg.color : '#e8e6e1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color: (done||active) ? 'white' : '#9a9484', fontWeight:700, border: active ? `2px solid ${cfg.color}` : 'none', transition:'all 0.3s' }}>
                {done ? '✓' : i+1}
              </div>
              <span style={{ fontSize:9, color: active ? cfg.color : done ? '#27ae60' : '#9a9484', fontWeight: active ? 700 : 400, whiteSpace:'nowrap', maxWidth:70, textAlign:'center', lineHeight:1.2 }}>{step}</span>
            </div>
            {i < WORKFLOW.length - 1 && (
              <div style={{ flex:1, height:2, background: done ? '#27ae60' : '#e8e6e1', margin:'0 4px', marginBottom:16, minWidth:20 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function PolicyVersionControl() {
  const { user } = useAuth();
  const [tab, setTab] = useState('library');
  const [docs, setDocs] = useState([]);
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [filter, setFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [form, setForm] = useState({ change_summary: '', effective_date: '' });
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([api('/api/policyversions'), api('/api/policyversions/pending')]);
      setDocs(d);
      setPending(p);
    } catch(e) {}
    setLoading(false);
  };

  const loadHistory = async (docId) => {
    const h = await api(`/api/policyversions/${docId}/history`);
    setHistory(h);
  };

  useEffect(() => { loadAll(); }, []);

  const action = async (versionId, endpoint, body = {}) => {
    try {
      await api(`/api/policyversions/version/${versionId}/${endpoint}`, { method:'POST', body: JSON.stringify(body) });
      loadAll();
      if (selectedDoc) loadHistory(selectedDoc.id);
    } catch(e) { alert(e.message); }
  };

  const createDraft = async () => {
    if (!form.change_summary.trim()) { alert('Please describe the changes in this version.'); return; }
    try {
      await api(`/api/policyversions/${selectedDoc.id}`, { method:'POST', body: JSON.stringify(form) });
      setShowNewVersion(false);
      setForm({ change_summary:'', effective_date:'' });
      loadAll();
      loadHistory(selectedDoc.id);
    } catch(e) { alert(e.message); }
  };

  const categories = [...new Set(docs.map(d => d.category))].sort();
  const filteredDocs = docs.filter(d =>
    (!filter || d.title.toLowerCase().includes(filter.toLowerCase()) || (d.ref_code||'').toLowerCase().includes(filter.toLowerCase())) &&
    (!catFilter || d.category === catFilter)
  );

  const canCreateDraft = user.role_level >= 3;
  const canReview      = user.role_level >= 4;
  const canApprove     = user.role_level >= 5;
  const canActivate    = user.role_level >= 4;

  return (
    <div>
      <div className="page-header">
        <h1>Policy Version Control</h1>
        <div style={{ display:'flex', gap:8 }}>
          <span style={{ background:'var(--gold-pale)', padding:'4px 12px', borderRadius:20, fontSize:12, color:'var(--navy)', fontWeight:600 }}>
            {pending.length} version{pending.length !== 1 ? 's' : ''} in workflow
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="toolbar" style={{ borderBottom:'1px solid var(--border)', paddingBottom:16, marginBottom:24 }}>
        <button className={`btn ${tab==='library'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('library')}>
          📚 Policy Library ({docs.length})
        </button>
        <button className={`btn ${tab==='pending'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('pending')}>
          ⏳ Workflow Queue {pending.length > 0 && <span style={{ background:'#e74c3c', color:'white', borderRadius:'50%', width:18, height:18, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, marginLeft:4 }}>{pending.length}</span>}
        </button>
        {selectedDoc && (
          <button className={`btn ${tab==='history'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('history')}>
            🕐 Version History — {selectedDoc.title}
          </button>
        )}
      </div>

      {/* ── POLICY LIBRARY TAB ─────────────────────────────── */}
      {tab === 'library' && (
        <div>
          {/* Filters */}
          <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
            <input
              placeholder="Search title or ref code..."
              value={filter} onChange={e => setFilter(e.target.value)}
              style={{ padding:'8px 14px', border:'2px solid var(--border)', borderRadius:6, fontSize:13, flex:1, minWidth:200 }}
            />
            <select className="toolbar-filter" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="card">
            {loading ? <div style={{padding:40, textAlign:'center'}}><div className="spinner"/></div> : (
              <table className="data-table">
                <thead>
                  <tr><th>Title</th><th>Category</th><th>Ref</th><th>Version</th><th>Status</th><th>Effective</th><th>Approved By</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredDocs.map(d => (
                    <tr key={d.id}>
                      <td>
                        <strong style={{ cursor:'pointer', color:'var(--navy)' }} onClick={()=>{ setSelectedDoc(d); loadHistory(d.id); setTab('history'); }}>
                          {d.title}
                        </strong>
                        {d.hiqa_ref && <div style={{fontSize:10,color:'var(--text-muted)'}}>{d.hiqa_ref}</div>}
                      </td>
                      <td><span style={{fontSize:11, color:'var(--text-secondary)'}}>{d.category}</span></td>
                      <td><code style={{fontSize:11}}>{d.ref_code||'—'}</code></td>
                      <td style={{fontWeight:700}}>{d.version ? `v${d.version}` : '—'}</td>
                      <td><StatusBadge status={d.version_status || 'No Version'} /></td>
                      <td style={{fontSize:12}}>{d.effective_date ? new Date(d.effective_date).toLocaleDateString('en-IE') : '—'}</td>
                      <td style={{fontSize:12}}>{d.approved_by_name || '—'}</td>
                      <td>
                        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>{ setSelectedDoc(d); loadHistory(d.id); setTab('history'); }}>History</button>
                          {canCreateDraft && (
                            <button className="btn btn-primary btn-sm" onClick={()=>{ setSelectedDoc(d); setShowNewVersion(true); }}>
                              + New Version
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── WORKFLOW QUEUE TAB ─────────────────────────────── */}
      {tab === 'pending' && (
        <div className="card">
          {pending.length === 0 ? (
            <div className="empty-state"><div className="icon">✅</div><p>No versions currently in workflow</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Document</th><th>Version</th><th>Workflow Status</th><th>Submitted By</th><th>Change Summary</th><th>Actions</th></tr></thead>
              <tbody>
                {pending.map(pv => (
                  <tr key={pv.id}>
                    <td>
                      <strong>{pv.title}</strong>
                      <div style={{fontSize:11,color:'var(--text-muted)'}}>{pv.ref_code}</div>
                    </td>
                    <td><strong>v{pv.version}</strong></td>
                    <td>
                      <StatusBadge status={pv.status} />
                      <WorkflowStepper status={pv.status} />
                    </td>
                    <td style={{fontSize:12}}>{pv.changed_by_name}</td>
                    <td style={{fontSize:12,maxWidth:200,color:'var(--text-secondary)'}}>{pv.change_summary||'—'}</td>
                    <td>
                      <div style={{display:'flex', gap:6, flexDirection:'column'}}>
                        {pv.status === 'Draft' && (
                          <button className="btn btn-primary btn-sm" onClick={()=>action(pv.id,'submit')}>Submit for Review</button>
                        )}
                        {pv.status === 'Under Review' && canReview && (
                          <button className="btn btn-secondary btn-sm" onClick={()=>setShowReviewModal({...pv,action:'review'})}>Compliance Review</button>
                        )}
                        {pv.status === 'Reviewed' && canApprove && (
                          <button className="btn btn-secondary btn-sm" onClick={()=>setShowReviewModal({...pv,action:'approve'})}>Board Approval</button>
                        )}
                        {pv.status === 'Board Approved' && canActivate && (
                          <button className="btn btn-primary btn-sm" onClick={()=>{ if(confirm('Activate this version? The current active version will be archived.')) action(pv.id,'activate'); }}>
                            🟢 Activate
                          </button>
                        )}
                        {pv.status !== 'Active' && (
                          <button className="btn btn-ghost btn-sm" onClick={()=>{ if(confirm('Archive this version?')) action(pv.id,'archive'); }}>Archive</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── VERSION HISTORY TAB ─────────────────────────────── */}
      {tab === 'history' && selectedDoc && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:'var(--navy)' }}>{selectedDoc.title}</h2>
              <p style={{fontSize:12, color:'var(--text-muted)'}}>{selectedDoc.ref_code} · {selectedDoc.category} · {selectedDoc.hiqa_ref}</p>
            </div>
            {canCreateDraft && (
              <button className="btn btn-primary" onClick={()=>setShowNewVersion(true)}>+ New Draft Version</button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="icon">📄</div><p>No versions created yet. Click "New Draft Version" to begin.</p></div></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {history.map(v => {
                const cfg = STATUS_CONFIG[v.status] || STATUS_CONFIG['Draft'];
                return (
                  <div key={v.id} className="card" style={{ borderLeft:`4px solid ${cfg.color}`, opacity: v.status==='Archived' ? 0.7 : 1 }}>
                    <div className="card-header">
                      <div style={{display:'flex', alignItems:'center', gap:12}}>
                        <span style={{fontSize:20, fontWeight:800, color:'var(--navy)'}}>v{v.version}</span>
                        <StatusBadge status={v.status} />
                        {v.is_active === 1 && <span style={{fontSize:11, fontWeight:700, color:'#27ae60', background:'#e8f5e9', padding:'2px 8px', borderRadius:10}}>CURRENT ACTIVE</span>}
                      </div>
                      <div style={{fontSize:11, color:'var(--text-muted)'}}>
                        Created {new Date(v.created_at).toLocaleDateString('en-IE')} by {v.changed_by_name}
                      </div>
                    </div>
                    <div className="card-body">
                      <WorkflowStepper status={v.status} />
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginTop:12}}>
                        <div>
                          <div style={{fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:4}}>CHANGE SUMMARY</div>
                          <div style={{fontSize:13}}>{v.change_summary || '—'}</div>
                        </div>
                        {v.review_date && (
                          <div>
                            <div style={{fontSize:11, fontWeight:700, color:'#6a1b9a', marginBottom:4}}>COMPLIANCE REVIEW</div>
                            <div style={{fontSize:12}}>{v.reviewed_by_name} · {new Date(v.review_date).toLocaleDateString('en-IE')}</div>
                            {v.review_notes && <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>{v.review_notes}</div>}
                          </div>
                        )}
                        {v.board_approval_date && (
                          <div>
                            <div style={{fontSize:11, fontWeight:700, color:'#e65100', marginBottom:4}}>BOARD APPROVAL</div>
                            <div style={{fontSize:12}}>{v.board_approved_by_name} · {new Date(v.board_approval_date).toLocaleDateString('en-IE')}</div>
                            {v.board_notes && <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>{v.board_notes}</div>}
                          </div>
                        )}
                      </div>
                      {v.effective_date && (
                        <div style={{marginTop:12, fontSize:12, color:'var(--text-muted)'}}>
                          Effective: <strong>{new Date(v.effective_date).toLocaleDateString('en-IE')}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── NEW VERSION MODAL ──────────────────────────────── */}
      {showNewVersion && selectedDoc && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>New Draft Version — {selectedDoc.title}</h2>
              <button className="modal-close" onClick={()=>setShowNewVersion(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background:'var(--gold-pale)', borderLeft:'4px solid var(--gold)', borderRadius:'0 6px 6px 0', padding:'10px 14px', marginBottom:16, fontSize:12 }}>
                This creates an immutable draft version. It enters the approval workflow: <strong>Draft → Under Review → Reviewed → Board Approved → Active</strong>.
                Previous active version will be archived when this version is activated.
              </div>
              <div className="form-group">
                <label>Description of Changes ✱</label>
                <textarea rows={4} value={form.change_summary} onChange={e=>setForm({...form, change_summary:e.target.value})}
                  placeholder="Describe what has changed in this version and why (e.g. Updated to reflect Children First Act 2023 amendments)..." />
              </div>
              <div className="form-group" style={{marginTop:14}}>
                <label>Proposed Effective Date</label>
                <input type="date" value={form.effective_date} onChange={e=>setForm({...form, effective_date:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowNewVersion(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createDraft}>Create Draft</button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEW / APPROVAL MODAL ────────────────────────── */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{showReviewModal.action === 'approve' ? '🏛 Board Approval' : '🔍 Compliance Review'} — v{showReviewModal.version}</h2>
              <button className="modal-close" onClick={()=>setShowReviewModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{fontSize:13, marginBottom:16, color:'var(--text-secondary)'}}>
                <strong>Document:</strong> {showReviewModal.title} (v{showReviewModal.version})<br/>
                <strong>Submitted by:</strong> {showReviewModal.changed_by_name}
              </p>
              <div className="form-group">
                <label>{showReviewModal.action === 'approve' ? 'Board Notes / Resolution' : 'Review Notes'}</label>
                <textarea rows={4} id="review-notes-input" placeholder={showReviewModal.action === 'approve' ? 'Board resolution, meeting reference, or approval notes...' : 'Compliance review findings and recommendations...'} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowReviewModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>{
                const notes = document.getElementById('review-notes-input').value;
                const key = showReviewModal.action === 'approve' ? 'board_notes' : 'review_notes';
                action(showReviewModal.id, showReviewModal.action, { [key]: notes });
                setShowReviewModal(null);
              }}>
                {showReviewModal.action === 'approve' ? 'Grant Board Approval' : 'Complete Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
