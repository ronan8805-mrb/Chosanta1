import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { logAudit } from '../index.js';

const router = Router();

// ── Failed login attempt tracking (in-memory, resets on restart) ─────────
const failedAttempts = {};
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
}

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const ip = getClientIp(req);

  // ── Account lockout check ─────────────────────────────────────────────
  const key = (email || '').toLowerCase();
  const attempts = failedAttempts[key];
  if (attempts && attempts.count >= LOCKOUT_THRESHOLD) {
    const elapsed = Date.now() - attempts.lastAttempt;
    if (elapsed < LOCKOUT_DURATION_MS) {
      const remainMins = Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 60000);
      logAudit(null, 'LOGIN_LOCKED_OUT', 'users', null, null, { email: key, ip, remaining_mins: remainMins });
      return res.status(429).json({ error: `Account temporarily locked. Try again in ${remainMins} minute(s).` });
    }
    delete failedAttempts[key]; // Lockout expired
  }

  // ── Credential validation ─────────────────────────────────────────────
  const user = db.prepare('SELECT u.*, r.name as role_name, r.level as role_level FROM users u JOIN roles r ON u.role_id=r.id WHERE u.email=? AND u.active=1').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    // Track failed attempt
    if (!failedAttempts[key]) failedAttempts[key] = { count: 0, lastAttempt: 0 };
    failedAttempts[key].count++;
    failedAttempts[key].lastAttempt = Date.now();
    logAudit(user?.id || null, 'LOGIN_FAILED', 'users', user?.id || null, null, { email: key, ip, attempt: failedAttempts[key].count });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // ── Successful login ──────────────────────────────────────────────────
  delete failedAttempts[key]; // Reset on success
  req.session.userId = user.id;
  db.prepare("UPDATE users SET last_login=datetime('now') WHERE id=?").run(user.id);
  logAudit(user.id, 'LOGIN_SUCCESS', 'users', user.id, null, { ip, role: user.role_name, role_level: user.role_level });

  // ── Force password change check ───────────────────────────────────────
  const profile = db.prepare('SELECT force_password_change FROM user_profiles WHERE user_id=?').get(user.id);
  const forceChange = profile?.force_password_change === 1;

  res.json({
    id: user.id, email: user.email, full_name: user.full_name,
    role: user.role_name, role_level: user.role_level,
    force_password_change: forceChange
  });
});

router.post('/logout', (req, res) => {
  const userId = req.session?.userId;
  const ip = getClientIp(req);
  if (userId) logAudit(userId, 'LOGOUT', 'users', userId, null, { ip });
  req.session.destroy();
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = db.prepare('SELECT u.id, u.email, u.full_name, r.name as role, r.level as role_level FROM users u JOIN roles r ON u.role_id=r.id WHERE u.id=?').get(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Not found' });
  const profile = db.prepare('SELECT force_password_change FROM user_profiles WHERE user_id=?').get(user.id);
  res.json({ ...user, force_password_change: profile?.force_password_change === 1 });
});

// ── Change own password (for force-change flow) ──────────────────────────
router.post('/change-password', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  const { current_password, new_password } = req.body;
  if (!new_password || new_password.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.session.userId);
  if (!user || !bcrypt.compareSync(current_password, user.password_hash)) return res.status(401).json({ error: 'Current password is incorrect' });
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, user.id);
  db.prepare('UPDATE user_profiles SET force_password_change=0 WHERE user_id=?').run(user.id);
  logAudit(user.id, 'PASSWORD_CHANGED', 'users', user.id, null, { ip: getClientIp(req), self_service: true });
  res.json({ ok: true });
});

export default router;
