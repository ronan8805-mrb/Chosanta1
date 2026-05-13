import React, { useState, useEffect } from 'react';
import { api } from '../App';
const SH = ({ num, title }) => (<div style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',padding:'6px 14px',borderRadius:5,margin:'16px 0 8px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:10}}><span style={{background:'linear-gradient(135deg,#c9a84c,#e0c070)',color:'#0d1b2a',width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>{num}</span>{title}</div>);
const Check = ({ label, checked, onChange }) => (<label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={checked||false} onChange={onChange} style={{width:16,height:16,accentColor:'#c9a84c'}}/>{label}</label>);

export default function MissingChild() {
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  useEffect(() => { api('/api/children').then(setChildren).catch(() => {}); }, []);
  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openNew = () => { setForm({ date: new Date().toISOString().slice(0,10), child_id:'', amp_on_file:true, chronology:'', time_returned:'', where_found:'', condition:'Unharmed', medical:false, total_duration:'', interview_date:'', interviewer:'', child_willing:true, q_where:'',q_why:'',q_who:'',q_safe:'',q_worried:'',q_hurt:'',q_substance:'',q_help_stay:'', safeguarding_concern:false, cse_concern:false, substance_concern:false, ags_15min:true, protocol_followed:true, triggers:'', pic_reviewed:false }); setShowModal(true); };

  return (
    <div>
      <div className="page-header"><div><h1>Missing Child Chronology &amp; Return Interview</h1><p style={{fontSize:12,color:'#9a9484',marginTop:2}}>Tusla/AGS Joint Protocol · HIQA Standard 3</p></div><button className="btn btn-primary" onClick={openNew}>+ New Episode</button></div>
      <div style={{background:'#fff0f0',border:'1px solid #c0392b',borderRadius:6,padding:'10px 16px',marginBottom:16,fontSize:12}}><strong>⚠ 15-MINUTE RULE:</strong> An Garda Síochána must be notified within <strong>15 minutes</strong> of the child being identified as missing.</div>
      <div className="card"><div className="card-body"><div className="empty-state"><div className="icon">🔍</div><p>No missing child episodes recorded.</p></div></div></div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{width:780,maxHeight:'92vh'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',borderRadius:'12px 12px 0 0'}}><h2 style={{color:'#fff'}}>🔍 Missing Child Episode</h2><button className="modal-close" style={{color:'#fff'}} onClick={()=>setShowModal(false)}>×</button></div>
            <div className="modal-body" style={{padding:'12px 24px 20px'}}>
              <SH num="1" title="Missing Incident Record" />
              <div className="form-grid">
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e=>F('date',e.target.value)}/></div>
                <div className="form-group"><label>Child</label><select value={form.child_id} onChange={e=>F('child_id',e.target.value)}><option value="">Select...</option>{children.map(c=><option key={c.id} value={c.id}>{c.ref_code} — {c.first_name} {c.last_name}</option>)}</select></div>
              </div>
              <Check label="Absence Management Plan on file?" checked={form.amp_on_file} onChange={e=>F('amp_on_file',e.target.checked)}/>
              <SH num="2" title="Real-Time Chronological Log" />
              <p style={{fontSize:11,color:'#9a9484',fontStyle:'italic',marginBottom:6}}>Record every action from the moment child is identified as missing.</p>
              <div className="form-group"><label>Chronology (time | action | by whom | outcome)</label><textarea value={form.chronology||''} onChange={e=>F('chronology',e.target.value)} rows={6} placeholder="09:15 | Child identified as absent | Emma Kelly | Searched centre&#10;09:20 | Known locations checked | Liam O'Brien | Not found&#10;09:25 | AGS notified (15-min rule) | Emma Kelly | Ref: 12345&#10;09:30 | Social worker notified | Emma Kelly |&#10;...&#10;10:45 | CHILD RETURNED | Self-presented | Unharmed"/></div>
              <div className="form-grid">
                <div className="form-group"><label>Time Returned</label><input type="time" value={form.time_returned||''} onChange={e=>F('time_returned',e.target.value)}/></div>
                <div className="form-group"><label>Total Duration Absent</label><input value={form.total_duration||''} onChange={e=>F('total_duration',e.target.value)} placeholder="e.g. 1hr 30mins"/></div>
                <div className="form-group"><label>Where Found / How Returned</label><input value={form.where_found||''} onChange={e=>F('where_found',e.target.value)}/></div>
                <div className="form-group"><label>Condition on Return</label><select value={form.condition} onChange={e=>F('condition',e.target.value)}><option>Unharmed</option><option>Intoxicated</option><option>Injured</option><option>Distressed</option><option>Other</option></select></div>
              </div>
              <SH num="3" title="Return Interview (within 24 hours)" />
              <p style={{fontSize:11,color:'#9a9484',fontStyle:'italic',marginBottom:6}}>By a staff member the child trusts. Record their own words.</p>
              <div className="form-grid"><div className="form-group"><label>Interview Date</label><input type="date" value={form.interview_date||''} onChange={e=>F('interview_date',e.target.value)}/></div><div className="form-group"><label>Conducted By</label><input value={form.interviewer||''} onChange={e=>F('interviewer',e.target.value)}/></div></div>
              <Check label="Child willing to participate?" checked={form.child_willing} onChange={e=>F('child_willing',e.target.checked)}/>
              {form.child_willing && <>
                <div className="form-group"><label>Where did you go?</label><textarea value={form.q_where||''} onChange={e=>F('q_where',e.target.value)} rows={1}/></div>
                <div className="form-group"><label>Why did you leave?</label><textarea value={form.q_why||''} onChange={e=>F('q_why',e.target.value)} rows={1}/></div>
                <div className="form-group"><label>Who were you with?</label><textarea value={form.q_who||''} onChange={e=>F('q_who',e.target.value)} rows={1}/></div>
                <div className="form-group"><label>Were you safe while away?</label><textarea value={form.q_safe||''} onChange={e=>F('q_safe',e.target.value)} rows={1}/></div>
                <div className="form-group"><label>Did anything worry you or make you feel unsafe?</label><textarea value={form.q_worried||''} onChange={e=>F('q_worried',e.target.value)} rows={1}/></div>
                <div className="form-group"><label>Did anyone hurt you or make you do anything you didn't want to?</label><textarea value={form.q_hurt||''} onChange={e=>F('q_hurt',e.target.value)} rows={1}/></div>
                <div className="form-group"><label>Did you use any substances?</label><textarea value={form.q_substance||''} onChange={e=>F('q_substance',e.target.value)} rows={1}/></div>
                <div className="form-group"><label>What would help you stay in the centre?</label><textarea value={form.q_help_stay||''} onChange={e=>F('q_help_stay',e.target.value)} rows={1}/></div>
              </>}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,margin:'8px 0'}}>
                <Check label="Safeguarding concern arising?" checked={form.safeguarding_concern} onChange={e=>F('safeguarding_concern',e.target.checked)}/>
                <Check label="CSE / exploitation concern?" checked={form.cse_concern} onChange={e=>F('cse_concern',e.target.checked)}/>
                <Check label="Substance misuse concern?" checked={form.substance_concern} onChange={e=>F('substance_concern',e.target.checked)}/>
              </div>
              <SH num="5" title="PIC Review" />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,margin:'8px 0'}}>
                <Check label="15-minute AGS notification met?" checked={form.ags_15min} onChange={e=>F('ags_15min',e.target.checked)}/>
                <Check label="Joint Protocol followed?" checked={form.protocol_followed} onChange={e=>F('protocol_followed',e.target.checked)}/>
                <Check label="PIC reviewed?" checked={form.pic_reviewed} onChange={e=>F('pic_reviewed',e.target.checked)}/>
              </div>
              <div className="form-group"><label>Triggers / patterns identified</label><textarea value={form.triggers||''} onChange={e=>F('triggers',e.target.value)} rows={2}/></div>
              <div style={{background:'#faf9f7',border:'1px dashed #c9a84c',borderRadius:6,padding:'8px 12px',marginTop:16,fontSize:11,color:'#5c5648'}}><strong>Ref:</strong> CM-MCC-001 · Tusla/AGS Joint Protocol · HIQA Standard 3</div>
            </div>
            <div className="modal-footer" style={{borderTop:'2px solid #c9a84c'}}><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={()=>setShowModal(false)}>💾 Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
