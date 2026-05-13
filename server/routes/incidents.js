import { Router } from 'express';
import db from '../db.js';
import { logAudit } from '../index.js';
const router = Router();

router.get('/', (req, res) => {
  const { status, category, child_id, from, to } = req.query;
  // C1 FIX: Never show archived records in normal queries
  let sql = `SELECT i.*, c.ref_code, c.first_name||' '||c.last_name as child_name, u.full_name as reporter FROM incidents i LEFT JOIN children c ON i.child_id=c.id LEFT JOIN users u ON i.created_by=u.id WHERE i.status != 'Archived'`;
  const params = [];
  if (status) { sql += ' AND i.status=?'; params.push(status); }
  if (category) { sql += ' AND i.category=?'; params.push(category); }
  if (child_id) { sql += ' AND i.child_id=?'; params.push(child_id); }
  if (from) { sql += ' AND i.date>=?'; params.push(from); }
  if (to) { sql += ' AND i.date<=?'; params.push(to); }
  sql += ' ORDER BY i.date DESC, i.time DESC LIMIT 200';
  res.json(db.prepare(sql).all(...params));
});

// C3 FIX: Mandatory field validation
router.post('/', (req, res) => {
  const d = req.body;
  const errors = [];
  if (!d.date) errors.push('Date is required');
  if (!d.category) errors.push('Category is required');
  if (!d.description || d.description.trim().length < 10) errors.push('Description must be at least 10 characters');
  if (!d.severity) errors.push('Severity is required');
  if (errors.length > 0) return res.status(400).json({ error: errors.join('; ') });

  const r = db.prepare(`INSERT INTO incidents (date,time,category,severity,description,child_id,staff_id,location,immediate_action,injuries,sen_required,nims_ref,status,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(d.date,d.time,d.category,d.severity,d.description,d.child_id||null,d.staff_id||null,d.location,d.immediate_action,d.injuries,d.sen_required?1:0,d.nims_ref,'Open',req.user.id);
  logAudit(req.user.id,'CREATE','incidents',r.lastInsertRowid,null,d);
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM incidents WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  // C1 FIX: Cannot modify archived records
  if (old.status === 'Archived') return res.status(403).json({ error: 'Archived records cannot be modified (S.I. 674/2017 record retention)' });
  const d = req.body;
  db.prepare(`UPDATE incidents SET date=?,time=?,category=?,severity=?,description=?,child_id=?,location=?,immediate_action=?,injuries=?,sen_required=?,nims_ref=?,status=?,outcome=?,learning=?,pic_reviewed=?,pic_review_date=? WHERE id=?`)
    .run(d.date,d.time,d.category,d.severity,d.description,d.child_id||null,d.location,d.immediate_action,d.injuries,d.sen_required?1:0,d.nims_ref,d.status,d.outcome,d.learning,d.pic_reviewed?1:0,d.pic_review_date,req.params.id);
  logAudit(req.user.id,'UPDATE','incidents',req.params.id,old,d);
  res.json({ ok: true });
});

// C1 FIX: Replace hard-delete with soft-delete (archive)
// Records are NEVER destroyed — S.I. 674/2017 requires retention until child is 25
router.delete('/:id', (req, res) => {
  if (req.user.role_level < 4) return res.status(403).json({ error: 'Director/Compliance Officer only — records cannot be deleted, only archived' });
  const old = db.prepare('SELECT * FROM incidents WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  // Soft-delete: set status to Archived with metadata
  db.prepare('UPDATE incidents SET status=?, outcome=COALESCE(outcome,\'\')||? WHERE id=?')
    .run('Archived', `\n[ARCHIVED by ${req.user.full_name} on ${new Date().toISOString().slice(0,10)}]`, req.params.id);
  logAudit(req.user.id, 'ARCHIVE', 'incidents', req.params.id, old, { status: 'Archived', archived_by: req.user.id });
  res.json({ ok: true, message: 'Record archived (not deleted — retained per S.I. 674/2017)' });
});

export default router;
