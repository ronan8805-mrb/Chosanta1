import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../App';

export default function HandoverLog() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [form, setForm] = useState({});

  const load = () => api('/api/handovers').then(setRows).catch(() => {});
  useEffect(() => { load(); api('/api/children').then(setChildren).catch(() => {}); }, []);

  const blankForm = () => ({
    date: new Date().toISOString().slice(0,10),
    shift_type: 'Day',
    staff_on_duty: '',
    // Section B - Children
    children_present: '',
    // Section C - Incidents
    incidents_summary: '',
    // Section D - Safeguarding
    safeguarding_notes: '',
    safeguarding_concern: false,
    disclosure: false,
    staff_conduct_concern: false,
    // Section E - Medication
    medication_notes: '',
    meds_as_per_mar: true,
    med_errors: false,
    controlled_drugs_checked: true,
    // Section F - Absences
    absences: '',
    no_absences: true,
    // Section G - Appointments/Visitors
    visitors: '',
    // Section H - Tasks outstanding
    tasks_outstanding: '',
    // Section I - H&S / Premises
    fire_panel_ok: true,
    exits_clear: true,
    maintenance_issues: '',
    petty_cash: '',
    // Section J - Handover
    handover_face_to_face: true,
    handover_private: true,
    incoming_leader: '',
  });

  const openNew = () => { setEditing(null); setForm(blankForm()); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    const parsed = { ...blankForm(), ...r };
    // Parse booleans
    ['fire_panel_ok','safeguarding_concern','disclosure','staff_conduct_concern','meds_as_per_mar','med_errors','controlled_drugs_checked','no_absences','exits_clear','handover_face_to_face','handover_private'].forEach(k => {
      parsed[k] = parsed[k] === 1 || parsed[k] === true || parsed[k] === '1' || parsed[k] === 'true';
    });
    setForm(parsed);
    setShowModal(true);
  };

  const save = async () => {
    const payload = { ...form };
    if (editing) await api(`/api/handovers/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/api/handovers', { method: 'POST', body: JSON.stringify(payload) });
    setShowModal(false);
    load();
  };

  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Section header component
  const SH = ({ letter, title }) => (
    <div style={{ background: 'linear-gradient(135deg, #0d1b2a, #1b2d42)', color: '#fff', padding: '6px 14px', borderRadius: 5, margin: '16px 0 8px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ background: 'linear-gradient(135deg, #c9a84c, #e0c070)', color: '#0d1b2a', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{letter}</span>
      {title}
    </div>
  );

  const Check = ({ label, checked, onChange, disabled }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: disabled ? 'default' : 'pointer', color: disabled ? '#999' : '#3d3830' }}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ width: 16, height: 16, accentColor: '#c9a84c' }} />
      {label}
    </label>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Daily Shift Handover Log</h1>
          <p style={{ fontSize: 12, color: '#9a9484', marginTop: 2 }}>HIQA Standards 3 & 5 · S.I. 674/2017 · Tusla ACIMS</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Handover</button>
      </div>

      {/* Info Banner */}
      <div style={{ background: '#fff8e7', borderLeft: '4px solid #c9a84c', borderRadius: '0 6px 6px 0', padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#3d3830' }}>
        <strong>Inspector Note:</strong> HIQA inspectors compare handover logs against their direct observations and interviews with staff and children. Entries must be factual, objective, signed, and demonstrate management oversight.
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th><th>Shift</th><th>Leader</th><th>Staff</th>
              <th>Incidents</th><th>Safeguarding</th><th>Meds OK</th><th>Fire Panel</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td><strong>{r.date}</strong></td>
                <td><span className={`badge ${r.shift_type === 'Night' ? 'badge-draft' : 'badge-active'}`}>{r.shift_type}</span></td>
                <td>{r.leader_name}</td>
                <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.staff_on_duty || '—'}</td>
                <td>{r.incidents_summary ? <span style={{ color: '#e74c3c' }}>⚠️ Yes</span> : <span style={{ color: '#27ae60' }}>✅ None</span>}</td>
                <td>{r.safeguarding_notes ? <span style={{ color: '#e74c3c' }}>⚠️</span> : '✅'}</td>
                <td>{r.meds_as_per_mar !== 0 ? '✅' : '❌'}</td>
                <td>{r.fire_panel_ok ? '✅' : '❌'}</td>
                <td>
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(r)}>✏️ Edit</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={9}>
                <div className="empty-state"><div className="icon">🔄</div><p>No handovers recorded yet. Click "+ New Handover" to create the first entry.</p></div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FULL HANDOVER FORM MODAL - Matches PDF sections A-J */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 780, maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0d1b2a, #1b2d42)', color: '#fff', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ color: '#fff' }}>{editing ? '✏️ Edit Handover' : '📋 New Shift Handover'}</h2>
              <button className="modal-close" style={{ color: '#fff' }} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '12px 24px 20px' }}>

              {/* A - Shift Details */}
              <SH letter="A" title="Shift Details" />
              <div className="form-grid">
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
                <div className="form-group"><label>Shift</label>
                  <select value={form.shift_type} onChange={e => F('shift_type', e.target.value)}>
                    <option value="Day">Day (08:00–20:00)</option>
                    <option value="Night">Night (20:00–08:00)</option>
                    <option value="Sleepover">Sleepover</option>
                  </select>
                </div>
                <div className="form-group full"><label>Staff On Duty (names, roles, times)</label>
                  <textarea value={form.staff_on_duty || ''} onChange={e => F('staff_on_duty', e.target.value)} rows={2} placeholder="e.g. Emma Kelly (SCW, 08:00-20:00), Liam O'Brien (SCW, 08:00-20:00)" />
                </div>
              </div>

              {/* B - Children */}
              <SH letter="B" title="Children — Individual Updates" />
              <p style={{ fontSize: 11, color: '#9a9484', marginBottom: 6, fontStyle: 'italic' }}>Record wellbeing, mood, significant events, care plan activity for each child in placement.</p>
              <div className="form-group"><label>Children Present & Updates</label>
                <textarea value={form.children_present || ''} onChange={e => F('children_present', e.target.value)} rows={3}
                  placeholder="CYP-001 (A.M.) - Present. Settled mood. Attended school. No concerns.&#10;CYP-002 (B.K.) - Present. Agitated in morning, settled after lunch. Keyworking session completed." />
              </div>

              {/* C - Incidents */}
              <SH letter="C" title="Incidents / Significant Events This Shift" />
              <div className="form-group">
                <textarea value={form.incidents_summary || ''} onChange={e => F('incidents_summary', e.target.value)} rows={2}
                  placeholder="Record time, description, child/staff involved, action taken, SEN required?, incident form ref #. Leave blank if none." />
              </div>

              {/* D - Safeguarding */}
              <SH letter="D" title="Safeguarding" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                <Check label="Any child protection / safeguarding concerns this shift?" checked={form.safeguarding_concern} onChange={e => F('safeguarding_concern', e.target.checked)} />
                <Check label="Any disclosures from children?" checked={form.disclosure} onChange={e => F('disclosure', e.target.checked)} />
                <Check label="Any concerns about staff conduct?" checked={form.staff_conduct_concern} onChange={e => F('staff_conduct_concern', e.target.checked)} />
              </div>
              {(form.safeguarding_concern || form.disclosure || form.staff_conduct_concern) && (
                <div className="form-group"><label>Safeguarding Detail & DLP Notification</label>
                  <textarea value={form.safeguarding_notes || ''} onChange={e => F('safeguarding_notes', e.target.value)} rows={2} placeholder="Detail the concern and who was notified..." style={{ borderColor: '#e74c3c' }} />
                </div>
              )}

              {/* E - Medication */}
              <SH letter="E" title="Medication" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                <Check label="All medications administered as per MAR?" checked={form.meds_as_per_mar} onChange={e => F('meds_as_per_mar', e.target.checked)} />
                <Check label="Any medication errors / refusals?" checked={form.med_errors} onChange={e => F('med_errors', e.target.checked)} />
                <Check label="Controlled drugs checked & balanced?" checked={form.controlled_drugs_checked} onChange={e => F('controlled_drugs_checked', e.target.checked)} />
              </div>
              {(form.med_errors || !form.meds_as_per_mar) && (
                <div className="form-group"><label>Medication Notes</label>
                  <textarea value={form.medication_notes || ''} onChange={e => F('medication_notes', e.target.value)} rows={2} placeholder="Detail any medication issues..." />
                </div>
              )}

              {/* F - Absences */}
              <SH letter="F" title="Absences / Missing Children" />
              <Check label="No absences this shift" checked={form.no_absences} onChange={e => F('no_absences', e.target.checked)} />
              {!form.no_absences && (
                <div className="form-group" style={{ marginTop: 8 }}><label>Absence Details (Child, time absent, reason, AGS notified?, SW notified?, time returned)</label>
                  <textarea value={form.absences || ''} onChange={e => F('absences', e.target.value)} rows={2} style={{ borderColor: '#e74c3c' }} />
                </div>
              )}

              {/* G - Appointments/Visitors */}
              <SH letter="G" title="Appointments / Visitors / Activities" />
              <div className="form-group">
                <textarea value={form.visitors || ''} onChange={e => F('visitors', e.target.value)} rows={2}
                  placeholder="Time | Type (appointment/visitor/activity/family contact) | Child | Details" />
              </div>

              {/* H - Tasks Outstanding */}
              <SH letter="H" title="Tasks / Actions Outstanding for Next Shift" />
              <div className="form-group">
                <textarea value={form.tasks_outstanding || ''} onChange={e => F('tasks_outstanding', e.target.value)} rows={2}
                  placeholder="Task | For whom | Priority (Urgent/Routine) | Notes" />
              </div>

              {/* I - H&S / Premises */}
              <SH letter="I" title="Health & Safety / Premises" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <Check label="Fire panel checked ✅" checked={form.fire_panel_ok} onChange={e => F('fire_panel_ok', e.target.checked)} />
                <Check label="All exits clear and unlocked" checked={form.exits_clear} onChange={e => F('exits_clear', e.target.checked)} />
              </div>
              <div className="form-grid">
                <div className="form-group"><label>Maintenance / H&S Issues</label><input value={form.maintenance_issues || ''} onChange={e => F('maintenance_issues', e.target.value)} placeholder="None / Detail..." /></div>
                <div className="form-group"><label>Petty Cash Balance</label><input value={form.petty_cash || ''} onChange={e => F('petty_cash', e.target.value)} placeholder="€" /></div>
              </div>

              {/* J - Handover Sign-Off */}
              <SH letter="J" title="Handover Sign-Off" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <Check label="Handover conducted face-to-face?" checked={form.handover_face_to_face} onChange={e => F('handover_face_to_face', e.target.checked)} />
                <Check label="Handover conducted in private?" checked={form.handover_private} onChange={e => F('handover_private', e.target.checked)} />
              </div>
              <div className="form-group"><label>Incoming Shift Leader</label>
                <input value={form.incoming_leader || ''} onChange={e => F('incoming_leader', e.target.value)} placeholder="Name of incoming shift leader" />
              </div>

              {/* Record correction notice */}
              <div style={{ background: '#faf9f7', border: '1px dashed #c9a84c', borderRadius: 6, padding: '8px 12px', marginTop: 16, fontSize: 11, color: '#5c5648' }}>
                <strong>Record Correction Rule:</strong> No correction fluid. Errors: single line through, initial, date.<br/>
                <strong>Ref:</strong> CM-DSH-001 · HIQA Standards 3 & 5 · S.I. 674/2017 · Tusla ACIMS
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '2px solid #c9a84c' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} style={{ padding: '10px 28px' }}>💾 Save Handover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
