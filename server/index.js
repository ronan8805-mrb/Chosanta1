import express from 'express';
import session from 'express-session';
import crypto from 'crypto';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import incidentRoutes from './routes/incidents.js';
import handoverRoutes from './routes/handovers.js';
import visitorRoutes from './routes/visitors.js';
import documentRoutes from './routes/documents.js';
import childrenRoutes from './routes/children.js';
import logRoutes from './routes/logs.js';
import adminRoutes from './routes/admin.js';
import boardRoutes from './routes/board.js';
import policyVersionRoutes from './routes/policyversions.js';

const app = express();
app.use(express.json());
const allowedOrigins = ['http://localhost:5173', 'https://chosanta1.vercel.app'];
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));

// C4 FIX: Session secret from environment or cryptographically random fallback
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(48).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET not set in environment — using random secret (sessions will not survive restart)');
}
app.use(session({
  secret: SESSION_SECRET,
  resave: false, saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000, httpOnly: true, sameSite: 'lax' }
}));

// Auth middleware
export function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = db.prepare('SELECT u.*, r.name as role_name, r.level as role_level FROM users u JOIN roles r ON u.role_id=r.id WHERE u.id=?').get(req.session.userId);
  if (!user || !user.active) return res.status(401).json({ error: 'Account disabled' });
  req.user = user;
  // Track last access for audit (L1 fix)
  db.prepare('UPDATE users SET last_login=datetime(\'now\') WHERE id=?').run(user.id);
  next();
}
export function requireLevel(minLevel) {
  return (req, res, next) => {
    if (req.user.role_level < minLevel) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

// Audit logger — captures IP + role at time of action
export function logAudit(userId, action, tableName, recordId, oldVal, newVal, ip, userRole) {
  db.prepare('INSERT INTO audit_trail (user_id,action,table_name,record_id,old_value,new_value,ip_address,user_role) VALUES (?,?,?,?,?,?,?,?)')
    .run(userId, action, tableName, recordId, oldVal ? JSON.stringify(oldVal) : null, newVal ? JSON.stringify(newVal) : null, ip || null, userRole || null);
}

// IP extractor
export function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
}

// Serve COSANTA HTML policy documents
app.use('/policies', express.static(join(__dirname, '..', '..')));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/incidents', requireAuth, incidentRoutes);
app.use('/api/handovers', requireAuth, handoverRoutes);
app.use('/api/visitors', requireAuth, visitorRoutes);
app.use('/api/documents', requireAuth, documentRoutes);
app.use('/api/children', requireAuth, childrenRoutes);
app.use('/api/logs', requireAuth, logRoutes);
app.use('/api/admin', requireAuth, adminRoutes);
app.use('/api/board', requireAuth, boardRoutes);
app.use('/api/policyversions', requireAuth, policyVersionRoutes);

app.get('/api/users', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT id, full_name, email FROM users WHERE active=1').all());
});

app.get('/api/audit', requireAuth, requireLevel(3), (req, res) => {
  const rows = db.prepare(`SELECT a.*, u.full_name FROM audit_trail a LEFT JOIN users u ON a.user_id=u.id ORDER BY a.timestamp DESC LIMIT 200`).all();
  res.json(rows);
});

// ── Governance Alerts Engine (H1 fix) ──────────────────────────────────
app.get('/api/alerts', requireAuth, (req, res) => {
  const alerts = [];
  const q = (sql) => { try { return db.prepare(sql).get()?.c || 0; } catch { return 0; } };

  // Incidents open > 48 hours without PIC review
  const picOverdue = q("SELECT COUNT(*) as c FROM incidents WHERE pic_reviewed=0 AND status='Open' AND date < date('now','-2 days')");
  if (picOverdue > 0) alerts.push({ severity: 'critical', category: 'Safeguarding', message: `${picOverdue} incident(s) open > 48 hours without PIC review`, link: '/incidents' });

  // Open incidents (general)
  const openInc = q("SELECT COUNT(*) as c FROM incidents WHERE status='Open'");
  if (openInc > 0) alerts.push({ severity: 'high', category: 'Incidents', message: `${openInc} open incident(s) requiring closure`, link: '/incidents' });

  // Training expired
  const trainExp = q("SELECT COUNT(*) as c FROM training_records WHERE expiry_date < date('now')");
  if (trainExp > 0) alerts.push({ severity: 'critical', category: 'Staffing', message: `${trainExp} staff training record(s) expired`, link: '/training' });

  // Supervision overdue (no record in 42 days for any active staff)
  const supOverdue = q("SELECT COUNT(*) as c FROM users WHERE active=1 AND id NOT IN (SELECT staff_id FROM supervision_records WHERE date > date('now','-42 days'))");
  if (supOverdue > 0) alerts.push({ severity: 'high', category: 'Staffing', message: `${supOverdue} staff member(s) overdue supervision (> 6 weeks)`, link: '/supervision' });

  // Care plan reviews overdue
  const cpOverdue = q("SELECT COUNT(*) as c FROM care_plans WHERE review_date < date('now') AND status='Active'");
  if (cpOverdue > 0) alerts.push({ severity: 'high', category: 'Children', message: `${cpOverdue} care plan(s) overdue for review`, link: '/careplans' });

  // Open complaints > 5 working days
  const compOverdue = q("SELECT COUNT(*) as c FROM complaints WHERE status='Open' AND date_received < date('now','-5 days')");
  if (compOverdue > 0) alerts.push({ severity: 'high', category: 'Governance', message: `${compOverdue} complaint(s) open > 5 days`, link: '/complaints' });

  // Missing child without return interview
  const noReturn = q("SELECT COUNT(*) as c FROM missing_chronology WHERE return_interview=0");
  if (noReturn > 0) alerts.push({ severity: 'critical', category: 'Safeguarding', message: `${noReturn} missing episode(s) without return interview`, link: '/missingchronology' });

  // Risk assessments needing review
  const riskOverdue = q("SELECT COUNT(*) as c FROM child_risk_assessments WHERE review_date < date('now') AND status='Active'");
  if (riskOverdue > 0) alerts.push({ severity: 'high', category: 'Risk', message: `${riskOverdue} child risk assessment(s) overdue`, link: '/childrisk' });

  // Fire equipment overdue
  const fireOverdue = q("SELECT COUNT(*) as c FROM fire_equipment WHERE next_service < date('now')");
  if (fireOverdue > 0) alerts.push({ severity: 'high', category: 'Safety', message: `${fireOverdue} fire equipment item(s) overdue service`, link: '/fireequipment' });

  // QIP actions overdue
  const qipOverdue = q("SELECT COUNT(*) as c FROM qip WHERE target_date < date('now') AND status != 'Closed'");
  if (qipOverdue > 0) alerts.push({ severity: 'moderate', category: 'Governance', message: `${qipOverdue} QIP action(s) overdue`, link: '/qip' });

  // PEEP reviews overdue
  const peepOverdue = q("SELECT COUNT(*) as c FROM peeps WHERE review_date < date('now') AND status='Active'");
  if (peepOverdue > 0) alerts.push({ severity: 'high', category: 'Safety', message: `${peepOverdue} PEEP(s) overdue for review`, link: '/peeps' });

  // Maintenance open
  const maintOpen = q("SELECT COUNT(*) as c FROM maintenance_records WHERE status='Open'");
  if (maintOpen > 0) alerts.push({ severity: 'moderate', category: 'Safety', message: `${maintOpen} open maintenance request(s)`, link: '/maintenance' });

  // Inductions incomplete > 30 days
  const indOverdue = q("SELECT COUNT(*) as c FROM staff_induction WHERE status='In Progress' AND start_date < date('now','-30 days')");
  if (indOverdue > 0) alerts.push({ severity: 'high', category: 'Staffing', message: `${indOverdue} staff induction(s) incomplete > 30 days`, link: '/induction' });

  // Document reviews overdue
  const docOverdue = q("SELECT COUNT(*) as c FROM documents WHERE review_date < date('now') AND status='Active'");
  if (docOverdue > 0) alerts.push({ severity: 'moderate', category: 'Governance', message: `${docOverdue} policy document(s) overdue review`, link: '/audit' });

  res.json(alerts);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Chosanta CMS API running on port ${PORT}`));
