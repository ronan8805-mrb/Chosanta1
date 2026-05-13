import { Router } from 'express';
import db from '../db.js';
const router = Router();

router.get('/', (req, res) => {
  const q = (sql) => { try { return db.prepare(sql).get()?.c || 0; } catch { return 0; } };
  const stats = {};

  // Core operational metrics
  stats.totalChildren = q("SELECT COUNT(*) as c FROM children WHERE status='Active'");
  stats.totalStaff = q("SELECT COUNT(*) as c FROM users WHERE active=1");
  stats.openIncidents = q("SELECT COUNT(*) as c FROM incidents WHERE status='Open'");
  stats.pendingPICReview = q("SELECT COUNT(*) as c FROM incidents WHERE pic_reviewed=0 AND status='Open'");

  // Document governance
  stats.overdueDocuments = q("SELECT COUNT(*) as c FROM documents WHERE review_date < date('now') AND status='Active'");

  // Maintenance
  stats.openMaintenance = q("SELECT COUNT(*) as c FROM maintenance_records WHERE status='Open'");

  // Training compliance
  stats.trainingExpired = q("SELECT COUNT(*) as c FROM training_records WHERE expiry_date < date('now')");
  stats.trainingExpiring = q("SELECT COUNT(*) as c FROM training_records WHERE expiry_date < date('now','+30 days') AND expiry_date > date('now')");

  // M3 FIX: Additional governance indicators
  stats.openComplaints = q("SELECT COUNT(*) as c FROM complaints WHERE status='Open'");
  stats.overdueSupervision = q("SELECT COUNT(*) as c FROM users WHERE active=1 AND id NOT IN (SELECT staff_id FROM supervision_records WHERE date > date('now','-42 days'))");
  stats.overdueCareReviews = q("SELECT COUNT(*) as c FROM care_plans WHERE review_date < date('now') AND status='Active'");
  stats.qipActionsOpen = q("SELECT COUNT(*) as c FROM qip WHERE status != 'Closed'");
  stats.fireEquipOverdue = q("SELECT COUNT(*) as c FROM fire_equipment WHERE next_service < date('now')");
  stats.missingNoInterview = q("SELECT COUNT(*) as c FROM missing_chronology WHERE return_interview=0");

  // Recent activity
  stats.recentIncidents = db.prepare(`SELECT i.*, c.first_name||' '||c.last_name as child_name FROM incidents i LEFT JOIN children c ON i.child_id=c.id WHERE i.status != 'Archived' ORDER BY i.created_at DESC LIMIT 5`).all();
  stats.recentHandovers = db.prepare(`SELECT h.*, u.full_name as leader_name FROM handovers h LEFT JOIN users u ON h.shift_leader_id=u.id ORDER BY h.created_at DESC LIMIT 3`).all();

  res.json(stats);
});

export default router;
