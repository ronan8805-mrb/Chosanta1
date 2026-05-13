import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function PettyCashLog() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), description: '', child_id: '', amount: '', type: 'Expense', receipt: 0, authorised_by: '' });

  const load = () => { api('/api/logs/pettycash').then(setRecords).catch(() => {}); api('/api/children').then(setChildren).catch(() => {}); api('/api/users').then(setUsers).catch(() => {}); };
  useEffect(load, []);
  const F = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => { const d = { ...form, amount: parseFloat(form.amount) || 0 }; await api('/api/logs/pettycash', { method: 'POST', body: JSON.stringify(d) }); setShowForm(false); setForm({ ...form, description: '', amount: '' }); load(); };
  const userName = id => users.find(u => u.id === id)?.full_name || '—';
  const childName = id => { const c = children.find(c => c.id === id); return c ? `${c.first_name} ${c.last_name}` : 'Centre'; };

  const balance = records.reduce((sum, r) => r.type === 'Top-Up' ? sum + (r.amount || 0) : sum - (r.amount || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Petty Cash & Financial Log</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 7 · Financial Accountability</p></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #1b2d42, #0d1b2a)', padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)' }}>
            <span style={{ fontSize: 11, color: '#9a9484' }}>Balance: </span>
            <strong style={{ fontSize: 18, color: balance >= 0 ? '#c9a84c' : '#e74c3c' }}>€{balance.toFixed(2)}</strong>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Entry</button>
        </div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            <div className="form-group"><label>Type</label><select className="input" value={form.type} onChange={e => F('type', e.target.value)}>{['Expense','Top-Up'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Amount (€)</label><input className="input" type="number" step="0.01" value={form.amount} onChange={e => F('amount', e.target.value)} /></div>
            <div className="form-group"><label>For Child</label><select className="input" value={form.child_id} onChange={e => F('child_id', e.target.value ? parseInt(e.target.value) : '')}><option value="">Centre / General</option>{children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Description</label><input className="input" value={form.description} onChange={e => F('description', e.target.value)} placeholder="e.g. Cinema trip, Clothing, Food shopping" /></div>
            <div className="form-group"><label>Receipt?</label><select className="input" value={form.receipt} onChange={e => F('receipt', parseInt(e.target.value))}><option value={0}>No</option><option value={1}>Yes</option></select></div>
            <div className="form-group"><label>Authorised By</label><select className="input" value={form.authorised_by} onChange={e => F('authorised_by', parseInt(e.target.value))}><option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button className="btn btn-primary" onClick={submit}>Save</button><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      <div className="card">
        <table className="data-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>For</th><th>Amount</th><th>Receipt</th><th>Auth By</th></tr></thead>
          <tbody>{records.map(r => (<tr key={r.id}><td>{r.date}</td><td><span className={`badge badge-${r.type === 'Top-Up' ? 'active' : 'draft'}`}>{r.type}</span></td><td>{r.description}</td><td>{childName(r.child_id)}</td><td style={{ fontWeight: 700, color: r.type === 'Top-Up' ? '#27ae60' : '#e74c3c' }}>{r.type === 'Top-Up' ? '+' : '-'}€{(r.amount || 0).toFixed(2)}</td><td>{r.receipt ? '🧾' : '—'}</td><td>{userName(r.authorised_by)}</td></tr>))}
          {records.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">💰</div><p>No financial records yet</p></div></td></tr>}</tbody></table>
      </div>
    </div>
  );
}
