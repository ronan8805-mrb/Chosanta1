import { Router } from 'express';
import db from '../db.js';
import { logAudit } from '../index.js';
const router = Router();

router.get('/', (req, res) => {
  const { from, to, child_id } = req.query;
  let sql = `SELECT v.*, c.first_name||' '||c.last_name as child_name, u.full_name as auth_by FROM visitors v LEFT JOIN children c ON v.child_id=c.id LEFT JOIN users u ON v.authorised_by=u.id WHERE 1=1`;
  const p = [];
  if (from) { sql += ' AND v.date>=?'; p.push(from); }
  if (to) { sql += ' AND v.date<=?'; p.push(to); }
  if (child_id) { sql += ' AND v.child_id=?'; p.push(child_id); }
  sql += ' ORDER BY v.date DESC, v.time_in DESC LIMIT 200';
  res.json(db.prepare(sql).all(...p));
});

router.post('/', (req, res) => {
  const d = req.body;
  const r = db.prepare(`INSERT INTO visitors (date,visitor_name,organisation,purpose,child_id,time_in,time_out,supervised,authorised_by,refused,refusal_reason,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(d.date,d.visitor_name,d.organisation,d.purpose,d.child_id||null,d.time_in,d.time_out,d.supervised?1:0,d.authorised_by||req.user.id,d.refused?1:0,d.refusal_reason,req.user.id);
  logAudit(req.user.id,'CREATE','visitors',r.lastInsertRowid,null,d);
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM visitors WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const d = req.body;
  db.prepare(`UPDATE visitors SET date=?,visitor_name=?,organisation=?,purpose=?,child_id=?,time_in=?,time_out=?,supervised=?,authorised_by=?,refused=?,refusal_reason=? WHERE id=?`)
    .run(d.date,d.visitor_name,d.organisation,d.purpose,d.child_id||null,d.time_in,d.time_out,d.supervised?1:0,d.authorised_by,d.refused?1:0,d.refusal_reason,req.params.id);
  logAudit(req.user.id,'UPDATE','visitors',req.params.id,old,d);
  res.json({ ok: true });
});

export default router;
