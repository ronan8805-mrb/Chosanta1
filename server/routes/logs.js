import { Router } from 'express';
import db from '../db.js';
import { logAudit } from '../index.js';
const router = Router();

// ── C2 FIX: Role-Based Access Control per log type ─────────────────────
// minRead: minimum role level to READ records
// minWrite: minimum role level to CREATE/UPDATE records
// required: C3 FIX — mandatory fields for POST validation
const TABLES = {
  // Level 1 (Staff) — operational daily logs
  attendance:       { table: 'staff_attendance', orderBy: 'date DESC', minRead: 1, minWrite: 1, required: ['date','staff_id'] },
  dailylog:         { table: 'daily_log', orderBy: 'date DESC', minRead: 1, minWrite: 1, required: ['date','narrative'] },
  handovers:        { table: 'handovers', orderBy: 'date DESC', minRead: 1, minWrite: 1, required: ['date','shift_type'] },
  visitors:         { table: 'visitors', orderBy: 'date DESC', minRead: 1, minWrite: 1, required: ['date','visitor_name'] },
  compliments:      { table: 'compliments', orderBy: 'date DESC', minRead: 1, minWrite: 1, required: ['date'] },
  roster:           { table: 'staff_roster', orderBy: 'week_commencing DESC', minRead: 1, minWrite: 2, required: ['week_commencing','staff_id'] },
  pettycash:        { table: 'petty_cash', orderBy: 'date DESC', minRead: 1, minWrite: 1, required: ['date','description','amount'] },
  educontacts:      { table: 'education_contacts', orderBy: 'id DESC', minRead: 1, minWrite: 1, required: ['child_id','school'] },

  // Level 2 (Team Lead) — child-facing sensitive logs
  mar:              { table: 'mar_records', orderBy: 'date DESC, time DESC', minRead: 1, minWrite: 1, required: ['child_id','date','medication_name','dose'] },
  roomsearch:       { table: 'room_searches', orderBy: 'date DESC', minRead: 2, minWrite: 2, required: ['date','child_id','reason'] },
  sanctions:        { table: 'sanctions', orderBy: 'date DESC', minRead: 2, minWrite: 2, required: ['date','child_id'] },
  keyworking:       { table: 'keyworking_sessions', orderBy: 'date DESC', minRead: 1, minWrite: 1, required: ['date','child_id','keyworker_id'] },
  careplans:        { table: 'care_plans', orderBy: 'date DESC', minRead: 1, minWrite: 2, required: ['date','child_id'] },
  childrisk:        { table: 'child_risk_assessments', orderBy: 'date DESC', minRead: 2, minWrite: 2, required: ['date','child_id','risk_area','risk_description'] },
  peeps:            { table: 'peeps', orderBy: 'date DESC', minRead: 1, minWrite: 2, required: ['date','child_id','evacuation_method'] },
  childregister:    { table: 'children_register', orderBy: 'id DESC', minRead: 2, minWrite: 3, required: ['child_id'] },
  missingchronology:{ table: 'missing_chronology', orderBy: 'date DESC', minRead: 2, minWrite: 2, required: ['date','child_id'] },

  // Level 3 (PIC) — governance and safeguarding logs
  sen:              { table: 'sen_register', orderBy: 'date DESC', minRead: 3, minWrite: 2, required: ['date','child_id','category','description'] },
  complaints:       { table: 'complaints', orderBy: 'date_received DESC', minRead: 3, minWrite: 2, required: ['date_received','description'] },
  supervision:      { table: 'supervision_records', orderBy: 'date DESC', minRead: 1, minWrite: 2, required: ['date','staff_id','supervisor_id'] },
  hsinspections:    { table: 'hs_inspections', orderBy: 'date DESC', minRead: 2, minWrite: 2, required: ['date'] },
  medaudits:        { table: 'medication_audits', orderBy: 'date DESC', minRead: 3, minWrite: 3, required: ['date'] },
  maintenance:      { table: 'maintenance_records', orderBy: 'date_reported DESC', minRead: 1, minWrite: 1, required: ['date_reported','description'] },
  training:         { table: 'training_records', orderBy: 'date_completed DESC', minRead: 1, minWrite: 2, required: ['staff_id','training_title'] },
  houserisk:        { table: 'house_risk_assessments', orderBy: 'date DESC', minRead: 2, minWrite: 2, required: ['date','area','hazard'] },
  fireequipment:    { table: 'fire_equipment', orderBy: 'next_service ASC', minRead: 1, minWrite: 3, required: ['equipment_type','location'] },
  qip:              { table: 'qip', orderBy: 'date DESC', minRead: 3, minWrite: 3, required: ['date','finding','action'] },

  // Level 4/5 (Compliance/Director) — HR and governance restricted
  governance:       { table: 'governance_minutes', orderBy: 'date DESC', minRead: 3, minWrite: 3, required: ['date'] },
  compliancereview: { table: 'compliance_reviews', orderBy: 'date DESC', minRead: 3, minWrite: 3, required: ['date','standard'] },
  riskregister:     { table: 'risk_register', orderBy: 'id DESC', minRead: 3, minWrite: 3, required: ['description'] },
  induction:        { table: 'staff_induction', orderBy: 'start_date DESC', minRead: 1, minWrite: 3, required: ['staff_id','start_date'] },
  appraisals:       { table: 'staff_appraisals', orderBy: 'date DESC', minRead: 4, minWrite: 4, required: ['staff_id','date','appraiser_id'] },

  // High-risk governance modules
  restrictive:      { table: 'restrictive_practices', orderBy: 'date DESC', minRead: 1, minWrite: 2, required: ['date','child_id','type','description'] },
  safeguarding:     { table: 'safeguarding_referrals', orderBy: 'date DESC', minRead: 3, minWrite: 2, required: ['date','child_id','concern_type'] },
  participation:    { table: 'child_participation', orderBy: 'date DESC', minRead: 1, minWrite: 1, required: ['date','type'] },
  absenceplans:     { table: 'absence_plans', orderBy: 'date DESC', minRead: 2, minWrite: 2, required: ['date','child_id','triggers'] },
  medstock:         { table: 'medication_stock', orderBy: 'date_received DESC', minRead: 1, minWrite: 2, required: ['child_id','medication_name'] },
  prnprotocols:     { table: 'prn_protocols', orderBy: 'id DESC', minRead: 2, minWrite: 3, required: ['child_id','medication_name','indication'] },
  nightchecks:      { table: 'night_checks', orderBy: 'date DESC, time DESC', minRead: 1, minWrite: 1, required: ['date','time','child_id'] },
  policyversions:   { table: 'policy_versions', orderBy: 'created_at DESC', minRead: 3, minWrite: 3, required: ['document_id','version','change_summary'] },
  signatures:       { table: 'digital_signatures', orderBy: 'signed_at DESC', minRead: 3, minWrite: 1, required: ['record_type','record_id'] },
  govactions:       { table: 'governance_actions', orderBy: 'date DESC', minRead: 3, minWrite: 3, required: ['date','action'] },
};

// ── Column whitelist — prevent SQL injection via dynamic column names ──
const COLUMN_CACHE = {};
function getTableColumns(tableName) {
  if (COLUMN_CACHE[tableName]) return COLUMN_CACHE[tableName];
  const cols = db.prepare(`PRAGMA table_info(${tableName})`).all().map(r => r.name);
  COLUMN_CACHE[tableName] = new Set(cols);
  return COLUMN_CACHE[tableName];
}

// ── GET — Read (with role check) ───────────────────────────────────────
router.get('/:type', (req, res) => {
  const cfg = TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown log type' });
  // C2: Role check for reading
  if (req.user.role_level < cfg.minRead) return res.status(403).json({ error: `Access restricted — requires ${cfg.minRead === 2 ? 'Team Lead' : cfg.minRead === 3 ? 'PIC' : 'Director'} level` });
  const rows = db.prepare(`SELECT * FROM ${cfg.table} ORDER BY ${cfg.orderBy}`).all();
  res.json(rows);
});

// ── POST — Create (with role check + validation) ──────────────────────
router.post('/:type', (req, res) => {
  const cfg = TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown log type' });
  // C2: Role check for writing
  if (req.user.role_level < cfg.minWrite) return res.status(403).json({ error: `Write access restricted — requires ${cfg.minWrite === 2 ? 'Team Lead' : cfg.minWrite === 3 ? 'PIC' : 'Director'} level` });

  const d = req.body;

  // C3: Mandatory field validation
  if (cfg.required && cfg.required.length > 0) {
    const missing = cfg.required.filter(f => {
      const v = d[f];
      return v === undefined || v === null || v === '' || (typeof v === 'string' && v.trim() === '');
    });
    if (missing.length > 0) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  // Column whitelist — strip any keys not in the actual table schema
  const validCols = getTableColumns(cfg.table);
  const cols = Object.keys(d).filter(k => validCols.has(k) && k !== 'id' && k !== 'created_at');
  cols.push('created_by');
  const vals = cols.slice(0, -1).map(k => d[k]);
  vals.push(req.user.id);
  const placeholders = cols.map(() => '?').join(',');
  try {
    const r = db.prepare(`INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${placeholders})`).run(...vals);
    logAudit(req.user.id, 'CREATE', cfg.table, r.lastInsertRowid, null, d);
    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── PUT — Update (with role check + timestamp enforcement) ────────────
router.put('/:type/:id', (req, res) => {
  const cfg = TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown log type' });
  // C2: Role check for writing
  if (req.user.role_level < cfg.minWrite) return res.status(403).json({ error: 'Write access restricted' });

  const old = db.prepare(`SELECT * FROM ${cfg.table} WHERE id=?`).get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });

  // ── HIQA: Prevent editing archived records ─────────────────────────
  if (old.status === 'Archived') return res.status(403).json({ error: 'Archived records cannot be modified (S.I. 674/2017 record retention)' });

  const d = req.body;
  // Column whitelist
  const validCols = getTableColumns(cfg.table);
  const safePairs = Object.entries(d).filter(([k]) => validCols.has(k) && k !== 'id' && k !== 'created_at' && k !== 'created_by');
  if (safePairs.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  // ── TIMESTAMP HARDENING: Always set updated_at + updated_by ────────
  let sets = safePairs.map(([k]) => `${k}=?`).join(',');
  let vals = [...safePairs.map(([, v]) => v)];
  if (validCols.has('updated_at')) { sets += ",updated_at=datetime('now')"; }
  if (validCols.has('updated_by')) { sets += ',updated_by=?'; vals.push(req.user.id); }
  vals.push(req.params.id);
  db.prepare(`UPDATE ${cfg.table} SET ${sets} WHERE id=?`).run(...vals);
  logAudit(req.user.id, 'UPDATE', cfg.table, req.params.id, old, d);
  res.json({ ok: true });
});

export default router;
