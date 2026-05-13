import { Router } from 'express';
import db from '../db.js';
import { requireLevel, logAudit } from '../index.js';

const router = Router();

// ── All documents + their active version ──────────────────────────────────
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT d.id, d.title, d.category, d.ref_code, d.hiqa_ref, d.review_date, d.file_path,
           pv.id as version_id, pv.version, pv.status as version_status,
           pv.change_summary, pv.effective_date, pv.board_approval_date,
           pv.created_at as version_created,
           cu.full_name as changed_by_name,
           au.full_name as approved_by_name
    FROM documents d
    LEFT JOIN policy_versions pv ON pv.document_id = d.id AND pv.is_active = 1
    LEFT JOIN users cu ON pv.changed_by = cu.id
    LEFT JOIN users au ON pv.board_approved_by = au.id
    WHERE d.status != 'Archived'
    ORDER BY d.category, d.title
  `).all();
  res.json(rows);
});

// ── Pending review queue (any non-active, non-archived version) ────────────
router.get('/pending', requireLevel(3), (req, res) => {
  const rows = db.prepare(`
    SELECT pv.*, d.title, d.ref_code, d.category,
           cu.full_name as changed_by_name,
           ru.full_name as reviewed_by_name
    FROM policy_versions pv
    JOIN documents d ON pv.document_id = d.id
    LEFT JOIN users cu ON pv.changed_by = cu.id
    LEFT JOIN users ru ON pv.reviewed_by = ru.id
    WHERE pv.status IN ('Draft','Under Review','Reviewed','Board Approved')
    ORDER BY pv.created_at DESC
  `).all();
  res.json(rows);
});

// ── Version history for one document ──────────────────────────────────────
router.get('/:docId/history', (req, res) => {
  const rows = db.prepare(`
    SELECT pv.*,
           cu.full_name as changed_by_name,
           ru.full_name as reviewed_by_name,
           au.full_name as board_approved_by_name
    FROM policy_versions pv
    LEFT JOIN users cu ON pv.changed_by = cu.id
    LEFT JOIN users ru ON pv.reviewed_by = ru.id
    LEFT JOIN users au ON pv.board_approved_by = au.id
    WHERE pv.document_id = ?
    ORDER BY pv.version DESC
  `).all(req.params.docId);
  res.json(rows);
});

// ── Create new draft version ───────────────────────────────────────────────
router.post('/:docId', requireLevel(3), (req, res) => {
  const docId = parseInt(req.params.docId);
  const doc = db.prepare('SELECT * FROM documents WHERE id=?').get(docId);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  // Block if a non-archived draft already exists
  const inFlight = db.prepare(`SELECT id FROM policy_versions WHERE document_id=? AND status NOT IN ('Active','Archived')`).get(docId);
  if (inFlight) return res.status(409).json({ error: 'A version is already in progress for this document. Complete or archive it first.' });

  const latest = db.prepare('SELECT MAX(version) as v FROM policy_versions WHERE document_id=?').get(docId);
  const nextVer = (latest?.v || 0) + 1;
  const { change_summary, effective_date } = req.body;

  const r = db.prepare(`INSERT INTO policy_versions
    (document_id,version,change_summary,changed_by,effective_date,status,is_active)
    VALUES (?,?,?,?,?,'Draft',0)`)
    .run(docId, nextVer, change_summary || null, req.user.id, effective_date || null);

  logAudit(req.user.id, 'CREATE_POLICY_DRAFT', 'policy_versions', r.lastInsertRowid, null, { docId, version: nextVer });
  res.json({ id: r.lastInsertRowid, version: nextVer });
});

// ── Submit for review (Draft → Under Review) ──────────────────────────────
router.post('/version/:id/submit', requireLevel(2), (req, res) => {
  const pv = db.prepare('SELECT * FROM policy_versions WHERE id=?').get(req.params.id);
  if (!pv) return res.status(404).json({ error: 'Not found' });
  if (pv.status !== 'Draft') return res.status(400).json({ error: 'Only Draft versions can be submitted' });
  db.prepare("UPDATE policy_versions SET status='Under Review' WHERE id=?").run(req.params.id);
  logAudit(req.user.id, 'SUBMIT_POLICY_FOR_REVIEW', 'policy_versions', req.params.id, { status: 'Draft' }, { status: 'Under Review' });
  res.json({ ok: true });
});

// ── Compliance review (Under Review → Reviewed) ───────────────────────────
router.post('/version/:id/review', requireLevel(4), (req, res) => {
  const pv = db.prepare('SELECT * FROM policy_versions WHERE id=?').get(req.params.id);
  if (!pv) return res.status(404).json({ error: 'Not found' });
  if (pv.status !== 'Under Review') return res.status(400).json({ error: 'Version must be Under Review' });
  const { review_notes } = req.body;
  db.prepare("UPDATE policy_versions SET status='Reviewed',reviewed_by=?,review_date=datetime('now'),review_notes=? WHERE id=?")
    .run(req.user.id, review_notes || null, req.params.id);
  logAudit(req.user.id, 'REVIEW_POLICY_VERSION', 'policy_versions', req.params.id, { status: 'Under Review' }, { status: 'Reviewed' });
  res.json({ ok: true });
});

// ── Board approval (Reviewed → Board Approved) ────────────────────────────
router.post('/version/:id/approve', requireLevel(5), (req, res) => {
  const pv = db.prepare('SELECT * FROM policy_versions WHERE id=?').get(req.params.id);
  if (!pv) return res.status(404).json({ error: 'Not found' });
  if (pv.status !== 'Reviewed') return res.status(400).json({ error: 'Version must be Reviewed before Board approval' });
  const { board_notes } = req.body;
  db.prepare("UPDATE policy_versions SET status='Board Approved',board_approved_by=?,board_approval_date=datetime('now'),board_notes=? WHERE id=?")
    .run(req.user.id, board_notes || null, req.params.id);
  logAudit(req.user.id, 'BOARD_APPROVE_POLICY', 'policy_versions', req.params.id, { status: 'Reviewed' }, { status: 'Board Approved', approver: req.user.id });
  res.json({ ok: true });
});

// ── Activate version → sets as Active, archives previous ─────────────────
router.post('/version/:id/activate', requireLevel(4), (req, res) => {
  const pv = db.prepare('SELECT * FROM policy_versions WHERE id=?').get(req.params.id);
  if (!pv) return res.status(404).json({ error: 'Not found' });
  if (!['Board Approved', 'Reviewed'].includes(pv.status)) return res.status(400).json({ error: 'Version must be Board Approved or Reviewed to activate' });

  // Archive any currently active version for this doc
  db.prepare(`UPDATE policy_versions SET is_active=0, status='Archived' WHERE document_id=? AND is_active=1`)
    .run(pv.document_id);

  // Activate this version
  db.prepare(`UPDATE policy_versions SET is_active=1, status='Active', effective_date=COALESCE(effective_date, date('now')) WHERE id=?`)
    .run(req.params.id);

  logAudit(req.user.id, 'ACTIVATE_POLICY_VERSION', 'policy_versions', req.params.id, { status: pv.status }, { status: 'Active', is_active: 1 });
  res.json({ ok: true });
});

// ── Archive a version (no hard delete) ───────────────────────────────────
router.post('/version/:id/archive', requireLevel(3), (req, res) => {
  const pv = db.prepare('SELECT * FROM policy_versions WHERE id=?').get(req.params.id);
  if (!pv) return res.status(404).json({ error: 'Not found' });
  if (pv.is_active) return res.status(400).json({ error: 'Cannot archive the active version' });
  db.prepare("UPDATE policy_versions SET status='Archived' WHERE id=?").run(req.params.id);
  logAudit(req.user.id, 'ARCHIVE_POLICY_VERSION', 'policy_versions', req.params.id, { status: pv.status }, { status: 'Archived' });
  res.json({ ok: true });
});

export default router;
