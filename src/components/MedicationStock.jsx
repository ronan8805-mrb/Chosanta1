import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function MedicationStock() {
  const [stock, setStock] = useState([]);
  const [prn, setPrn] = useState([]);
  const [children, setChildren] = useState([]);
  const [tab, setTab] = useState('stock');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  const load = () => { api('/api/logs/medstock').then(setStock).catch(() => {}); api('/api/logs/prnprotocols').then(setPrn).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : '—'; };

  const blankStock = () => ({ child_id: '', medication_name: '', form: 'Tablet', strength: '', prescriber: '', pharmacy: '', quantity_received: '', date_received: new Date().toISOString().slice(0,10), quantity_current: '', date_checked: new Date().toISOString().slice(0,10), discrepancy: '', expiry_date: '', controlled: 0, notes: '' });
  const blankPrn = () => ({ child_id: '', medication_name: '', dose: '', route: 'Oral', indication: '', max_dose_24h: '', min_interval: '', prescriber: '', gp_authorisation_date: '', special_instructions: '', review_date: '', status: 'Active' });

  const openNew = () => { setForm(tab === 'stock' ? blankStock() : blankPrn()); setShowForm(true); };
  const save = async () => {
    const ep = tab === 'stock' ? 'medstock' : 'prnprotocols';
    await api(`/api/logs/${ep}`, { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false); load();
  };

  const expired = stock.filter(r => r.expiry_date && new Date(r.expiry_date) < new Date()).length;
  const discrepancies = stock.filter(r => r.discrepancy && r.discrepancy !== '').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><h1 className="page-title">Medication Stock & PRN Protocols</h1><p style={{ color: '#9a9484', fontSize: 12 }}>Medication Management Policy · Controlled Drug Register · GP Authorisation</p></div>
        <button className="btn btn-primary" onClick={openNew}>+ Add {tab === 'stock' ? 'Stock Entry' : 'PRN Protocol'}</button>
      </div>
      {(expired > 0 || discrepancies > 0) && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 12 }}>
        {expired > 0 && <span>⚠️ <strong>{expired} medication(s) expired</strong> — must be disposed of immediately. </span>}
        {discrepancies > 0 && <span>🔴 <strong>{discrepancies} stock discrepancy(ies)</strong> — investigate and report.</span>}
      </div>}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        <button className={`btn ${tab === 'stock' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setTab('stock'); setShowForm(false); }}>📦 Stock Control</button>
        <button className={`btn ${tab === 'prn' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setTab('prn'); setShowForm(false); }}>💊 PRN Protocols</button>
      </div>
      {showForm && tab === 'stock' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Medication</label><input className="input" value={form.medication_name} onChange={e => F('medication_name', e.target.value)} /></div>
            <div className="form-group"><label>Form</label><select className="input" value={form.form} onChange={e => F('form', e.target.value)}>{['Tablet','Capsule','Liquid','Inhaler','Injection','Topical','Patch','Other'].map(f => <option key={f}>{f}</option>)}</select></div>
            <div className="form-group"><label>Strength</label><input className="input" value={form.strength} onChange={e => F('strength', e.target.value)} placeholder="e.g. 500mg" /></div>
            <div className="form-group"><label>Prescriber</label><input className="input" value={form.prescriber} onChange={e => F('prescriber', e.target.value)} /></div>
            <div className="form-group"><label>Pharmacy</label><input className="input" value={form.pharmacy} onChange={e => F('pharmacy', e.target.value)} /></div>
            <div className="form-group"><label>Qty Received</label><input className="input" type="number" value={form.quantity_received} onChange={e => F('quantity_received', parseInt(e.target.value))} /></div>
            <div className="form-group"><label>Date Received</label><input className="input" type="date" value={form.date_received} onChange={e => F('date_received', e.target.value)} /></div>
            <div className="form-group"><label>Current Stock Count</label><input className="input" type="number" value={form.quantity_current} onChange={e => F('quantity_current', parseInt(e.target.value))} /></div>
            <div className="form-group"><label>Date Checked</label><input className="input" type="date" value={form.date_checked} onChange={e => F('date_checked', e.target.value)} /></div>
            <div className="form-group"><label>Expiry Date</label><input className="input" type="date" value={form.expiry_date} onChange={e => F('expiry_date', e.target.value)} /></div>
            <div className="form-group"><label>Controlled Drug?</label><select className="input" value={form.controlled} onChange={e => F('controlled', parseInt(e.target.value))}><option value={0}>No</option><option value={1}>Yes</option></select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Discrepancy</label><input className="input" value={form.discrepancy || ''} onChange={e => F('discrepancy', e.target.value)} placeholder="Leave blank if stock is correct" /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={save}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      {showForm && tab === 'prn' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', parseInt(e.target.value))}><option value="">Select...</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group"><label>Medication</label><input className="input" value={form.medication_name} onChange={e => F('medication_name', e.target.value)} /></div>
            <div className="form-group"><label>Dose</label><input className="input" value={form.dose} onChange={e => F('dose', e.target.value)} /></div>
            <div className="form-group"><label>Route</label><select className="input" value={form.route} onChange={e => F('route', e.target.value)}>{['Oral','Sublingual','Topical','Inhaled','IM','Other'].map(r => <option key={r}>{r}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Indication (when to give)</label><textarea className="input" rows={2} value={form.indication} onChange={e => F('indication', e.target.value)} placeholder="Specific criteria for when this PRN can be administered" /></div>
            <div className="form-group"><label>Max Dose in 24h</label><input className="input" value={form.max_dose_24h} onChange={e => F('max_dose_24h', e.target.value)} /></div>
            <div className="form-group"><label>Minimum Interval</label><input className="input" value={form.min_interval} onChange={e => F('min_interval', e.target.value)} placeholder="e.g. 4 hours" /></div>
            <div className="form-group"><label>Prescriber</label><input className="input" value={form.prescriber} onChange={e => F('prescriber', e.target.value)} /></div>
            <div className="form-group"><label>GP Authorisation Date</label><input className="input" type="date" value={form.gp_authorisation_date} onChange={e => F('gp_authorisation_date', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Special Instructions</label><textarea className="input" rows={2} value={form.special_instructions} onChange={e => F('special_instructions', e.target.value)} /></div>
            <div className="form-group"><label>Review Date</label><input className="input" type="date" value={form.review_date} onChange={e => F('review_date', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={save}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      {tab === 'stock' && <div className="card">
        <table className="data-table"><thead><tr><th>Child</th><th>Medication</th><th>Strength</th><th>Received</th><th>Current</th><th>Expiry</th><th>Controlled</th><th>Discrepancy</th></tr></thead>
          <tbody>{stock.map(r => { const exp = r.expiry_date && new Date(r.expiry_date) < new Date(); return (<tr key={r.id} style={exp ? { background: 'rgba(231,76,60,0.08)' } : {}}><td>{childName(r.child_id)}</td><td><strong>{r.medication_name}</strong></td><td>{r.strength || '—'}</td><td>{r.quantity_received}</td><td><strong>{r.quantity_current}</strong></td><td style={{ color: exp ? '#e74c3c' : 'inherit' }}>{r.expiry_date || '—'} {exp ? '⚠️' : ''}</td><td>{r.controlled ? '🔒 Yes' : 'No'}</td><td style={{ color: r.discrepancy ? '#e74c3c' : 'inherit' }}>{r.discrepancy || '✅'}</td></tr>)})}
          {stock.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">📦</div><p>No medication stock records</p></div></td></tr>}</tbody></table>
      </div>}
      {tab === 'prn' && <div className="card">
        <table className="data-table"><thead><tr><th>Child</th><th>Medication</th><th>Dose</th><th>Indication</th><th>Max 24h</th><th>Min Interval</th><th>Prescriber</th><th>Review</th></tr></thead>
          <tbody>{prn.map(r => (<tr key={r.id}><td>{childName(r.child_id)}</td><td><strong>{r.medication_name}</strong></td><td>{r.dose}</td><td style={{ fontSize: 11, maxWidth: 180 }}>{r.indication}</td><td>{r.max_dose_24h || '—'}</td><td>{r.min_interval || '—'}</td><td>{r.prescriber || '—'}</td><td>{r.review_date || '—'}</td></tr>))}
          {prn.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">💊</div><p>No PRN protocols</p></div></td></tr>}</tbody></table>
      </div>}
    </div>
  );
}
