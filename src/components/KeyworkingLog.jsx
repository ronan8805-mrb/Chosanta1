import React, { useState, useEffect } from 'react';
import { api } from '../App';
const SH = ({ num, title }) => (<div style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',padding:'6px 14px',borderRadius:5,margin:'16px 0 8px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:10}}><span style={{background:'linear-gradient(135deg,#c9a84c,#e0c070)',color:'#0d1b2a',width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>{num}</span>{title}</div>);
const Check = ({ label, checked, onChange }) => (<label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={checked||false} onChange={onChange} style={{width:16,height:16,accentColor:'#c9a84c'}}/>{label}</label>);

export default function KeyworkingLog() {
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  useEffect(() => { api('/api/children').then(setChildren).catch(() => {}); }, []);
  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openNew = () => { setForm({ date: new Date().toISOString().slice(0,10), child_id:'', keyworker:'', duration:'', location:'', mood:'', wellbeing:'', goals_progress:'', topics:'', child_voice:'', safeguarding_check:'No concerns', actions:'', reflective_notes:'', engagement:'Good', pic_reviewed:false }); setShowModal(true); };

  return (
    <div>
      <div className="page-header"><div><h1>Keyworking Session Log</h1><p style={{fontSize:12,color:'#9a9484',marginTop:2}}>HIQA Standard 4 · Child Voice · Care Plan Progress</p></div><button className="btn btn-primary" onClick={openNew}>+ New Session</button></div>
      <div style={{background:'#fff8e7',borderLeft:'4px solid #c9a84c',borderRadius:'0 6px 6px 0',padding:'10px 16px',marginBottom:16,fontSize:12}}><strong>Inspector Note:</strong> Keyworking records demonstrate individual attention, child participation, and care plan progress. Inspectors expect regular sessions with meaningful documented content.</div>
      <div className="card"><div className="card-body"><div className="empty-state"><div className="icon">💬</div><p>No keyworking sessions recorded.</p></div></div></div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" style={{width:780,maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header" style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',borderRadius:'12px 12px 0 0'}}><h2 style={{color:'#fff'}}>💬 Keyworking Session</h2><button className="modal-close" style={{color:'#fff'}} onClick={()=>setShowModal(false)}>×</button></div>
            <div className="modal-body" style={{padding:'12px 24px 20px'}}>
              <SH num="1" title="Session Details" />
              <div className="form-grid">
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e=>F('date',e.target.value)}/></div>
                <div className="form-group"><label>Child</label><select value={form.child_id} onChange={e=>F('child_id',e.target.value)}><option value="">Select...</option>{children.map(c=><option key={c.id} value={c.id}>{c.ref_code} — {c.first_name} {c.last_name}</option>)}</select></div>
                <div className="form-group"><label>Keyworker</label><input value={form.keyworker||''} onChange={e=>F('keyworker',e.target.value)}/></div>
                <div className="form-group"><label>Duration</label><input value={form.duration||''} onChange={e=>F('duration',e.target.value)} placeholder="e.g. 30 minutes"/></div>
                <div className="form-group"><label>Location</label><input value={form.location||''} onChange={e=>F('location',e.target.value)} placeholder="e.g. Quiet room"/></div>
                <div className="form-group"><label>Engagement Level</label><select value={form.engagement} onChange={e=>F('engagement',e.target.value)}><option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option><option>Declined</option></select></div>
              </div>
              <SH num="2" title="Mood & Wellbeing" />
              <div className="form-group"><label>Mood Rating / Presentation</label><input value={form.mood||''} onChange={e=>F('mood',e.target.value)} placeholder="e.g. Settled, anxious, happy, withdrawn"/></div>
              <div className="form-group"><label>Wellbeing Notes</label><textarea value={form.wellbeing||''} onChange={e=>F('wellbeing',e.target.value)} rows={2} placeholder="Physical health, sleep, appetite, emotional state..."/></div>
              <SH num="3" title="Goals & Care Plan Progress" />
              <div className="form-group"><label>Care plan goals discussed / progress</label><textarea value={form.goals_progress||''} onChange={e=>F('goals_progress',e.target.value)} rows={3}/></div>
              <SH num="4" title="Topics Discussed" />
              <div className="form-group"><label>What did you talk about?</label><textarea value={form.topics||''} onChange={e=>F('topics',e.target.value)} rows={3}/></div>
              <SH num="5" title="Child's Voice" />
              <div className="form-group"><label>What the child said (in their own words)</label><textarea value={form.child_voice||''} onChange={e=>F('child_voice',e.target.value)} rows={3} style={{fontStyle:'italic'}} placeholder="Child's words here..."/></div>
              <SH num="6" title="Safeguarding Check" />
              <div className="form-group"><label>Any safeguarding concerns arising?</label><select value={form.safeguarding_check} onChange={e=>F('safeguarding_check',e.target.value)}><option>No concerns</option><option>Yes — DLP notified</option><option>Yes — monitoring</option></select></div>
              <SH num="7" title="Actions & Follow-Up" />
              <div className="form-group"><label>Actions agreed</label><textarea value={form.actions||''} onChange={e=>F('actions',e.target.value)} rows={2}/></div>
              <div className="form-group"><label>Reflective notes (staff)</label><textarea value={form.reflective_notes||''} onChange={e=>F('reflective_notes',e.target.value)} rows={2}/></div>
              <Check label="PIC reviewed?" checked={form.pic_reviewed} onChange={e=>F('pic_reviewed',e.target.checked)}/>
              <div style={{background:'#faf9f7',border:'1px dashed #c9a84c',borderRadius:6,padding:'8px 12px',marginTop:16,fontSize:11,color:'#5c5648'}}><strong>Ref:</strong> CM-KWS-001 · HIQA Standard 4 · Care Plan Review</div>
            </div>
            <div className="modal-footer" style={{borderTop:'2px solid #c9a84c'}}><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={()=>setShowModal(false)}>💾 Save Session</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
