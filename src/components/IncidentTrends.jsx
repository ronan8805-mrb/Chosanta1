import React, { useState, useEffect } from 'react';
import { api } from '../App';

export default function IncidentTrends() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState(90);
  useEffect(() => { api('/api/incidents').then(setData).catch(() => {}); }, []);

  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - period);
  const filtered = data.filter(r => new Date(r.date) >= cutoff);

  // Category breakdown
  const cats = {}; filtered.forEach(r => { cats[r.category] = (cats[r.category] || 0) + 1; });
  const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...Object.values(cats), 1);

  // Severity breakdown
  const sevs = { Minor: 0, Moderate: 0, Major: 0, Critical: 0 }; filtered.forEach(r => { if (sevs.hasOwnProperty(r.severity)) sevs[r.severity]++; });
  const maxSev = Math.max(...Object.values(sevs), 1);
  const sevColors = { Minor: '#27ae60', Moderate: '#f39c12', Major: '#e65100', Critical: '#e74c3c' };

  // Monthly trend
  const months = {}; filtered.forEach(r => { const m = r.date.slice(0, 7); months[m] = (months[m] || 0) + 1; });
  const sortedMonths = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonth = Math.max(...Object.values(months), 1);

  // Per-child frequency
  const childFreq = {}; filtered.forEach(r => { const n = r.child_name || 'Unknown'; childFreq[n] = (childFreq[n] || 0) + 1; });
  const sortedChildren = Object.entries(childFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxChild = Math.max(...sortedChildren.map(c => c[1]), 1);

  // Time-of-day
  const hours = Array(24).fill(0); filtered.forEach(r => { if (r.time) { const h = parseInt(r.time.split(':')[0]); if (!isNaN(h)) hours[h]++; } });
  const maxHour = Math.max(...hours, 1);

  // PIC review compliance
  const total = filtered.length;
  const reviewed = filtered.filter(r => r.pic_reviewed).length;
  const reviewRate = total > 0 ? Math.round((reviewed / total) * 100) : 100;

  const Bar = ({ label, value, max, color = '#c9a84c', suffix = '' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: '#9a9484', width: 130, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 18, background: 'rgba(201,168,76,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease', minWidth: value > 0 ? 4 : 0 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, width: 32, textAlign: 'right' }}>{value}{suffix}</span>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><h1 className="page-title">Incident Trend Analysis</h1><p style={{ color: '#9a9484', fontSize: 12 }}>HIQA Standard 3.3 · Pattern Recognition · Governance Intelligence</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[30, 90, 180, 365].map(d => <button key={d} className={`btn ${period === d ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => setPeriod(d)}>{d}d</button>)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 28, fontWeight: 700 }}>{filtered.length}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Total ({period}d)</div></div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 28, fontWeight: 700, color: sevColors.Critical }}>{sevs.Critical + sevs.Major}</div><div style={{ fontSize: 11, color: '#9a9484' }}>Major/Critical</div></div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 28, fontWeight: 700, color: reviewRate < 80 ? '#e74c3c' : '#27ae60' }}>{reviewRate}%</div><div style={{ fontSize: 11, color: '#9a9484' }}>PIC Review Rate</div></div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}><div style={{ fontSize: 28, fontWeight: 700 }}>{filtered.filter(r => r.sen_required).length}</div><div style={{ fontSize: 11, color: '#9a9484' }}>SENs Submitted</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12, color: '#c9a84c' }}>📊 By Category</h3>
          {sortedCats.length === 0 ? <p style={{ color: '#9a9484', fontSize: 12 }}>No data</p> : sortedCats.map(([cat, n]) => <Bar key={cat} label={cat} value={n} max={maxCat} />)}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12, color: '#c9a84c' }}>⚡ By Severity</h3>
          {Object.entries(sevs).map(([sev, n]) => <Bar key={sev} label={sev} value={n} max={maxSev} color={sevColors[sev]} />)}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12, color: '#c9a84c' }}>📅 Monthly Trend</h3>
          {sortedMonths.length === 0 ? <p style={{ color: '#9a9484', fontSize: 12 }}>No data</p> : sortedMonths.map(([m, n]) => <Bar key={m} label={m} value={n} max={maxMonth} color="#3498db" />)}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12, color: '#c9a84c' }}>👧 Per Child</h3>
          {sortedChildren.length === 0 ? <p style={{ color: '#9a9484', fontSize: 12 }}>No data</p> : sortedChildren.map(([name, n]) => <Bar key={name} label={name} value={n} max={maxChild} color="#8e44ad" />)}
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12, color: '#c9a84c' }}>🕐 Time of Day Heatmap</h3>
        <div style={{ display: 'flex', gap: 2, alignItems: 'end', height: 80 }}>
          {hours.map((n, h) => (
            <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: '100%', height: `${(n / maxHour) * 60}px`, background: n === 0 ? 'rgba(201,168,76,0.08)' : n <= 2 ? '#f39c12' : '#e74c3c', borderRadius: '3px 3px 0 0', transition: 'height 0.4s ease', minHeight: 2 }} />
              <span style={{ fontSize: 8, color: '#9a9484' }}>{h}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9a9484', marginTop: 4 }}>
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
        </div>
      </div>
    </div>
  );
}
