import { Router } from 'express';
import db from '../db.js';
import { logAudit } from '../index.js';
const router = Router();

router.get('/', (req, res) => {
  const { from, to, shift_type } = req.query;
  let sql = `SELECT h.*, u.full_name as leader_name FROM handovers h LEFT JOIN users u ON h.shift_leader_id=u.id WHERE 1=1`;
  const p = [];
  if (from) { sql += ' AND h.date>=?'; p.push(from); }
  if (to) { sql += ' AND h.date<=?'; p.push(to); }
  if (shift_type) { sql += ' AND h.shift_type=?'; p.push(shift_type); }
  sql += ' ORDER BY h.date DESC LIMIT 100';
  res.json(db.prepare(sql).all(...p));
});

router.post('/', (req, res) => {
  const d = req.body;
  const r = db.prepare(`INSERT INTO handovers (date,shift_type,shift_leader_id,staff_on_duty,children_present,incidents_summary,medication_notes,safeguarding_notes,visitors,tasks_outstanding,fire_panel_ok,petty_cash,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(d.date,d.shift_type,d.shift_leader_id||req.user.id,d.staff_on_duty,d.children_present,d.incidents_summary,d.medication_notes,d.safeguarding_notes,d.visitors,d.tasks_outstanding,d.fire_panel_ok?1:0,d.petty_cash,req.user.id);
  logAudit(req.user.id,'CREATE','handovers',r.lastInsertRowid,null,d);
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM handovers WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const d = req.body;
  db.prepare(`UPDATE handovers SET date=?,shift_type=?,shift_leader_id=?,staff_on_duty=?,children_present=?,incidents_summary=?,medication_notes=?,safeguarding_notes=?,visitors=?,tasks_outstanding=?,fire_panel_ok=?,petty_cash=? WHERE id=?`)
    .run(d.date,d.shift_type,d.shift_leader_id,d.staff_on_duty,d.children_present,d.incidents_summary,d.medication_notes,d.safeguarding_notes,d.visitors,d.tasks_outstanding,d.fire_panel_ok?1:0,d.petty_cash,req.params.id);
  logAudit(req.user.id,'UPDATE','handovers',req.params.id,old,d);
  res.json({ ok: true });
});

export default router;
