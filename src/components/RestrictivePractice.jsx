import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../App';
import { PrintHeader, PrintToolbar } from './Layout';

const TYPES = ['Physical Intervention','Mechanical Restraint','Environmental Restriction','Chemical Restraint','Seclusion','Other'];
const TECHNIQUES = ['TCI Basket Hold','TCI Single Elbow','TCI Team Control','MAPA Low','MAPA Medium','MAPA High','Guided Away','Blocked Exit','Other'];

const SH = ({ num, title }) => (
  <div style={{ background: 'linear-gradient(135deg, #0d1b2a, #1b2d42)', color: '#fff', padding: '6px 14px', borderRadius: 5, margin: '16px 0 8px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ background: 'linear-gradient(135deg, #c9a84c, #e0c070)', color: '#0d1b2a', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{num}</span>
    {title}
  </div>
);
const CK = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
    <input type="checkbox" checked={checked || false} onChange={onChange} style={{ width: 16, height: 16, accentColor: '#c9a84c' }} />{label}
  </label>
);

export default function RestrictivePracticeLog() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => { api('/api/logs/restrictive').then(setRows).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  const blank = () => ({
    child_id: '', date: new Date().toISOString().slice(0,10),
    start_time: '', end_time: '', duration_mins: '',
    type: 'Physical Intervention', technique: '', reason: '',
    antecedent: '', behaviour: '', deescalation_attempted: 'Yes', deescalation_detail: '',
    description: '', child_presentation: '', child_post_incident: '',
    injuries_child: 'None', injuries_staff: 'None',
    staff_involved: '', witnesses: '',
    child_debrief: false, child_debrief_date: '', child_debrief_notes: '', child_account: '',
    staff_debrief: false, staff_debrief_date: '',
    proportionate: true, necessary: true, minimum_force: true,
    pic_reviewed: false, pic_review_date: '', pic_notes: '',
    sen_submitted: false, sen_ref: '',
    risk_assessment_updated: false, care_plan_updated: false,
    status: 'Open'
  });
  const openNew = () => { setEditing(null); setForm(blank()); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    const parsed = { ...blank(), ...r };
    ['child_debrief','staff_debrief','proportionate','necessary','minimum_force','pic_reviewed','sen_submitted','risk_assessment_updated','care_plan_updated'].forEach(k => {
      parsed[k] = parsed[k] === 1 || parsed[k] === true;
    });
    setForm(parsed);
    setShowModal(true);
  };

  const save = async () => {
    const d = { ...form };
    ['child_debrief','staff_debrief','proportionate','necessary','minimum_force','pic_reviewed','sen_submitted','risk_assessment_updated','care_plan_updated'].forEach(k => d[k] = d[k] ? 1 : 0);
    if (editing) {
      await api(`/api/logs/restrictive/${editing.id}`, { method: 'PUT', body: JSON.stringify(d) });
    } else {
      await api('/api/logs/restrictive', { method: 'POST', body: JSON.stringify(d) });
    }
    setShowModal(false); load();
  };

  const noDebrief = rows.filter(r => !r.child_debrief).length;

  return (
    <div>
      <PrintHeader title="Restrictive Practice Register" user={user} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><h1 className="page-title">Restrictive Practice Register</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 3 · PBS Policy · S.I. 674/2017 · Tusla SEN Required</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <PrintToolbar title="Restrictive Practices" data={rows} filename="restrictive_practices" />
          <button className="btn btn-primary" onClick={openNew}>+ Record Intervention</button>
        </div>
      </div>
      {noDebrief > 0 && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 12 }}>⚠️ <strong>{noDebrief} intervention(s)</strong> without child debrief — mandatory within 24 hours per HIQA Standard 3</div>}
      <div style={{ background: '#fff8e7', borderLeft: '4px solid #c9a84c', borderRadius: '0 6px 6px 0', padding: '10px 16px', marginBottom: 16, fontSize: 12 }}>
        <strong>Regulatory:</strong> Every physical intervention must be recorded immediately, reviewed by PIC, and reported as SEN to Tusla via NIMS. Child debrief is mandatory within 24 hours. Staff debrief must occur same shift.
      </div>
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Time</th><th>Child</th><th>Type</th><th>Duration</th><th>Debrief</th><th>PIC</th><th>SEN</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map(r => (<tr key={r.id}>
            <td><strong>{r.date}</strong></td><td>{r.start_time}–{r.end_time}</td>
            <td>{childName(r.child_id)}</td>
            <td style={{ fontSize: 11 }}>{r.type}</td>
            <td>{r.duration_mins ? `${r.duration_mins}m` : '—'}</td>
            <td>{r.child_debrief ? <span style={{ color: '#27ae60' }}>✅ Done</span> : <span style={{ color: '#e74c3c' }}>❌ Missing</span>}</td>
            <td>{r.pic_reviewed ? <span style={{ color: '#27ae60' }}>✅</span> : <span style={{ color: '#e65100' }}>⏳</span>}</td>
            <td>{r.sen_submitted ? '✅' : '—'}</td>
            <td><span className={`badge badge-${r.status === 'Closed' ? 'active' : 'draft'}`}>{r.status}</span></td>
            <td><button className="btn btn-sm btn-ghost" onClick={() => openEdit(r)}>✏️</button></td>
          </tr>))}
          {rows.length === 0 && <tr><td colSpan={10}><div className="empty-state"><div className="icon">🛑</div><p>No restrictive practice records</p></div></td></tr>}</tbody></table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 800, maxHeight: '94vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #3d0c0c, #1a0505)', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ color: '#ff6b6b' }}>{editing ? '✏️ Update Restrictive Practice' : '🛑 New Restrictive Practice Record'}</h2>
              <button className="modal-close" style={{ color: '#fff' }} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '12px 24px 20px', maxHeight: '72vh', overflow: 'auto' }}>
              <SH num="1" title="Intervention Details" />
              <div className="form-grid">
                <div className="form-group"><label>Child</label><select value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
                <div className="form-group"><label>Start Time</label><input type="time" value={form.start_time} onChange={e => F('start_time', e.target.value)} /></div>
                <div className="form-group"><label>End Time</label><input type="time" value={form.end_time} onChange={e => F('end_time', e.target.value)} /></div>
                <div className="form-group"><label>Duration (minutes)</label><input type="number" value={form.duration_mins} onChange={e => F('duration_mins', parseInt(e.target.value))} /></div>
                <div className="form-group"><label>Type</label><select value={form.type} onChange={e => F('type', e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label>Technique Used</label><select value={form.technique} onChange={e => F('technique', e.target.value)}><option value="">Select...</option>{TECHNIQUES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label>Staff Involved</label><input value={form.staff_involved || ''} onChange={e => F('staff_involved', e.target.value)} placeholder="Names and roles" /></div>
              </div>
              <SH num="2" title="Antecedent — Behaviour — Consequence" />
              <div className="form-group"><label>What happened before (antecedent)?</label><textarea rows={2} value={form.antecedent || ''} onChange={e => F('antecedent', e.target.value)} /></div>
              <div className="form-group"><label>Behaviour that necessitated intervention</label><textarea rows={2} value={form.behaviour || ''} onChange={e => F('behaviour', e.target.value)} /></div>
              <div className="form-group"><label>De-escalation attempted?</label><select value={form.deescalation_attempted} onChange={e => F('deescalation_attempted', e.target.value)}><option>Yes</option><option>No — explain</option></select></div>
              <div className="form-group"><label>De-escalation detail</label><textarea rows={2} value={form.deescalation_detail || ''} onChange={e => F('deescalation_detail', e.target.value)} placeholder="What strategies were tried before intervention?" /></div>
              <SH num="3" title="Full Account" />
              <div className="form-group"><label>Description of intervention</label><textarea rows={3} value={form.description || ''} onChange={e => F('description', e.target.value)} /></div>
              <div className="form-group"><label>Child's presentation during</label><textarea rows={2} value={form.child_presentation || ''} onChange={e => F('child_presentation', e.target.value)} /></div>
              <div className="form-group"><label>Child's condition after</label><textarea rows={2} value={form.child_post_incident || ''} onChange={e => F('child_post_incident', e.target.value)} /></div>
              <div className="form-grid">
                <div className="form-group"><label>Injuries to child</label><input value={form.injuries_child || ''} onChange={e => F('injuries_child', e.target.value)} /></div>
                <div className="form-group"><label>Injuries to staff</label><input value={form.injuries_staff || ''} onChange={e => F('injuries_staff', e.target.value)} /></div>
              </div>
              <SH num="4" title="Debriefs (MANDATORY)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: 12 }}>
                  <h4 style={{ color: '#c9a84c', fontSize: 13, marginBottom: 8 }}>👧 Child Debrief</h4>
                  <CK label="Child debrief completed" checked={form.child_debrief} onChange={e => F('child_debrief', e.target.checked)} />
                  {form.child_debrief && <>
                    <div className="form-group" style={{ marginTop: 8 }}><label>Date</label><input type="date" value={form.child_debrief_date || ''} onChange={e => F('child_debrief_date', e.target.value)} /></div>
                    <div className="form-group"><label>Child's own account</label><textarea rows={2} value={form.child_account || ''} onChange={e => F('child_account', e.target.value)} placeholder="Record the child's perspective in their own words" /></div>
                    <div className="form-group"><label>Debrief notes</label><textarea rows={2} value={form.child_debrief_notes || ''} onChange={e => F('child_debrief_notes', e.target.value)} /></div>
                  </>}
                </div>
                <div style={{ border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: 12 }}>
                  <h4 style={{ color: '#c9a84c', fontSize: 13, marginBottom: 8 }}>👨‍💼 Staff Debrief</h4>
                  <CK label="Staff debrief completed" checked={form.staff_debrief} onChange={e => F('staff_debrief', e.target.checked)} />
                  {form.staff_debrief && <div className="form-group" style={{ marginTop: 8 }}><label>Date</label><input type="date" value={form.staff_debrief_date || ''} onChange={e => F('staff_debrief_date', e.target.value)} /></div>}
                </div>
              </div>
              <SH num="5" title="PIC Review & SEN" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <CK label="Was the intervention proportionate?" checked={form.proportionate} onChange={e => F('proportionate', e.target.checked)} />
                <CK label="Was it necessary?" checked={form.necessary} onChange={e => F('necessary', e.target.checked)} />
                <CK label="Was minimum force used?" checked={form.minimum_force} onChange={e => F('minimum_force', e.target.checked)} />
                <CK label="PIC reviewed" checked={form.pic_reviewed} onChange={e => F('pic_reviewed', e.target.checked)} />
                <CK label="SEN submitted to Tusla" checked={form.sen_submitted} onChange={e => F('sen_submitted', e.target.checked)} />
                <CK label="Risk assessment updated" checked={form.risk_assessment_updated} onChange={e => F('risk_assessment_updated', e.target.checked)} />
                <CK label="Care plan updated" checked={form.care_plan_updated} onChange={e => F('care_plan_updated', e.target.checked)} />
              </div>
              {form.pic_reviewed && <div className="form-group" style={{ marginTop: 8 }}><label>PIC Review Date</label><input type="date" value={form.pic_review_date || ''} onChange={e => F('pic_review_date', e.target.value)} /></div>}
              {form.sen_submitted && <div className="form-group" style={{ marginTop: 8 }}><label>NIMS Reference</label><input value={form.sen_ref || ''} onChange={e => F('sen_ref', e.target.value)} /></div>}
              <div className="form-group"><label>PIC Review Notes</label><textarea rows={2} value={form.pic_notes || ''} onChange={e => F('pic_notes', e.target.value)} /></div>
              <div className="form-group"><label>Status</label><select value={form.status} onChange={e => F('status', e.target.value)}><option>Open</option><option>Closed</option></select></div>
            </div>
            <div className="modal-footer" style={{ borderTop: '2px solid #e74c3c' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} style={{ background: '#e74c3c' }}>💾 {editing ? 'Update Record' : 'Save Record'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
