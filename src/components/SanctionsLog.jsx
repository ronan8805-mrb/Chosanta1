import React, { useState, useEffect } from 'react';
import { api } from '../App';
const SH = ({ num, title }) => (<div style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',padding:'6px 14px',borderRadius:5,margin:'16px 0 8px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:10}}><span style={{background:'linear-gradient(135deg,#c9a84c,#e0c070)',color:'#0d1b2a',width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>{num}</span>{title}</div>);
const Check = ({ label, checked, onChange }) => (<label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={checked||false} onChange={onChange} style={{width:16,height:16,accentColor:'#c9a84c'}}/>{label}</label>);
const BEHAVIOURS = ['Verbal aggression','Physical aggression','Property damage','Non-compliance','Substance use','Peer conflict','Leaving without permission','Other'];
const CONSEQUENCES = ['Natural consequence','Logical consequence','Loss of privilege (time-limited)','Reparation / making amends','Restorative conversation','Early bedtime','Reduced screen time','Other'];

export default function SanctionsLog() {
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  useEffect(() => { api('/api/children').then(setChildren).catch(() => {}); }, []);
  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openNew = () => { setForm({ date: new Date().toISOString().slice(0,10), time:'', child_id:'', staff_member:'', behaviour_category:'', behaviour_detail:'', deescalation:true, emotional_state:true, consequence_type:'', consequence_detail:'', duration:'', proportionate:true, age_appropriate:true, child_informed:true, child_view_sought:true, child_response:'', child_understands:true, right_to_complain:true, consistent:true, dignity:true, punitive_risk:false, disproportionate:false, safeguarding:false, pic_reviewed:false }); setShowModal(true); };

  return (
    <div>
      <div className="page-header"><div><h1>Sanctions &amp; Consequences Log</h1><p style={{fontSize:12,color:'#9a9484',marginTop:2}}>HIQA Standard 3 · UNCRC Articles 19 & 37</p></div><button className="btn btn-primary" onClick={openNew}>+ New Record</button></div>
      <div style={{background:'#fff0f0',border:'1px solid #c0392b',borderRadius:6,padding:'10px 16px',marginBottom:8,fontSize:12}}><strong>⚠ Prohibited:</strong> Corporal punishment · Food/sleep deprivation · Restricting family contact · Isolation · Humiliation · Collective punishment · Withdrawing medical care</div>
      <div style={{background:'#f0faf0',border:'1px solid #27ae60',borderRadius:6,padding:'10px 16px',marginBottom:16,fontSize:12}}><strong>✓ Therapeutic Approach:</strong> Restorative, therapeutic. Understand behaviour. Maintain relationship. Natural/logical consequences.</div>
      <div className="card"><div className="card-body"><div className="empty-state"><div className="icon">⚖️</div><p>No sanctions recorded.</p></div></div></div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" style={{width:780,maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header" style={{background:'linear-gradient(135deg,#0d1b2a,#1b2d42)',color:'#fff',borderRadius:'12px 12px 0 0'}}><h2 style={{color:'#fff'}}>⚖️ Sanction / Consequence Record</h2><button className="modal-close" style={{color:'#fff'}} onClick={()=>setShowModal(false)}>×</button></div>
            <div className="modal-body" style={{padding:'12px 24px 20px'}}>
              <SH num="1" title="Record" />
              <div className="form-grid">
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e=>F('date',e.target.value)}/></div>
                <div className="form-group"><label>Time</label><input type="time" value={form.time||''} onChange={e=>F('time',e.target.value)}/></div>
                <div className="form-group"><label>Child</label><select value={form.child_id} onChange={e=>F('child_id',e.target.value)}><option value="">Select...</option>{children.map(c=><option key={c.id} value={c.id}>{c.ref_code} — {c.first_name} {c.last_name}</option>)}</select></div>
                <div className="form-group"><label>Staff Member Applying</label><input value={form.staff_member||''} onChange={e=>F('staff_member',e.target.value)}/></div>
              </div>
              <SH num="2" title="Behaviour / Incident" />
              <div className="form-group"><label>What happened? (factual, objective)</label><textarea value={form.behaviour_detail||''} onChange={e=>F('behaviour_detail',e.target.value)} rows={2}/></div>
              <p style={{fontSize:12,fontWeight:700,marginBottom:6}}>Behaviour category:</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginBottom:8}}>{BEHAVIOURS.map(b=><Check key={b} label={b} checked={form.behaviour_category===b} onChange={()=>F('behaviour_category',b)}/>)}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}><Check label="De-escalation attempted first?" checked={form.deescalation} onChange={e=>F('deescalation',e.target.checked)}/><Check label="Child's emotional state considered?" checked={form.emotional_state} onChange={e=>F('emotional_state',e.target.checked)}/></div>
              <SH num="3" title="Consequence Applied" />
              <p style={{fontSize:12,fontWeight:700,marginBottom:6}}>Type:</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginBottom:8}}>{CONSEQUENCES.map(c=><Check key={c} label={c} checked={form.consequence_type===c} onChange={()=>F('consequence_type',c)}/>)}</div>
              <div className="form-grid">
                <div className="form-group"><label>Specific detail</label><input value={form.consequence_detail||''} onChange={e=>F('consequence_detail',e.target.value)}/></div>
                <div className="form-group"><label>Duration / time limit</label><input value={form.duration||''} onChange={e=>F('duration',e.target.value)}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,margin:'8px 0'}}><Check label="Proportionate?" checked={form.proportionate} onChange={e=>F('proportionate',e.target.checked)}/><Check label="Age-appropriate?" checked={form.age_appropriate} onChange={e=>F('age_appropriate',e.target.checked)}/></div>
              <SH num="4" title="Child's Involvement & Response" />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                <Check label="Child informed of consequence?" checked={form.child_informed} onChange={e=>F('child_informed',e.target.checked)}/>
                <Check label="Child's view sought?" checked={form.child_view_sought} onChange={e=>F('child_view_sought',e.target.checked)}/>
                <Check label="Child understands why?" checked={form.child_understands} onChange={e=>F('child_understands',e.target.checked)}/>
                <Check label="Right to complain explained?" checked={form.right_to_complain} onChange={e=>F('right_to_complain',e.target.checked)}/>
              </div>
              <div className="form-group"><label>Child's response (in their own words)</label><textarea value={form.child_response||''} onChange={e=>F('child_response',e.target.value)} rows={2} style={{fontStyle:'italic'}} placeholder="Child's words here..."/></div>
              <SH num="5" title="Safeguarding & Proportionality Check" />
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <Check label="Consistent with behaviour policy?" checked={form.consistent} onChange={e=>F('consistent',e.target.checked)}/>
                <Check label="Respects child's dignity?" checked={form.dignity} onChange={e=>F('dignity',e.target.checked)}/>
                <Check label="Could be perceived as punitive?" checked={form.punitive_risk} onChange={e=>F('punitive_risk',e.target.checked)}/>
                <Check label="Child receiving disproportionate sanctions?" checked={form.disproportionate} onChange={e=>F('disproportionate',e.target.checked)}/>
                <Check label="Any safeguarding concern arising?" checked={form.safeguarding} onChange={e=>F('safeguarding',e.target.checked)}/>
                <Check label="PIC reviewed?" checked={form.pic_reviewed} onChange={e=>F('pic_reviewed',e.target.checked)}/>
              </div>
              <div style={{background:'#faf9f7',border:'1px dashed #c9a84c',borderRadius:6,padding:'8px 12px',marginTop:16,fontSize:11,color:'#5c5648'}}><strong>Ref:</strong> CM-SCL-001 · HIQA Standard 3 · UNCRC Articles 19 & 37</div>
            </div>
            <div className="modal-footer" style={{borderTop:'2px solid #c9a84c'}}><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={()=>setShowModal(false)}>💾 Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
