import { Router } from 'express';
import db from '../db.js';
const router = Router();

router.get('/', (req, res) => {
  res.json(db.prepare(`SELECT c.*, u.full_name as keyworker_name FROM children c LEFT JOIN users u ON c.keyworker_id=u.id ORDER BY c.status DESC, c.last_name`).all());
});

router.get('/:id', (req, res) => {
  const child = db.prepare(`SELECT c.*, u.full_name as keyworker_name FROM children c LEFT JOIN users u ON c.keyworker_id=u.id WHERE c.id=?`).get(req.params.id);
  if (!child) return res.status(404).json({ error: 'Not found' });
  res.json(child);
});

export default router;
