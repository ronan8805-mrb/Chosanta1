import React, { useState, useEffect } from 'react';
import { api } from '../App';
const SH = ({ num, title }) => (<div style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',padding:'6px 14px',borderRadius:5,margin:'16px 0 8px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:10}}><span style={{background:'linear-gradient(135deg,#c9a84c,#e0c070)',color:'#0d1b2a',width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>{num}</span>{title}</div>);
const Check = ({ label, checked, onChange }) => (<label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={checked||false} onChange={onChange} style={{width:16,height:16,accentColor:'#c9a84c'}}/>{label}</label>);
const PLACEMENT = ['Planned','Emergency (s.12)','Emergency (s.13)','Voluntary (s.4)','Court Order (s.18)','Interim (s.17)','Other'];
const REFERRAL = ['Tusla Social Work','Tusla OOH','Court','Other centre','Hospital','AGS','Other'];
const CHECKLIST = ['Referral info received','Risk assessment received/completed','Care plan received/being prepared','Placement plan commenced','Consent forms signed','Medical/health info obtained','GP registered','Education placement confirmed','Keyworker allocated','PEEP completed','Absence Management Plan completed','Child shown around/welcomed','Child given complaints info/EPIC leaflet','Belongings inventoried','Photo ID taken (consent obtained)'];

export default function AdmissionsLog() {
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  useEffect(() => { api('/api/children').then(setChildren).catch(() => {}); }, []);
  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openNew = () => { const checks = {}; CHECKLIST.forEach((c,i) => checks[`chk_${i}`] = false); setForm({ date: new Date().toISOString().slice(0,10), time:'', child_id:'', placement_type:'', referral_source:'', referring_sw:'', tusla_area:'', court_ref:'', expected_duration:'', ...checks }); setShowModal(true); };

  return (
    <div>
      <div className="page-header"><div><h1>Admissions &amp; Discharge Log</h1><p style={{fontSize:12,color:'#9a9484',marginTop:2}}>HIQA Standard 2 · S.I. 259/1995 Articles 4-8</p></div><button className="btn btn-primary" onClick={openNew}>+ New Admission</button></div>
      <div style={{background:'#fff8e7',borderLeft:'4px solid #c9a84c',borderRadius:'0 6px 6px 0',padding:'10px 16px',marginBottom:16,fontSize:12}}><strong>Statutory:</strong> Article 4 of S.I. 259/1995 requires a care plan <strong>before</strong> placement or within <strong>7 working days</strong>. Emergency placements must be notified to Tusla.</div>
      <div className="card"><div className="card-body"><div className="empty-state"><div className="icon">🏠</div><p>No admissions recorded. Click "+ New Admission" to register a placement.</p></div></div></div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{width:780,maxHeight:'92vh'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',borderRadius:'12px 12px 0 0'}}><h2 style={{color:'#fff'}}>🏠 New Admission</h2><button className="modal-close" style={{color:'#fff'}} onClick={()=>setShowModal(false)}>×</button></div>
            <div className="modal-body" style={{padding:'12px 24px 20px'}}>
              <SH num="1" title="Admission Record" />
              <div className="form-grid">
                <div className="form-group"><label>Date of Admission</label><input type="date" value={form.date} onChange={e=>F('date',e.target.value)}/></div>
                <div className="form-group"><label>Time</label><input type="time" value={form.time||''} onChange={e=>F('time',e.target.value)}/></div>
                <div className="form-group"><label>Child</label><select value={form.child_id} onChange={e=>F('child_id',e.target.value)}><option value="">Select / New...</option>{children.map(c=><option key={c.id} value={c.id}>{c.ref_code} — {c.first_name} {c.last_name}</option>)}</select></div>
                <div className="form-group"><label>Placement Type</label><select value={form.placement_type} onChange={e=>F('placement_type',e.target.value)}><option value="">Select...</option>{PLACEMENT.map(p=><option key={p}>{p}</option>)}</select></div>
                <div className="form-group"><label>Referral Source</label><select value={form.referral_source} onChange={e=>F('referral_source',e.target.value)}><option value="">Select...</option>{REFERRAL.map(r=><option key={r}>{r}</option>)}</select></div>
                <div className="form-group"><label>Referring Social Worker</label><input value={form.referring_sw||''} onChange={e=>F('referring_sw',e.target.value)}/></div>
                <div className="form-group"><label>Tusla Area Office</label><input value={form.tusla_area||''} onChange={e=>F('tusla_area',e.target.value)}/></div>
                <div className="form-group"><label>Expected Duration</label><select value={form.expected_duration} onChange={e=>F('expected_duration',e.target.value)}><option value="">Select...</option><option>Short-term (&lt;3 months)</option><option>Medium (3-12 months)</option><option>Long-term (&gt;12 months)</option><option>Unknown</option></select></div>
              </div>
              <SH num="2" title="Admission Checklist (72hrs / 24hrs emergency)" />
              <p style={{fontSize:11,color:'#9a9484',fontStyle:'italic',marginBottom:8}}>All items to be completed within 72 hours of admission (or 24 hours for emergency placements).</p>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {CHECKLIST.map((item,i) => <Check key={i} label={item} checked={form[`chk_${i}`]} onChange={e=>F(`chk_${i}`,e.target.checked)}/>)}
              </div>
              <div style={{background:'#faf9f7',border:'1px dashed #c9a84c',borderRadius:6,padding:'8px 12px',marginTop:16,fontSize:11,color:'#5c5648'}}><strong>Ref:</strong> CM-ADL-001 · S.I. 259/1995 · HIQA Standard 2 · Child Care Act 1991</div>
            </div>
            <div className="modal-footer" style={{borderTop:'2px solid #c9a84c'}}><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={()=>setShowModal(false)}>💾 Save Admission</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
