import React, { useState } from 'react';
const SH = ({ num, title }) => (<div style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',padding:'6px 14px',borderRadius:5,margin:'16px 0 8px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:10}}><span style={{background:'linear-gradient(135deg,#c9a84c,#e0c070)',color:'#0d1b2a',width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>{num}</span>{title}</div>);
const Check = ({ label, checked, onChange }) => (<label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={checked||false} onChange={onChange} style={{width:16,height:16,accentColor:'#c9a84c'}}/>{label}</label>);
const CATS = ['Safeguarding / child protection','Missing child','Physical intervention / restraint','Self-harm / suicide concern','Medical emergency','Substance misuse','Staffing crisis / unsafe staffing','Property damage','Fire / security / H&S emergency','Emergency placement query','Complaint from parent / SW','Allegation against staff','Other'];

export default function OnCallLog() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openNew = () => { setForm({ date: new Date().toISOString().slice(0,10), time:'', on_call_manager:'', call_from:'', category:'', chronology:'', decision:'', advice_given:true, attended:false, escalated_director:false, ags:false, ambulance:false, tusla_ooh:false, sw_next_day:false, parent:false, director:false, incident_form:false, sen_required:false, handover_done:false, actions:'', pic_reviewed:false }); setShowModal(true); };

  return (
    <div>
      <div className="page-header"><div><h1>On-Call &amp; Escalation Log</h1><p style={{fontSize:12,color:'#9a9484',marginTop:2}}>HIQA Standard 5 · S.I. 674/2017 · Emergency Governance</p></div><button className="btn btn-primary" onClick={openNew}>+ New Call Record</button></div>
      <div style={{background:'#fff8e7',borderLeft:'4px solid #c9a84c',borderRadius:'0 6px 6px 0',padding:'10px 16px',marginBottom:16,fontSize:12}}><strong>📞 Escalation:</strong> Level 1: Shift Leader → Level 2: PIC (on-call) → Level 3: Director → Level 4: Emergency services & Tusla OOH</div>
      <div className="card"><div className="card-body"><div className="empty-state"><div className="icon">📞</div><p>No on-call records. Click "+ New Call Record" to log an out-of-hours call.</p></div></div></div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" style={{width:780,maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header" style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',borderRadius:'12px 12px 0 0'}}><h2 style={{color:'#fff'}}>📞 On-Call Record</h2><button className="modal-close" style={{color:'#fff'}} onClick={()=>setShowModal(false)}>×</button></div>
            <div className="modal-body" style={{padding:'12px 24px 20px'}}>
              <SH num="2" title="On-Call Incident Record" />
              <div className="form-grid">
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e=>F('date',e.target.value)}/></div>
                <div className="form-group"><label>Time of Call</label><input type="time" value={form.time||''} onChange={e=>F('time',e.target.value)}/></div>
                <div className="form-group"><label>On-Call Manager</label><input value={form.on_call_manager||''} onChange={e=>F('on_call_manager',e.target.value)}/></div>
                <div className="form-group"><label>Call From</label><input value={form.call_from||''} onChange={e=>F('call_from',e.target.value)}/></div>
              </div>
              <p style={{fontSize:12,fontWeight:700,marginTop:12,marginBottom:6}}>Category:</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginBottom:12}}>{CATS.map(c=><Check key={c} label={c} checked={form.category===c} onChange={()=>F('category',c)}/>)}</div>
              <SH num="3" title="Call Detail & Chronology" />
              <div className="form-group"><label>Chronology (time | action | by whom | outcome)</label><textarea value={form.chronology||''} onChange={e=>F('chronology',e.target.value)} rows={4}/></div>
              <SH num="4" title="Management Decision" />
              <div className="form-group"><label>Decision made & rationale</label><textarea value={form.decision||''} onChange={e=>F('decision',e.target.value)} rows={2}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,margin:'8px 0'}}>
                <Check label="Advice/instruction given to shift staff?" checked={form.advice_given} onChange={e=>F('advice_given',e.target.checked)}/>
                <Check label="On-call manager attended centre?" checked={form.attended} onChange={e=>F('attended',e.target.checked)}/>
                <Check label="Escalated to Director?" checked={form.escalated_director} onChange={e=>F('escalated_director',e.target.checked)}/>
              </div>
              <SH num="5" title="Notifications Made" />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,margin:'8px 0'}}>
                <Check label="An Garda Síochána" checked={form.ags} onChange={e=>F('ags',e.target.checked)}/>
                <Check label="Ambulance / Emergency" checked={form.ambulance} onChange={e=>F('ambulance',e.target.checked)}/>
                <Check label="Tusla Out-of-Hours" checked={form.tusla_ooh} onChange={e=>F('tusla_ooh',e.target.checked)}/>
                <Check label="Social Worker (next day)" checked={form.sw_next_day} onChange={e=>F('sw_next_day',e.target.checked)}/>
                <Check label="Parent / Guardian" checked={form.parent} onChange={e=>F('parent',e.target.checked)}/>
                <Check label="Director / Reg Provider" checked={form.director} onChange={e=>F('director',e.target.checked)}/>
              </div>
              <SH num="6" title="Follow-Up Required" />
              <div className="form-group"><label>Actions required</label><textarea value={form.actions||''} onChange={e=>F('actions',e.target.value)} rows={2}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,margin:'8px 0'}}>
                <Check label="Incident form completed?" checked={form.incident_form} onChange={e=>F('incident_form',e.target.checked)}/>
                <Check label="SEN/NIMS required?" checked={form.sen_required} onChange={e=>F('sen_required',e.target.checked)}/>
                <Check label="Handover to day staff?" checked={form.handover_done} onChange={e=>F('handover_done',e.target.checked)}/>
                <Check label="PIC reviewed (next day)?" checked={form.pic_reviewed} onChange={e=>F('pic_reviewed',e.target.checked)}/>
              </div>
              <div style={{background:'#faf9f7',border:'1px dashed #c9a84c',borderRadius:6,padding:'8px 12px',marginTop:16,fontSize:11,color:'#5c5648'}}><strong>Ref:</strong> CM-OCE-001 · HIQA Standard 5 · S.I. 674/2017</div>
            </div>
            <div className="modal-footer" style={{borderTop:'2px solid #c9a84c'}}><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={()=>setShowModal(false)}>💾 Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
