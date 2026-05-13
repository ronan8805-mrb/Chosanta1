import { Router } from 'express';
import db from '../db.js';
import { logAudit } from '../index.js';
const router = Router();

router.get('/', (req, res) => {
  const { category, status } = req.query;
  let sql = `SELECT d.*, u.full_name as owner_name FROM documents d LEFT JOIN users u ON d.owner_id=u.id WHERE 1=1`;
  const p = [];
  if (category) { sql += ' AND d.category=?'; p.push(category); }
  if (status) { sql += ' AND d.status=?'; p.push(status); }
  sql += ' ORDER BY d.category, d.title';
  res.json(db.prepare(sql).all(...p));
});

router.post('/', (req, res) => {
  const d = req.body;
  const r = db.prepare(`INSERT INTO documents (title,category,status,owner_id,review_date,ref_code,hiqa_ref,notes) VALUES (?,?,?,?,?,?,?,?)`)
    .run(d.title,d.category,d.status||'Draft',req.user.id,d.review_date,d.ref_code,d.hiqa_ref,d.notes);
  logAudit(req.user.id,'CREATE','documents',r.lastInsertRowid,null,d);
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM documents WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const d = req.body;
  db.prepare(`UPDATE documents SET title=?,category=?,status=?,review_date=?,ref_code=?,hiqa_ref=?,notes=?,updated_at=datetime('now') WHERE id=?`)
    .run(d.title,d.category,d.status,d.review_date,d.ref_code,d.hiqa_ref,d.notes,req.params.id);
  logAudit(req.user.id,'UPDATE','documents',req.params.id,old,d);
  res.json({ ok: true });
});

export default router;
