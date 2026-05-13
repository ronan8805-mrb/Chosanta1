import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../App';
import { PrintHeader, PrintToolbar } from './Layout';

const CATEGORIES = [
  'Safeguarding / child protection','Allegation against staff','Physical aggression / assault',
  'Self-harm / suicidal ideation','Absconding / missing from care','Substance misuse',
  'Property damage','Medication error','Physical intervention / restraint',
  'Fire / fire alarm','Accident / injury (child)','Accident / injury (staff)',
  'Peer conflict / bullying','Complaints','CSE / exploitation concern','Near miss','Other'
];
const SEVERITIES = ['Minor','Moderate','Major','Critical'];

const SH = ({ num, title }) => (
  <div style={{ background: 'linear-gradient(135deg, #0d1b2a, #1b2d42)', color: '#fff', padding: '6px 14px', borderRadius: 5, margin: '16px 0 8px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ background: 'linear-gradient(135deg, #c9a84c, #e0c070)', color: '#0d1b2a', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{num}</span>
    {title}
  </div>
);

const Check = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
    <input type="checkbox" checked={checked || false} onChange={onChange} style={{ width: 16, height: 16, accentColor: '#c9a84c' }} />
    {label}
  </label>
);

export default function IncidentLog() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ status: '', category: '', from: '', to: '' });
  const [form, setForm] = useState({});

  const load = () => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
    api(`/api/incidents?${q}`).then(setRows).catch(() => {});
  };
  useEffect(() => { load(); api('/api/children').then(setChildren).catch(() => {}); }, []);
  useEffect(() => { load(); }, [filters]);

  const blankForm = () => ({
    date: new Date().toISOString().slice(0,10),
    time: new Date().toTimeString().slice(0,5),
    category: '', severity: 'Minor', description: '', child_id: '',
    location: '', immediate_action: '', injuries: '',
    // Persons involved
    persons_involved: '',
    // Notifications
    pic_notified: true, director_notified: false,
    tusla_sen: false, garda_notified: false,
    sw_notified: false, parent_notified: false,
    // SEN
    sen_required: false, nims_ref: '',
    // PIC Review
    status: 'Open', outcome: '', learning: '',
    pic_reviewed: false, pic_review_date: '',
    risk_assessment_updated: false, care_plan_updated: false,
  });

  const openNew = () => { setEditing(null); setForm(blankForm()); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    const parsed = { ...blankForm(), ...r };
    ['sen_required','pic_reviewed','pic_notified','director_notified','tusla_sen','garda_notified','sw_notified','parent_notified','risk_assessment_updated','care_plan_updated'].forEach(k => {
      parsed[k] = parsed[k] === 1 || parsed[k] === true;
    });
    setForm(parsed);
    setShowModal(true);
  };

  const save = async () => {
    if (editing) await api(`/api/incidents/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
    else await api('/api/incidents', { method: 'POST', body: JSON.stringify(form) });
    setShowModal(false); load();
  };

  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <PrintHeader title="Incident & Significant Event Report" user={user} />
      <div className="page-header">
        <div>
          <h1>Incident &amp; Significant Event Report</h1>
          <p style={{ fontSize: 12, color: '#9a9484', marginTop: 2 }}>Tusla NIMS · S.I. 674/2017 · HIQA Standard 3 & 5</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PrintToolbar title="Incidents" data={rows} filename="incidents" />
          <button className="btn btn-primary" onClick={openNew}>+ New Incident</button>
        </div>
      </div>

      <div style={{ background: '#fff8e7', borderLeft: '4px solid #c9a84c', borderRadius: '0 6px 6px 0', padding: '10px 16px', marginBottom: 16, fontSize: 12 }}>
        <strong>Regulatory:</strong> All incidents must be recorded and reviewed by the PIC within 24 hours. SENs must be submitted to Tusla via NIMS. This record is subject to Tusla ACIMS inspection.
      </div>

      <div className="toolbar">
        <select className="toolbar-filter" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
          <option value="">All Status</option><option value="Open">Open</option><option value="Closed">Closed</option>
        </select>
        <select className="toolbar-filter" value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
          <option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" className="toolbar-filter" value={filters.from} onChange={e => setFilters(p => ({ ...p, from: e.target.value }))} />
        <span style={{ fontSize: 12, color: '#999' }}>to</span>
        <input type="date" className="toolbar-filter" value={filters.to} onChange={e => setFilters(p => ({ ...p, to: e.target.value }))} />
        <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{rows.length} records</span>
      </div>

      <div className="card">
        <table className="data-table">
          <thead><tr><th>Date</th><th>Time</th><th>Category</th><th>Severity</th><th>Child</th><th>Location</th><th>SEN</th><th>PIC Review</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td><strong>{r.date}</strong></td><td>{r.time}</td><td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.category}</td>
                <td><span className={`badge badge-${r.severity?.toLowerCase()}`}>{r.severity}</span></td>
                <td>{r.child_name || '—'}</td><td>{r.location}</td>
                <td>{r.sen_required ? '✅' : '—'}</td>
                <td>{r.pic_reviewed ? <span style={{ color: '#27ae60' }}>✅ Done</span> : <span style={{ color: '#e65100' }}>⏳ Pending</span>}</td>
                <td><span className={`badge badge-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => openEdit(r)}>✏️</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10}><div className="empty-state"><div className="icon">📋</div><p>No incidents recorded</p></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 780, maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0d1b2a, #1b2d42)', color: '#fff', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ color: '#fff' }}>{editing ? '✏️ Edit Incident' : '⚠️ New Incident Report'}</h2>
              <button className="modal-close" style={{ color: '#fff' }} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '12px 24px 20px' }}>

              <SH num="1" title="Incident Details" />
              <div className="form-grid">
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
                <div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={e => F('time', e.target.value)} /></div>
                <div className="form-group"><label>Location</label><input value={form.location || ''} onChange={e => F('location', e.target.value)} placeholder="e.g. Living room, Kitchen, Garden" /></div>
                <div className="form-group"><label>Child / Young Person</label>
                  <select value={form.child_id} onChange={e => F('child_id', e.target.value)}>
                    <option value="">N/A</option>{children.map(c => <option key={c.id} value={c.id}>{c.ref_code} — {c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
              </div>

              <p style={{ fontSize: 12, fontWeight: 700, marginTop: 12, marginBottom: 6 }}>Category (tick all that apply):</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
                {CATEGORIES.map(c => (
                  <Check key={c} label={c} checked={form.category === c} onChange={() => F('category', c)} />
                ))}
              </div>

              <SH num="2" title="Persons Involved" />
              <div className="form-group"><label>Names, roles, involvement (direct/witness), injuries</label>
                <textarea value={form.persons_involved || ''} onChange={e => F('persons_involved', e.target.value)} rows={2} placeholder="Name | Role (Child/Staff/Visitor) | Direct/Witness | Injury Y/N" />
              </div>

              <SH num="3" title="Description of Incident" />
              <p style={{ fontSize: 11, color: '#9a9484', fontStyle: 'italic', marginBottom: 4 }}>Factual, objective account. Include what happened before, during, and after.</p>
              <div className="form-group"><textarea value={form.description || ''} onChange={e => F('description', e.target.value)} rows={4} /></div>

              <SH num="4" title="Immediate Actions Taken" />
              <div className="form-group"><textarea value={form.immediate_action || ''} onChange={e => F('immediate_action', e.target.value)} rows={2} /></div>

              <SH num="5" title="Notifications" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                <Check label="PIC / Manager — immediately" checked={form.pic_notified} onChange={e => F('pic_notified', e.target.checked)} />
                <Check label="Director / Registered Provider" checked={form.director_notified} onChange={e => F('director_notified', e.target.checked)} />
                <Check label="Tusla (SEN via NIMS)" checked={form.tusla_sen} onChange={e => F('tusla_sen', e.target.checked)} />
                <Check label="An Garda Síochána" checked={form.garda_notified} onChange={e => F('garda_notified', e.target.checked)} />
                <Check label="Child's Social Worker" checked={form.sw_notified} onChange={e => F('sw_notified', e.target.checked)} />
                <Check label="Parent / Guardian" checked={form.parent_notified} onChange={e => F('parent_notified', e.target.checked)} />
              </div>

              <SH num="6" title="PIC Review & Outcome" />
              <div className="form-grid">
                <div className="form-group"><label>Severity Rating</label>
                  <select value={form.severity} onChange={e => F('severity', e.target.value)}>{SEVERITIES.map(s => <option key={s}>{s}</option>)}</select>
                </div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => F('status', e.target.value)}><option>Open</option><option>Closed</option></select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8, marginTop: 8 }}>
                <Check label="SEN Required?" checked={form.sen_required} onChange={e => F('sen_required', e.target.checked)} />
                <Check label="PIC Reviewed within 24 hours?" checked={form.pic_reviewed} onChange={e => F('pic_reviewed', e.target.checked)} />
                <Check label="Risk assessment updated?" checked={form.risk_assessment_updated} onChange={e => F('risk_assessment_updated', e.target.checked)} />
                <Check label="Care plan updated?" checked={form.care_plan_updated} onChange={e => F('care_plan_updated', e.target.checked)} />
              </div>
              {form.sen_required && (
                <div className="form-group"><label>NIMS Reference</label><input value={form.nims_ref || ''} onChange={e => F('nims_ref', e.target.value)} /></div>
              )}
              {form.pic_reviewed && (
                <div className="form-group"><label>PIC Review Date</label><input type="date" value={form.pic_review_date || ''} onChange={e => F('pic_review_date', e.target.value)} /></div>
              )}
              <div className="form-group"><label>Injuries</label><input value={form.injuries || ''} onChange={e => F('injuries', e.target.value)} placeholder="None / Detail..." /></div>
              <div className="form-group"><label>Outcome</label><textarea value={form.outcome || ''} onChange={e => F('outcome', e.target.value)} rows={2} /></div>
              <div className="form-group"><label>Learning / Service Improvement</label><textarea value={form.learning || ''} onChange={e => F('learning', e.target.value)} rows={2} /></div>

              <div style={{ background: '#faf9f7', border: '1px dashed #c9a84c', borderRadius: 6, padding: '8px 12px', marginTop: 16, fontSize: 11, color: '#5c5648' }}>
                <strong>Ref:</strong> CM-INC-001 · S.I. 674/2017 · Tusla NIMS · HIQA Standards 3 & 5
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '2px solid #c9a84c' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} style={{ padding: '10px 28px' }}>💾 Save Incident</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
