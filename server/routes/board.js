import { Router } from 'express';
import db from '../db.js';
import { requireLevel } from '../index.js';

const router = Router();

const q  = (sql, p = []) => { try { return db.prepare(sql).get(...p) || {}; } catch { return {}; } };
const qa = (sql, p = []) => { try { return db.prepare(sql).all(...p); } catch { return []; } };
const n  = (obj, key) => obj[key] || 0;

router.get('/dashboard', requireLevel(4), (req, res) => {

  // ── STAFF ────────────────────────────────────────────────────────────────
  const totalStaff       = n(q('SELECT COUNT(*) c FROM users WHERE active=1'), 'c');
  const expiredTraining  = n(q("SELECT COUNT(*) c FROM users WHERE active=1 AND id IN (SELECT staff_id FROM training_records WHERE expiry_date < date('now'))"), 'c');
  const overdueSupervision = n(q("SELECT COUNT(*) c FROM users WHERE active=1 AND id NOT IN (SELECT staff_id FROM supervision_records WHERE date > date('now','-42 days'))"), 'c');
  const incompletInduction = n(q("SELECT COUNT(*) c FROM staff_induction WHERE status='In Progress' AND start_date < date('now','-30 days')"), 'c');

  const trainingScore    = totalStaff > 0 ? Math.round(((totalStaff - expiredTraining) / totalStaff) * 100) : 100;
  const supervisionScore = totalStaff > 0 ? Math.round(((totalStaff - overdueSupervision) / totalStaff) * 100) : 100;

  // ── INCIDENTS ─────────────────────────────────────────────────────────────
  const totalInc   = n(q('SELECT COUNT(*) c FROM incidents'), 'c');
  const reviewedInc = n(q("SELECT COUNT(*) c FROM incidents WHERE pic_reviewed=1 OR status='Closed'"), 'c');
  const openInc    = n(q("SELECT COUNT(*) c FROM incidents WHERE status='Open'"), 'c');
  const criticalInc = n(q("SELECT COUNT(*) c FROM incidents WHERE severity='Critical' AND status='Open'"), 'c');
  const incidentScore = totalInc > 0 ? Math.round((reviewedInc / totalInc) * 100) : 100;

  const incidentTrend = qa(`
    SELECT strftime('%Y-%m', date) as month, COUNT(*) as count,
           SUM(CASE WHEN severity IN ('Critical','Major') THEN 1 ELSE 0 END) as serious
    FROM incidents WHERE date >= date('now','-6 months')
    GROUP BY month ORDER BY month
  `);

  // ── CARE PLANS ───────────────────────────────────────────────────────────
  const totalCP    = n(q("SELECT COUNT(*) c FROM care_plans WHERE status='Active'"), 'c');
  const overdueCP  = n(q("SELECT COUNT(*) c FROM care_plans WHERE review_date < date('now') AND status='Active'"), 'c');
  const carePlanScore = totalCP > 0 ? Math.round(((totalCP - overdueCP) / totalCP) * 100) : 100;

  // ── SAFEGUARDING ──────────────────────────────────────────────────────────
  const openReferrals    = n(q("SELECT COUNT(*) c FROM safeguarding_referrals WHERE status='Open'"), 'c');
  const pendingScreen    = n(q("SELECT COUNT(*) c FROM safeguarding_referrals WHERE preliminary_screen='Pending'"), 'c');
  const missingNoInterview = n(q("SELECT COUNT(*) c FROM missing_chronology WHERE return_interview=0"), 'c');
  const restrictiveOpen  = n(q("SELECT COUNT(*) c FROM restrictive_practices WHERE status='Open'"), 'c');
  const senUnacknowledged = n(q("SELECT COUNT(*) c FROM sen_register WHERE acknowledged=0"), 'c');

  // ── DOCUMENTS / POLICIES ──────────────────────────────────────────────────
  const totalDocs  = n(q("SELECT COUNT(*) c FROM documents WHERE status='Active'"), 'c');
  const overdueDocs = n(q("SELECT COUNT(*) c FROM documents WHERE review_date < date('now') AND status='Active'"), 'c');
  const documentScore = totalDocs > 0 ? Math.round(((totalDocs - overdueDocs) / totalDocs) * 100) : 100;

  // ── QIP ───────────────────────────────────────────────────────────────────
  const qipOpen    = n(q("SELECT COUNT(*) c FROM qip WHERE status='Open'"), 'c');
  const qipIP      = n(q("SELECT COUNT(*) c FROM qip WHERE status='In Progress'"), 'c');
  const qipClosed  = n(q("SELECT COUNT(*) c FROM qip WHERE status='Closed'"), 'c');
  const qipOverdue = n(q("SELECT COUNT(*) c FROM qip WHERE target_date < date('now') AND status != 'Closed'"), 'c');
  const qipTotal   = qipOpen + qipIP + qipClosed;
  const qipScore   = qipTotal > 0 ? Math.round((qipClosed / qipTotal) * 100) : 100;

  // ── RISK ──────────────────────────────────────────────────────────────────
  const riskCritical = n(q("SELECT COUNT(*) c FROM risk_register WHERE rating='Critical' AND status='Active'"), 'c');
  const riskHigh   = n(q("SELECT COUNT(*) c FROM risk_register WHERE rating='High' AND status='Active'"), 'c');
  const riskMedium = n(q("SELECT COUNT(*) c FROM risk_register WHERE rating='Medium' AND status='Active'"), 'c');
  const riskLow    = n(q("SELECT COUNT(*) c FROM risk_register WHERE rating='Low' AND status='Active'"), 'c');
  const peepOverdue = n(q("SELECT COUNT(*) c FROM peeps WHERE review_date < date('now') AND status='Active'"), 'c');
  const fireOverdue = n(q("SELECT COUNT(*) c FROM fire_equipment WHERE next_service < date('now')"), 'c');

  // ── COMPLAINTS ────────────────────────────────────────────────────────────
  const openComplaints   = n(q("SELECT COUNT(*) c FROM complaints WHERE status='Open'"), 'c');
  const overdueComplaints = n(q("SELECT COUNT(*) c FROM complaints WHERE status='Open' AND date_received < date('now','-5 days')"), 'c');
  const totalComplaints  = n(q('SELECT COUNT(*) c FROM complaints'), 'c');
  const closedOnTime     = n(q("SELECT COUNT(*) c FROM complaints WHERE status='Closed' AND within_timeframe=1"), 'c');
  const complaintScore   = totalComplaints > 0 ? Math.round((closedOnTime / totalComplaints) * 100) : 100;

  // ── GOVERNANCE ACTIONS ────────────────────────────────────────────────────
  const govOpen    = n(q("SELECT COUNT(*) c FROM governance_actions WHERE status='Open'"), 'c');
  const govOverdue = n(q("SELECT COUNT(*) c FROM governance_actions WHERE status='Open' AND target_date < date('now')"), 'c');

  // ── RECURRING TASKS ───────────────────────────────────────────────────────
  const recTotal   = n(q("SELECT COUNT(*) c FROM task_instances WHERE created_at >= date('now','-30 days')"), 'c');
  const recComplete = n(q("SELECT COUNT(*) c FROM task_instances WHERE status='Complete' AND created_at >= date('now','-30 days')"), 'c');
  const recurringScore = recTotal > 0 ? Math.round((recComplete / recTotal) * 100) : 100;

  // ── STAFFING DETAIL TABLE ─────────────────────────────────────────────────
  const staffDetail = qa(`
    SELECT u.id, u.full_name, r.name as role_name,
      (SELECT COUNT(*) FROM training_records WHERE staff_id=u.id AND expiry_date < date('now')) as expired_training,
      (SELECT MAX(date) FROM supervision_records WHERE staff_id=u.id) as last_supervision,
      (SELECT COUNT(*) FROM supervision_records WHERE staff_id=u.id AND date > date('now','-42 days')) as recent_sup
    FROM users u JOIN roles r ON u.role_id=r.id WHERE u.active=1 ORDER BY r.level DESC, u.full_name
  `);

  // ── RECENT AUDIT ACTIONS ─────────────────────────────────────────────────
  const recentAudit = qa(`
    SELECT a.action, a.table_name, a.timestamp, u.full_name as actor
    FROM audit_trail a LEFT JOIN users u ON a.user_id=u.id
    ORDER BY a.timestamp DESC LIMIT 10
  `);

  // ── SITES ─────────────────────────────────────────────────────────────────
  const sites = qa('SELECT * FROM sites WHERE active=1');

  // ── COMPLIANCE SCORE ─────────────────────────────────────────────────────
  const overallScore = Math.round(
    trainingScore    * 0.20 +
    supervisionScore * 0.20 +
    incidentScore    * 0.15 +
    carePlanScore    * 0.15 +
    documentScore    * 0.10 +
    qipScore         * 0.10 +
    complaintScore   * 0.05 +
    recurringScore   * 0.05
  );

  res.json({
    generated_at: new Date().toISOString(),
    overallScore,
    compliance: {
      training:    { score: trainingScore,    label: 'Training Currency',   detail: `${expiredTraining} expired` },
      supervision: { score: supervisionScore, label: 'Staff Supervision',   detail: `${overdueSupervision} overdue` },
      incidents:   { score: incidentScore,    label: 'Incident Review',     detail: `${reviewedInc}/${totalInc} reviewed` },
      carePlans:   { score: carePlanScore,    label: 'Care Plans Current',  detail: `${overdueCP} overdue` },
      documents:   { score: documentScore,    label: 'Policy Reviews',      detail: `${overdueDocs}/${totalDocs} overdue` },
      qip:         { score: qipScore,         label: 'QIP Actions',         detail: `${qipClosed}/${qipTotal} closed` },
      complaints:  { score: complaintScore,   label: 'Complaints Response', detail: `${overdueComplaints} overdue` },
      recurring:   { score: recurringScore,   label: 'Recurring Tasks',     detail: `${recComplete}/${recTotal} this month` },
    },
    incidents:   { open: openInc, critical: criticalInc, trend: incidentTrend },
    safeguarding: { openReferrals, pendingScreen, missingNoInterview, restrictiveOpen, senUnacknowledged },
    risks:       { critical: riskCritical, high: riskHigh, medium: riskMedium, low: riskLow, peepOverdue, fireOverdue },
    qip:         { open: qipOpen, inProgress: qipIP, closed: qipClosed, overdue: qipOverdue },
    complaints:  { open: openComplaints, overdue: overdueComplaints },
    governance:  { actionsOpen: govOpen, actionsOverdue: govOverdue },
    staffing:    { total: totalStaff, expiredTraining, overdueSupervision, incompletInduction, staffDetail },
    recentAudit,
    sites,
  });
});

export default router;
