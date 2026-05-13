import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { requireLevel, logAudit } from '../index.js';

const router = Router();

// ── Helper ──────────────────────────────────────────────────────────────────
const audit = (req, action, table, id, oldVal, newVal, reason) => {
  const entry = reason ? { ...newVal, _reason: reason } : newVal;
  logAudit(req.user.id, action, table, id, oldVal, entry);
};

// ── SITES ───────────────────────────────────────────────────────────────────
router.get('/sites', (req, res) => {
  res.json(db.prepare('SELECT * FROM sites ORDER BY name').all());
});

router.post('/sites', requireLevel(4), (req, res) => {
  const { name, address, manager_id, tusla_reg, capacity } = req.body;
  if (!name) return res.status(400).json({ error: 'Site name required' });
  const r = db.prepare('INSERT INTO sites (name,address,manager_id,tusla_reg,capacity) VALUES (?,?,?,?,?)').run(name, address || null, manager_id || null, tusla_reg || null, capacity || null);
  audit(req, 'CREATE_SITE', 'sites', r.lastInsertRowid, null, req.body);
  res.json({ id: r.lastInsertRowid });
});

router.put('/sites/:id', requireLevel(4), (req, res) => {
  const old = db.prepare('SELECT * FROM sites WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const { name, address, manager_id, tusla_reg, capacity, active } = req.body;
  db.prepare('UPDATE sites SET name=?,address=?,manager_id=?,tusla_reg=?,capacity=?,active=? WHERE id=?')
    .run(name ?? old.name, address ?? old.address, manager_id ?? old.manager_id, tusla_reg ?? old.tusla_reg, capacity ?? old.capacity, active ?? old.active, req.params.id);
  audit(req, 'UPDATE_SITE', 'sites', req.params.id, old, req.body);
  res.json({ ok: true });
});

// ── USERS ───────────────────────────────────────────────────────────────────
router.get('/users', (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.email, u.full_name, u.active, u.last_login, u.created_at,
           u.role_id, r.name as role_name, r.level as role_level,
           p.job_title, p.site_id, p.supervisor_id, p.garda_vetting_expiry,
           p.force_password_change, p.phone, p.notes as profile_notes,
           s.name as site_name,
           sup.full_name as supervisor_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN user_profiles p ON u.id = p.user_id
    LEFT JOIN sites s ON p.site_id = s.id
    LEFT JOIN users sup ON p.supervisor_id = sup.id
    ORDER BY r.level DESC, u.full_name
  `).all();
  res.json(rows);
});

router.post('/users', requireLevel(5), (req, res) => {
  const { email, full_name, role_id, job_title, site_id, supervisor_id, phone, garda_vetting_expiry, notes, password } = req.body;
  if (!email || !full_name) return res.status(400).json({ error: 'Email and name required' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const hash = bcrypt.hashSync(password, 10);
  let uid;
  try {
    const r = db.prepare('INSERT INTO users (email,password_hash,full_name,role_id) VALUES (?,?,?,?)').run(email, hash, full_name, role_id || 1);
    uid = r.lastInsertRowid;
  } catch (e) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  db.prepare(`INSERT OR REPLACE INTO user_profiles (user_id,job_title,site_id,supervisor_id,phone,garda_vetting_expiry,notes,force_password_change)
    VALUES (?,?,?,?,?,?,?,0)`)
    .run(uid, job_title || null, site_id || null, supervisor_id || null, phone || null, garda_vetting_expiry || null, notes || null);
  audit(req, 'CREATE_USER', 'users', uid, null, { email, full_name, role_id, job_title, site_id });
  res.json({ id: uid });
});

router.put('/users/:id', requireLevel(4), (req, res) => {
  const id = parseInt(req.params.id);
  const old = db.prepare('SELECT u.*, r.level as role_level FROM users u JOIN roles r ON u.role_id=r.id WHERE u.id=?').get(id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  // Level 4 cannot edit Level 5
  if (old.role_level >= 5 && req.user.role_level < 5) return res.status(403).json({ error: 'Cannot modify Director accounts' });
  const { full_name, email, role_id, active, job_title, site_id, supervisor_id, phone, garda_vetting_expiry, notes, reason, password } = req.body;
  // Update core user fields
  db.prepare('UPDATE users SET full_name=?,email=?,role_id=?,active=? WHERE id=?')
    .run(full_name ?? old.full_name, email ?? old.email, role_id ?? old.role_id, active !== undefined ? active : old.active, id);
  // Update password if provided
  if (password && password.length >= 8) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, id);
  }
  db.prepare(`INSERT OR REPLACE INTO user_profiles (user_id,job_title,site_id,supervisor_id,phone,garda_vetting_expiry,notes)
    VALUES (?,?,?,?,?,?,?)`)
    .run(id, job_title ?? null, site_id ?? null, supervisor_id ?? null, phone ?? null, garda_vetting_expiry ?? null, notes ?? null);
  audit(req, 'UPDATE_USER', 'users', id, { full_name: old.full_name, role_id: old.role_id, active: old.active }, req.body, reason);
  res.json({ ok: true });
});

router.post('/users/:id/deactivate', requireLevel(4), (req, res) => {
  const id = parseInt(req.params.id);
  const old = db.prepare('SELECT * FROM users WHERE id=?').get(id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE users SET active=0 WHERE id=?').run(id);
  // Kill all sessions by rotating a flag — simplistic approach via audit
  audit(req, 'DEACTIVATE_USER', 'users', id, { active: 1 }, { active: 0 }, req.body.reason);
  res.json({ ok: true });
});

router.post('/users/:id/activate', requireLevel(4), (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('UPDATE users SET active=1 WHERE id=?').run(id);
  audit(req, 'ACTIVATE_USER', 'users', id, { active: 0 }, { active: 1 }, req.body.reason);
  res.json({ ok: true });
});

router.post('/users/:id/reset-password', requireLevel(4), (req, res) => {
  const id = parseInt(req.params.id);
  const tempPass = 'Chosanta' + Math.random().toString(36).slice(2, 8).toUpperCase() + '!';
  const hash = bcrypt.hashSync(tempPass, 10);
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, id);
  db.prepare('INSERT OR REPLACE INTO user_profiles (user_id, force_password_change) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET force_password_change=1').run(id);
  audit(req, 'RESET_PASSWORD', 'users', id, null, { forced: true }, req.body.reason);
  res.json({ temp_password: tempPass });
});

router.post('/users/:id/revoke', requireLevel(5), (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('UPDATE users SET active=0 WHERE id=?').run(id);
  audit(req, 'REVOKE_ACCESS', 'users', id, null, { active: 0 }, req.body.reason);
  res.json({ ok: true });
});

router.get('/users/:id/history', requireLevel(3), (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, u.full_name as actor_name
    FROM audit_trail a LEFT JOIN users u ON a.user_id=u.id
    WHERE a.record_id=? AND a.table_name='users'
    ORDER BY a.timestamp DESC
  `).all(req.params.id);
  res.json(rows);
});

router.get('/users/:id/compliance', requireLevel(3), (req, res) => {
  const id = parseInt(req.params.id);
  const training = db.prepare('SELECT * FROM training_records WHERE staff_id=? ORDER BY date_completed DESC').all(id);
  const supervision = db.prepare('SELECT * FROM supervision_records WHERE staff_id=? ORDER BY date DESC LIMIT 5').all(id);
  const induction = db.prepare('SELECT * FROM staff_induction WHERE staff_id=?').get(id);
  const appraisals = db.prepare('SELECT * FROM staff_appraisals WHERE staff_id=? ORDER BY date DESC LIMIT 3').all(id);
  res.json({ training, supervision, induction, appraisals });
});

// ── ROLES ───────────────────────────────────────────────────────────────────
router.get('/roles', (req, res) => {
  res.json(db.prepare('SELECT * FROM roles ORDER BY level').all());
});

// ── RECURRING TASKS ─────────────────────────────────────────────────────────
router.get('/recurring', (req, res) => {
  const level = req.user.role_level;
  const site = req.query.site_id;
  let sql = `
    SELECT rt.*, s.name as site_name,
           u.full_name as assigned_user_name,
           r.name as assigned_role_name,
           creator.full_name as created_by_name
    FROM recurring_tasks rt
    LEFT JOIN sites s ON rt.site_id = s.id
    LEFT JOIN users u ON rt.assigned_user_id = u.id
    LEFT JOIN roles r ON rt.assigned_role_id = r.id
    LEFT JOIN users creator ON rt.created_by = creator.id
    WHERE rt.archived = 0
  `;
  const params = [];
  if (level < 4 && site) { sql += ' AND rt.site_id = ?'; params.push(site); }
  sql += ' ORDER BY rt.due_date ASC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/recurring', requireLevel(3), (req, res) => {
  const { task_name, category, assigned_user_id, assigned_role_id, site_id, frequency, due_date,
    reminder_days, escalation_route, evidence_required, notes } = req.body;
  if (!task_name || !frequency) return res.status(400).json({ error: 'Task name and frequency required' });
  const r = db.prepare(`INSERT INTO recurring_tasks
    (task_name,category,assigned_user_id,assigned_role_id,site_id,frequency,due_date,reminder_days,escalation_route,evidence_required,notes,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(task_name, category || 'General', assigned_user_id || null, assigned_role_id || null, site_id || null,
      frequency, due_date || null, reminder_days || 7, escalation_route || null, evidence_required || 0, notes || null, req.user.id);
  audit(req, 'CREATE_RECURRING_TASK', 'recurring_tasks', r.lastInsertRowid, null, req.body);
  // Generate first instance
  _generateNextInstance(r.lastInsertRowid);
  res.json({ id: r.lastInsertRowid });
});

router.put('/recurring/:id', requireLevel(3), (req, res) => {
  const old = db.prepare('SELECT * FROM recurring_tasks WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const { task_name, category, assigned_user_id, assigned_role_id, site_id, frequency, due_date,
    reminder_days, escalation_route, evidence_required, notes, reason } = req.body;
  db.prepare(`UPDATE recurring_tasks SET task_name=?,category=?,assigned_user_id=?,assigned_role_id=?,site_id=?,
    frequency=?,due_date=?,reminder_days=?,escalation_route=?,evidence_required=?,notes=? WHERE id=?`)
    .run(task_name ?? old.task_name, category ?? old.category, assigned_user_id ?? old.assigned_user_id,
      assigned_role_id ?? old.assigned_role_id, site_id ?? old.site_id, frequency ?? old.frequency,
      due_date ?? old.due_date, reminder_days ?? old.reminder_days, escalation_route ?? old.escalation_route,
      evidence_required ?? old.evidence_required, notes ?? old.notes, req.params.id);
  audit(req, 'UPDATE_RECURRING_TASK', 'recurring_tasks', req.params.id, old, req.body, reason);
  res.json({ ok: true });
});

router.post('/recurring/:id/archive', requireLevel(3), (req, res) => {
  const old = db.prepare('SELECT * FROM recurring_tasks WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE recurring_tasks SET archived=1 WHERE id=?').run(req.params.id);
  audit(req, 'ARCHIVE_RECURRING_TASK', 'recurring_tasks', req.params.id, old, { archived: 1 }, req.body.reason);
  res.json({ ok: true });
});

// ── TASK INSTANCES ──────────────────────────────────────────────────────────
router.get('/task-instances', (req, res) => {
  const level = req.user.role_level;
  const { status, site_id } = req.query;
  let sql = `
    SELECT ti.*, rt.task_name, rt.category, rt.frequency, rt.evidence_required, rt.escalation_route,
           s.name as site_name, u.full_name as assigned_user_name,
           comp.full_name as completed_by_name
    FROM task_instances ti
    JOIN recurring_tasks rt ON ti.recurring_task_id = rt.id
    LEFT JOIN sites s ON rt.site_id = s.id
    LEFT JOIN users u ON ti.assigned_user_id = u.id
    LEFT JOIN users comp ON ti.completed_by = comp.id
    WHERE 1=1
  `;
  const params = [];
  if (status) { sql += ' AND ti.status=?'; params.push(status); }
  if (level < 3 && req.user.id) { sql += ' AND ti.assigned_user_id=?'; params.push(req.user.id); }
  else if (level < 5 && site_id) { sql += ' AND rt.site_id=?'; params.push(site_id); }
  sql += ' ORDER BY ti.due_date ASC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/task-instances/:id/complete', requireLevel(1), (req, res) => {
  const id = parseInt(req.params.id);
  const inst = db.prepare('SELECT * FROM task_instances WHERE id=?').get(id);
  if (!inst) return res.status(404).json({ error: 'Not found' });
  const { notes, evidence_ref } = req.body;
  db.prepare('UPDATE task_instances SET status=?,completed_at=datetime(\'now\'),completed_by=?,completion_notes=?,evidence_ref=? WHERE id=?')
    .run('Complete', req.user.id, notes || null, evidence_ref || null, id);
  audit(req, 'COMPLETE_TASK_INSTANCE', 'task_instances', id, { status: inst.status }, { status: 'Complete', notes });
  // Auto-generate next instance
  _generateNextInstance(inst.recurring_task_id);
  res.json({ ok: true });
});

// ── OVERDUE ──────────────────────────────────────────────────────────────────
router.get('/overdue', (req, res) => {
  const level = req.user.role_level;
  let sql = `
    SELECT ti.*, rt.task_name, rt.category, rt.frequency, rt.escalation_route,
           s.name as site_name, u.full_name as assigned_user_name
    FROM task_instances ti
    JOIN recurring_tasks rt ON ti.recurring_task_id = rt.id
    LEFT JOIN sites s ON rt.site_id = s.id
    LEFT JOIN users u ON ti.assigned_user_id = u.id
    WHERE ti.status != 'Complete' AND ti.due_date < date('now')
  `;
  const params = [];
  if (level < 3) { sql += ' AND ti.assigned_user_id=?'; params.push(req.user.id); }
  sql += ' ORDER BY ti.due_date ASC';
  const overdue = db.prepare(sql).all(...params);
  // Mark overdue & log escalation if not already
  const now = new Date().toISOString();
  overdue.forEach(item => {
    if (item.status !== 'Overdue') {
      db.prepare('UPDATE task_instances SET status=? WHERE id=?').run('Overdue', item.id);
      logAudit(null, 'AUTO_OVERDUE_ESCALATION', 'task_instances', item.id, { status: item.status }, { status: 'Overdue', escalated_at: now });
    }
  });
  res.json(overdue);
});

// ── AUDIT (Admin-scoped) ─────────────────────────────────────────────────────
router.get('/audit', requireLevel(3), (req, res) => {
  const { table_name, action, user_id, limit = 200 } = req.query;
  let sql = `SELECT a.*, u.full_name as actor_name FROM audit_trail a LEFT JOIN users u ON a.user_id=u.id WHERE 1=1`;
  const params = [];
  if (table_name) { sql += ' AND a.table_name=?'; params.push(table_name); }
  if (action) { sql += ' AND a.action LIKE ?'; params.push(`%${action}%`); }
  if (user_id) { sql += ' AND a.user_id=?'; params.push(user_id); }
  sql += ` ORDER BY a.timestamp DESC LIMIT ${parseInt(limit)}`;
  res.json(db.prepare(sql).all(...params));
});

// ── SYSTEM SETTINGS ──────────────────────────────────────────────────────────
router.get('/settings', requireLevel(5), (req, res) => {
  res.json(db.prepare('SELECT * FROM system_settings ORDER BY key').all());
});

router.put('/settings/:key', requireLevel(5), (req, res) => {
  const old = db.prepare('SELECT * FROM system_settings WHERE key=?').get(req.params.key);
  db.prepare('INSERT OR REPLACE INTO system_settings (key, value, updated_by, updated_at) VALUES (?,?,?,datetime(\'now\'))')
    .run(req.params.key, req.body.value, req.user.id);
  audit(req, 'UPDATE_SETTING', 'system_settings', null, old, { key: req.params.key, value: req.body.value });
  res.json({ ok: true });
});

// ── Internal: Generate Next Task Instance ─────────────────────────────────────
function _generateNextInstance(recurringTaskId) {
  try {
    const task = db.prepare('SELECT * FROM recurring_tasks WHERE id=? AND archived=0').get(recurringTaskId);
    if (!task) return;
    // Check if there's already a pending/overdue instance
    const existing = db.prepare('SELECT id FROM task_instances WHERE recurring_task_id=? AND status IN (\'Pending\',\'Overdue\')').get(recurringTaskId);
    if (existing) return;
    // Compute next due date
    const freqMap = {
      'Daily': 1, 'Weekly': 7, 'Monthly': 30, 'Every 6 Weeks': 42,
      'Quarterly': 91, 'Every 6 Months': 182, 'Annually': 365
    };
    const days = freqMap[task.frequency] || parseInt(task.frequency) || 30;
    const base = task.due_date || new Date().toISOString().split('T')[0];
    const next = new Date(base);
    next.setDate(next.getDate() + days);
    const dueStr = next.toISOString().split('T')[0];
    db.prepare('INSERT INTO task_instances (recurring_task_id, assigned_user_id, due_date, status) VALUES (?,?,?,?)')
      .run(recurringTaskId, task.assigned_user_id || null, dueStr, 'Pending');
    // Update task due_date to next cycle
    db.prepare('UPDATE recurring_tasks SET due_date=? WHERE id=?').run(dueStr, recurringTaskId);
  } catch (e) { /* non-fatal */ }
}

export default router;
