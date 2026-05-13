import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../App';
import { PrintHeader, PrintToolbar } from './Layout';

export default function SafeguardingReferral() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => { api('/api/logs/safeguarding').then(setRows).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';

  const blank = () => ({ date: new Date().toISOString().slice(0,10), child_id: '', concern_type: 'Neglect', source: 'Staff observation', reporter_id: '', dlp_id: '', preliminary_screen: 'Pending', screen_date: '', screen_outcome: '', mandated_report: 0, mandated_reporter_id: '', referral_method: '', referral_date: '', tusla_ref: '', retrospective_sent: 0, retrospective_date: '', garda_notified: 0, garda_date: '', parent_notified: 0, sw_notified: 0, outcome: '', follow_up: '', status: 'Open' });
  const openNew = () => { setEditing(null); setForm(blank()); setShowForm(true); };
  const openEdit = (r) => {
    setEditing(r);
    const parsed = { ...blank(), ...r };
    ['mandated_report','retrospective_sent','garda_notified','parent_notified','sw_notified'].forEach(k => {
      parsed[k] = parsed[k] === 1 || parsed[k] === true;
    });
    setForm(parsed);
    setShowForm(true);
  };

  const save = async () => {
    const d = { ...form };
    ['mandated_report','retrospective_sent','garda_notified','parent_notified','sw_notified'].forEach(k => d[k] = d[k] ? 1 : 0);
    if (editing) {
      await api(`/api/logs/safeguarding/${editing.id}`, { method: 'PUT', body: JSON.stringify(d) });
    } else {
      await api('/api/logs/safeguarding', { method: 'POST', body: JSON.stringify(d) });
    }
    setShowForm(false); load();
  };

  const concerns = ['Neglect','Physical abuse','Sexual abuse','Emotional abuse','Exploitation / CSE','Peer-on-peer','Self-harm','Disclosure','Online safety','Other'];
  const open = rows.filter(r => r.status === 'Open').length;
  const noScreen = rows.filter(r => r.preliminary_screen === 'Pending').length;

  return (
    <div>
      <PrintHeader title="Safeguarding Referral Pathway" user={user} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><h1 className="page-title">Safeguarding Referral Pathway</h1><p style={{ color: '#9a9484', fontSize: 12 }}>Children First Act 2015 · Mandated Reporting · Tusla Referral Protocol</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PrintToolbar title="Safeguarding Referrals" data={rows} filename="safeguarding_referrals" />
          <button className="btn btn-primary" onClick={openNew}>+ New Concern</button>
        </div>
      </div>
      <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 12 }}>
        <strong>⚠️ Children First Act 2015:</strong> Mandated persons must report concerns to Tusla within <strong>48 hours</strong>. If verbal referral is made, written retrospective report must follow within <strong>3 days</strong>.
      </div>
      {(open > 0 || noScreen > 0) && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 24, fontWeight: 700, color: '#e74c3c' }}>{open}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Open Referrals</div></div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 24, fontWeight: 700, color: '#f39c12' }}>{noScreen}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Awaiting Screening</div></div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 24, fontWeight: 700, color: '#27ae60' }}>{rows.filter(r => r.status === 'Closed').length}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Closed</div></div>
      </div>}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderLeft: `4px solid ${editing ? '#c9a84c' : '#e74c3c'}` }}>
          <h3 style={{ color: editing ? '#c9a84c' : '#e74c3c', marginBottom: 12 }}>{editing ? '✏️ Update Referral' : '🛡️ Children First — Safeguarding Concern Form'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Date of Concern</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Type of Concern</label><select className="input" value={form.concern_type} onChange={e => F('concern_type', e.target.value)}>{concerns.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label>Source</label><select className="input" value={form.source} onChange={e => F('source', e.target.value)}>{['Staff observation','Child disclosure','Third party','Parent/guardian','School','Other professional','Anonymous'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Reporter (who raised concern)</label><select className="input" value={form.reporter_id} onChange={e => F('reporter_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
            <div className="form-group"><label>DLP (Designated Liaison Person)</label><select className="input" value={form.dlp_id} onChange={e => F('dlp_id', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
          </div>
          <h4 style={{ color: '#c9a84c', margin: '16px 0 8px', fontSize: 13 }}>Step 1 — Preliminary Screening</h4>
          <div className="form-grid">
            <div className="form-group"><label>Screening Status</label><select className="input" value={form.preliminary_screen} onChange={e => F('preliminary_screen', e.target.value)}>{['Pending','Completed — Refer','Completed — Monitor','Completed — No further action'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Screen Date</label><input className="input" type="date" value={form.screen_date || ''} onChange={e => F('screen_date', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Screening Outcome / Rationale</label><textarea className="input" rows={2} value={form.screen_outcome || ''} onChange={e => F('screen_outcome', e.target.value)} /></div>
          <h4 style={{ color: '#c9a84c', margin: '16px 0 8px', fontSize: 13 }}>Step 2 — Mandated Reporting & Tusla Referral</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={!!form.mandated_report} onChange={e => F('mandated_report', e.target.checked ? 1 : 0)} /> Mandated Report Required</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={!!form.garda_notified} onChange={e => F('garda_notified', e.target.checked ? 1 : 0)} /> An Garda Síochána Notified</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={!!form.parent_notified} onChange={e => F('parent_notified', e.target.checked ? 1 : 0)} /> Parent/Guardian Notified</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={!!form.sw_notified} onChange={e => F('sw_notified', e.target.checked ? 1 : 0)} /> Social Worker Notified</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={!!form.retrospective_sent} onChange={e => F('retrospective_sent', e.target.checked ? 1 : 0)} /> Retrospective Report Sent</label>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Referral Method</label><select className="input" value={form.referral_method || ''} onChange={e => F('referral_method', e.target.value)}><option value="">N/A</option>{['Tusla Web Portal','Phone','Email','In Person','Child Protection Report Form'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Referral Date</label><input className="input" type="date" value={form.referral_date || ''} onChange={e => F('referral_date', e.target.value)} /></div>
            <div className="form-group"><label>Tusla Reference</label><input className="input" value={form.tusla_ref || ''} onChange={e => F('tusla_ref', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select className="input" value={form.status} onChange={e => F('status', e.target.value)}>{['Open','Under Investigation','Closed'].map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="form-group"><label>Outcome / Follow-Up</label><textarea className="input" rows={2} value={form.outcome || ''} onChange={e => F('outcome', e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={save} style={{ background: '#e74c3c' }}>💾 {editing ? 'Update Referral' : 'Save Referral'}</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Child</th><th>Concern</th><th>Source</th><th>Screen</th><th>Mandated</th><th>Tusla Ref</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map(r => (<tr key={r.id}><td><strong>{r.date}</strong></td><td>{childName(r.child_id)}</td><td style={{ fontSize: 11 }}>{r.concern_type}</td><td style={{ fontSize: 11 }}>{r.source}</td><td><span className={`badge badge-${r.preliminary_screen === 'Pending' ? 'draft' : 'active'}`}>{r.preliminary_screen?.split('—')[0]}</span></td><td>{r.mandated_report ? '✅' : '—'}</td><td>{r.tusla_ref || '—'}</td><td><span className={`badge badge-${r.status === 'Closed' ? 'active' : 'draft'}`}>{r.status}</span></td>
            <td><button className="btn btn-sm btn-ghost" onClick={() => openEdit(r)}>✏️</button></td></tr>))}
          {rows.length === 0 && <tr><td colSpan={9}><div className="empty-state"><div className="icon">🛡️</div><p>No safeguarding referrals</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
