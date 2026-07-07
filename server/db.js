import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = process.env.DB_PATH || join(__dirname, '..', 'chosanta.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema
db.exec(`
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY, name TEXT UNIQUE, level INTEGER
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL, role_id INTEGER DEFAULT 1,
  active INTEGER DEFAULT 1, last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref_code TEXT UNIQUE, first_name TEXT, last_name TEXT, dob TEXT,
  gender TEXT, nationality TEXT, legal_status TEXT,
  social_worker TEXT, sw_phone TEXT, tusla_area TEXT,
  admission_date TEXT, discharge_date TEXT, status TEXT DEFAULT 'Active',
  keyworker_id INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (keyworker_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, category TEXT NOT NULL,
  status TEXT DEFAULT 'Draft', owner_id INTEGER,
  review_date TEXT, version INTEGER DEFAULT 1,
  file_path TEXT, file_type TEXT, notes TEXT,
  created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, time TEXT, category TEXT NOT NULL,
  severity TEXT DEFAULT 'Minor', description TEXT,
  child_id INTEGER, staff_id INTEGER, location TEXT,
  immediate_action TEXT, injuries TEXT,
  sen_required INTEGER DEFAULT 0, nims_ref TEXT,
  pic_reviewed INTEGER DEFAULT 0, pic_review_date TEXT,
  status TEXT DEFAULT 'Open', outcome TEXT, learning TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (staff_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS handovers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, shift_type TEXT NOT NULL,
  shift_leader_id INTEGER, staff_on_duty TEXT,
  children_present TEXT, incidents_summary TEXT,
  medication_notes TEXT, safeguarding_notes TEXT,
  visitors TEXT, tasks_outstanding TEXT,
  fire_panel_ok INTEGER DEFAULT 1, petty_cash TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (shift_leader_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, visitor_name TEXT NOT NULL,
  organisation TEXT, purpose TEXT, child_id INTEGER,
  time_in TEXT, time_out TEXT,
  supervised INTEGER DEFAULT 1, authorised_by INTEGER,
  refused INTEGER DEFAULT 0, refusal_reason TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (authorised_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS admissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, date TEXT NOT NULL, time TEXT,
  placement_type TEXT, referral_source TEXT,
  referring_sw TEXT, expected_duration TEXT,
  discharge_date TEXT, discharge_reason TEXT, destination TEXT,
  status TEXT DEFAULT 'Active',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS keyworking_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, keyworker_id INTEGER,
  date TEXT NOT NULL, duration TEXT, location TEXT,
  mood_rating TEXT, wellbeing_notes TEXT,
  goals_progress TEXT, topics_discussed TEXT,
  child_voice TEXT, safeguarding_check TEXT,
  actions TEXT, reflective_notes TEXT,
  engagement_level TEXT, pic_reviewed INTEGER DEFAULT 0,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (keyworker_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS maintenance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_reported TEXT NOT NULL, description TEXT,
  location TEXT, risk_level TEXT DEFAULT 'Low',
  reported_by INTEGER, contractor TEXT,
  date_completed TEXT, cost REAL, pic_signoff INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Open',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (reported_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS training_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER, training_title TEXT NOT NULL,
  category TEXT, provider TEXT, date_completed TEXT,
  expiry_date TEXT, competent INTEGER DEFAULT 1,
  cert_on_file INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS audit_trail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, action TEXT NOT NULL,
  table_name TEXT, record_id INTEGER,
  old_value TEXT, new_value TEXT,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS staff_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER, date TEXT NOT NULL, shift TEXT,
  status TEXT DEFAULT 'Present', absence_reason TEXT,
  certified INTEGER DEFAULT 0, return_date TEXT,
  notes TEXT, created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS supervision_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER, supervisor_id INTEGER,
  date TEXT NOT NULL, session_no INTEGER, duration TEXT,
  location TEXT, workload_notes TEXT, wellbeing_notes TEXT,
  training_notes TEXT, actions TEXT, next_date TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES users(id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS hs_inspections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, inspected_by INTEGER,
  area TEXT, fire_exits_ok INTEGER DEFAULT 1,
  fire_equip_ok INTEGER DEFAULT 1, lighting_ok INTEGER DEFAULT 1,
  floors_ok INTEGER DEFAULT 1, kitchen_ok INTEGER DEFAULT 1,
  bathrooms_ok INTEGER DEFAULT 1, hazards TEXT,
  actions_required TEXT, status TEXT DEFAULT 'Complete',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (inspected_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS medication_audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, auditor_id INTEGER,
  period_covered TEXT, mar_accurate INTEGER DEFAULT 1,
  storage_correct INTEGER DEFAULT 1, controlled_drugs_ok INTEGER DEFAULT 1,
  expiry_check INTEGER DEFAULT 1, findings TEXT,
  actions TEXT, fire_drill_date TEXT, fire_drill_time TEXT,
  evacuation_time TEXT, all_evacuated INTEGER DEFAULT 1,
  fire_issues TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (auditor_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS room_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, time TEXT, child_id INTEGER,
  area_searched TEXT, reason TEXT, authorised_by INTEGER,
  staff_1 INTEGER, staff_2 INTEGER,
  items_found TEXT, actions_taken TEXT,
  child_informed INTEGER DEFAULT 1, child_response TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_received TEXT NOT NULL, complainant TEXT,
  received_via TEXT, category TEXT,
  description TEXT, investigating_officer INTEGER,
  outcome TEXT, response_date TEXT,
  within_timeframe INTEGER DEFAULT 1,
  learning TEXT, status TEXT DEFAULT 'Open',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (investigating_officer) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS compliments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, from_whom TEXT,
  source TEXT, feedback TEXT,
  relates_to TEXT, shared_with_staff INTEGER DEFAULT 0,
  child_voice TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS governance_minutes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, time TEXT, venue TEXT,
  chaired_by INTEGER, minutes_by INTEGER,
  attendees TEXT, apologies TEXT,
  actions_from_last TEXT, agenda_items TEXT,
  incident_summary TEXT, compliance_update TEXT,
  safeguarding_update TEXT, training_update TEXT,
  risk_register_update TEXT, qip_update TEXT,
  next_meeting TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (chaired_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS daily_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, shift TEXT, author_id INTEGER,
  children_present TEXT, staff_on_duty TEXT,
  narrative TEXT, safeguarding_notes TEXT,
  medication_notes TEXT, education_notes TEXT,
  activities TEXT, mood_behaviour TEXT,
  visitors_contacts TEXT, significant_events TEXT,
  pic_reviewed INTEGER DEFAULT 0,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS mar_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, date TEXT NOT NULL, time TEXT,
  medication_name TEXT NOT NULL, dose TEXT,
  route TEXT DEFAULT 'Oral', administered_by INTEGER,
  witnessed_by INTEGER, status TEXT DEFAULT 'Given',
  refusal_reason TEXT, prn_reason TEXT,
  notes TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (administered_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS sen_register (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, child_id INTEGER,
  category TEXT, description TEXT,
  reported_to TEXT DEFAULT 'Tusla',
  reported_by INTEGER, method TEXT,
  nims_ref TEXT, acknowledged INTEGER DEFAULT 0,
  acknowledgement_date TEXT, outcome TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS children_register (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, ref_code TEXT,
  admission_date TEXT, discharge_date TEXT,
  legal_status TEXT, placement_type TEXT,
  social_worker TEXT, sw_phone TEXT, tusla_area TEXT,
  guardian TEXT, guardian_phone TEXT,
  gp_name TEXT, gp_phone TEXT,
  school TEXT, allergies TEXT,
  dietary_needs TEXT, religion TEXT,
  status TEXT DEFAULT 'Active',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS petty_cash (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, description TEXT,
  child_id INTEGER, amount REAL,
  type TEXT DEFAULT 'Expense',
  receipt INTEGER DEFAULT 0, authorised_by INTEGER,
  running_balance REAL,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS staff_roster (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_commencing TEXT NOT NULL,
  staff_id INTEGER, monday TEXT, tuesday TEXT,
  wednesday TEXT, thursday TEXT, friday TEXT,
  saturday TEXT, sunday TEXT,
  total_hours REAL, notes TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS compliance_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, reviewer_id INTEGER,
  period_covered TEXT, standard TEXT,
  finding TEXT DEFAULT 'Compliant',
  evidence TEXT, actions TEXT,
  owner TEXT, target_date TEXT,
  status TEXT DEFAULT 'Open',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS child_risk_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, date TEXT NOT NULL,
  assessed_by INTEGER, risk_area TEXT,
  risk_description TEXT, likelihood TEXT,
  impact TEXT, risk_level TEXT DEFAULT 'Medium',
  control_measures TEXT, review_date TEXT,
  status TEXT DEFAULT 'Active',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (assessed_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS care_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, keyworker_id INTEGER,
  date TEXT NOT NULL, placement_date TEXT,
  legal_status TEXT, objectives TEXT,
  health_needs TEXT, education_needs TEXT,
  family_contact TEXT, life_skills TEXT,
  review_date TEXT, review_outcome TEXT,
  status TEXT DEFAULT 'Active',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (keyworker_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS education_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, school TEXT, year_class TEXT,
  school_contact TEXT, school_phone TEXT,
  senco_contact TEXT, month TEXT,
  days_attended INTEGER, days_absent INTEGER,
  absence_reason TEXT, school_feedback TEXT,
  notes TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS house_risk_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, assessed_by INTEGER,
  area TEXT, hazard TEXT,
  risk_level TEXT DEFAULT 'Low',
  existing_controls TEXT, additional_actions TEXT,
  responsible TEXT, target_date TEXT,
  status TEXT DEFAULT 'Open',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (assessed_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS risk_register (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id TEXT, description TEXT,
  location TEXT, likelihood TEXT,
  impact TEXT, rating TEXT DEFAULT 'Medium',
  controls TEXT, responsible TEXT,
  review_date TEXT, status TEXT DEFAULT 'Active',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS missing_chronology (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, date TEXT NOT NULL,
  time_out TEXT, time_back TEXT, duration TEXT,
  where_found TEXT, condition_on_return TEXT,
  medical_attention INTEGER DEFAULT 0,
  return_interview INTEGER DEFAULT 0,
  interview_date TEXT, interview_notes TEXT,
  ags_notified INTEGER DEFAULT 0,
  sen_submitted INTEGER DEFAULT 0,
  trigger_pattern TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS peeps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, date TEXT NOT NULL,
  mobility TEXT, communication TEXT,
  cognitive TEXT, medical_needs TEXT,
  evacuation_method TEXT, assembly_point TEXT,
  assigned_staff INTEGER, night_plan TEXT,
  equipment_needed TEXT, review_date TEXT,
  status TEXT DEFAULT 'Active',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (assigned_staff) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS qip (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, standard TEXT,
  finding TEXT, action TEXT,
  owner TEXT, target_date TEXT,
  progress TEXT, evidence TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  source TEXT DEFAULT 'Internal Review',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS staff_induction (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER, start_date TEXT NOT NULL,
  mentor_id INTEGER,
  policies_read INTEGER DEFAULT 0,
  safeguarding_training INTEGER DEFAULT 0,
  fire_safety_training INTEGER DEFAULT 0,
  first_aid_training INTEGER DEFAULT 0,
  medication_training INTEGER DEFAULT 0,
  manual_handling INTEGER DEFAULT 0,
  children_first INTEGER DEFAULT 0,
  house_orientation INTEGER DEFAULT 0,
  emergency_procedures INTEGER DEFAULT 0,
  data_protection INTEGER DEFAULT 0,
  lone_working INTEGER DEFAULT 0,
  completion_date TEXT,
  sign_off_by INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'In Progress',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES users(id),
  FOREIGN KEY (mentor_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS staff_appraisals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER, date TEXT NOT NULL,
  appraiser_id INTEGER, period_covered TEXT,
  achievements TEXT, areas_for_development TEXT,
  goals_set TEXT, training_needs TEXT,
  wellbeing_check TEXT, overall_rating TEXT DEFAULT 'Meets Expectations',
  staff_comments TEXT, next_review TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES users(id),
  FOREIGN KEY (appraiser_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS fire_equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_type TEXT, location TEXT,
  serial_number TEXT, install_date TEXT,
  last_service TEXT, next_service TEXT,
  contractor TEXT, status TEXT DEFAULT 'In Service',
  notes TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS restrictive_practices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, date TEXT NOT NULL,
  start_time TEXT, end_time TEXT, duration_mins INTEGER,
  type TEXT DEFAULT 'Physical Intervention',
  technique TEXT, reason TEXT,
  antecedent TEXT, behaviour TEXT,
  deescalation_attempted TEXT, deescalation_detail TEXT,
  description TEXT, child_presentation TEXT,
  child_post_incident TEXT, injuries_child TEXT, injuries_staff TEXT,
  staff_involved TEXT, witnesses TEXT,
  child_debrief INTEGER DEFAULT 0, child_debrief_date TEXT,
  child_debrief_notes TEXT, child_account TEXT,
  staff_debrief INTEGER DEFAULT 0, staff_debrief_date TEXT,
  proportionate INTEGER DEFAULT 1, necessary INTEGER DEFAULT 1,
  minimum_force INTEGER DEFAULT 1,
  pic_reviewed INTEGER DEFAULT 0, pic_review_date TEXT, pic_notes TEXT,
  sen_submitted INTEGER DEFAULT 0, sen_ref TEXT,
  risk_assessment_updated INTEGER DEFAULT 0,
  care_plan_updated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Open',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS safeguarding_referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, child_id INTEGER,
  concern_type TEXT, source TEXT,
  reporter_id INTEGER, dlp_id INTEGER,
  preliminary_screen TEXT DEFAULT 'Pending',
  screen_date TEXT, screen_outcome TEXT,
  mandated_report INTEGER DEFAULT 0,
  mandated_reporter_id INTEGER,
  referral_method TEXT, referral_date TEXT,
  tusla_ref TEXT, retrospective_sent INTEGER DEFAULT 0,
  retrospective_date TEXT,
  garda_notified INTEGER DEFAULT 0, garda_date TEXT,
  parent_notified INTEGER DEFAULT 0,
  sw_notified INTEGER DEFAULT 0,
  outcome TEXT, follow_up TEXT,
  status TEXT DEFAULT 'Open',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS child_participation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, type TEXT DEFAULT 'House Meeting',
  facilitator_id INTEGER, children_present TEXT,
  topics TEXT, child_feedback TEXT,
  requests TEXT, actions TEXT,
  action_owner TEXT, action_status TEXT DEFAULT 'Open',
  notes TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (facilitator_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS absence_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, date TEXT NOT NULL,
  triggers TEXT, early_warning_signs TEXT,
  deescalation_strategies TEXT,
  search_protocol TEXT, high_risk_locations TEXT,
  notification_order TEXT,
  return_interview_protocol TEXT,
  safety_plan TEXT, review_date TEXT,
  status TEXT DEFAULT 'Active',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS medication_stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, medication_name TEXT NOT NULL,
  form TEXT DEFAULT 'Tablet', strength TEXT,
  prescriber TEXT, pharmacy TEXT,
  quantity_received INTEGER, date_received TEXT,
  quantity_current INTEGER, date_checked TEXT,
  checked_by INTEGER, discrepancy TEXT,
  expiry_date TEXT, controlled INTEGER DEFAULT 0,
  disposal_date TEXT, disposal_witness INTEGER,
  notes TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS prn_protocols (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER, medication_name TEXT NOT NULL,
  dose TEXT, route TEXT DEFAULT 'Oral',
  indication TEXT, max_dose_24h TEXT,
  min_interval TEXT, prescriber TEXT,
  gp_authorisation_date TEXT,
  special_instructions TEXT,
  review_date TEXT, status TEXT DEFAULT 'Active',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS night_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, time TEXT NOT NULL,
  staff_id INTEGER, child_id INTEGER,
  status TEXT DEFAULT 'Asleep',
  presentation TEXT, concerns TEXT,
  action_taken TEXT,
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
CREATE TABLE IF NOT EXISTS policy_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER, version INTEGER,
  change_summary TEXT, changed_by INTEGER,
  approved_by INTEGER, effective_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES documents(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS digital_signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_type TEXT NOT NULL, record_id INTEGER NOT NULL,
  signer_id INTEGER NOT NULL, role TEXT,
  statement TEXT DEFAULT 'I confirm this record is accurate',
  signed_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT,
  FOREIGN KEY (signer_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS governance_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT DEFAULT 'Governance Meeting',
  source_id INTEGER, date TEXT NOT NULL,
  action TEXT NOT NULL, owner TEXT,
  target_date TEXT, priority TEXT DEFAULT 'Medium',
  progress TEXT, evidence TEXT,
  status TEXT DEFAULT 'Open',
  created_by INTEGER, created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  manager_id INTEGER,
  tusla_reg TEXT,
  capacity INTEGER,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (manager_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY,
  job_title TEXT,
  site_id INTEGER,
  supervisor_id INTEGER,
  phone TEXT,
  garda_vetting_expiry TEXT,
  force_password_change INTEGER DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  assigned_user_id INTEGER,
  assigned_role_id INTEGER,
  site_id INTEGER,
  frequency TEXT NOT NULL,
  due_date TEXT,
  reminder_days INTEGER DEFAULT 7,
  escalation_route TEXT,
  evidence_required INTEGER DEFAULT 0,
  notes TEXT,
  archived INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (assigned_user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_role_id) REFERENCES roles(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS task_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recurring_task_id INTEGER NOT NULL,
  assigned_user_id INTEGER,
  due_date TEXT,
  status TEXT DEFAULT 'Pending',
  completed_at TEXT,
  completed_by INTEGER,
  completion_notes TEXT,
  evidence_ref TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (recurring_task_id) REFERENCES recurring_tasks(id),
  FOREIGN KEY (assigned_user_id) REFERENCES users(id),
  FOREIGN KEY (completed_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_by INTEGER,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
`);

// Seed roles
const roles = [
  [1,'Staff',1],[2,'Team Lead',2],[3,'PIC',3],[4,'Compliance Officer',4],[5,'Director',5]
];
const insertRole = db.prepare('INSERT OR IGNORE INTO roles (id,name,level) VALUES (?,?,?)');
roles.forEach(r => insertRole.run(...r));

// Seed sites
const insertSite = db.prepare('INSERT OR IGNORE INTO sites (id,name,address,tusla_reg,capacity) VALUES (?,?,?,?,?)');
const sites = [
  [1, 'Silverwings Centre', 'Navan, Co. Meath', 'TUS-10293', 4],
  [2, 'Oakridge House', 'Dundalk, Co. Louth', 'TUS-10304', 3]
];
sites.forEach(s => insertSite.run(...s));

// Seed demo users
const hash = bcrypt.hashSync('Chosanta2025!', 10);
const insertUser = db.prepare('INSERT OR IGNORE INTO users (email,password_hash,full_name,role_id) VALUES (?,?,?,?)');
[
  ['director@chosanta.com',hash,'Ian McKeown',5],
  ['pic@chosanta.com',hash,'Sarah Murphy',3],
  ['teamlead@chosanta.com',hash,'Conor Byrne',2],
  ['staff1@chosanta.com',hash,'Emma Kelly',1],
  ['staff2@chosanta.com',hash,'Liam O\'Brien',1],
  ['compliance@chosanta.com',hash,'Aoife Nolan',4],
].forEach(u => insertUser.run(...u));

// Add ref_code, hiqa_ref, file_path columns if missing
try { db.exec(`ALTER TABLE documents ADD COLUMN ref_code TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE documents ADD COLUMN hiqa_ref TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE documents ADD COLUMN file_path TEXT`); } catch(e) {}

// Add policy_version workflow columns if missing
try { db.exec(`ALTER TABLE policy_versions ADD COLUMN status TEXT DEFAULT 'Draft'`); } catch(e) {}
try { db.exec(`ALTER TABLE policy_versions ADD COLUMN reviewed_by INTEGER`); } catch(e) {}
try { db.exec(`ALTER TABLE policy_versions ADD COLUMN review_date TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE policy_versions ADD COLUMN review_notes TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE policy_versions ADD COLUMN board_approved_by INTEGER`); } catch(e) {}
try { db.exec(`ALTER TABLE policy_versions ADD COLUMN board_approval_date TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE policy_versions ADD COLUMN board_notes TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE policy_versions ADD COLUMN is_active INTEGER DEFAULT 0`); } catch(e) {}

// ═══ AUDIT HARDENING — ip_address + user_role on audit_trail ═══
try { db.exec(`ALTER TABLE audit_trail ADD COLUMN ip_address TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE audit_trail ADD COLUMN user_role TEXT`); } catch(e) {}

// ═══ TIMESTAMP HARDENING — updated_at on ALL tables ═══
const tablesNeedingUpdatedAt = [
  'users','children','incidents','handovers','visitors','admissions',
  'keyworking_sessions','maintenance_records','training_records',
  'staff_attendance','supervision_records','hs_inspections','medication_audits',
  'room_searches','complaints','compliments','governance_minutes','daily_log',
  'mar_records','sen_register','children_register','petty_cash','staff_roster',
  'compliance_reviews','child_risk_assessments','care_plans','education_contacts',
  'house_risk_assessments','risk_register','missing_chronology','peeps','qip',
  'staff_induction','staff_appraisals','fire_equipment','restrictive_practices',
  'safeguarding_referrals','child_participation','absence_plans',
  'medication_stock','prn_protocols','night_checks','governance_actions','sites'
];
tablesNeedingUpdatedAt.forEach(t => {
  try { db.exec(`ALTER TABLE ${t} ADD COLUMN updated_at TEXT`); } catch(e) {}
  try { db.exec(`ALTER TABLE ${t} ADD COLUMN updated_by INTEGER`); } catch(e) {}
});

// ═══ MISSING created_by on risk_register + fire_equipment ═══
try { db.exec(`ALTER TABLE risk_register ADD COLUMN created_by INTEGER`); } catch(e) {}
try { db.exec(`ALTER TABLE fire_equipment ADD COLUMN created_by INTEGER`); } catch(e) {}

// Seed all Tusla documents — titles match exact PDF headings
const insertDoc = db.prepare(`INSERT OR IGNORE INTO documents (title, category, status, owner_id, review_date, version, ref_code, hiqa_ref, notes, file_path) VALUES (?,?,?,?,?,?,?,?,?,?)`);
const docCount = db.prepare('SELECT COUNT(*) as c FROM documents').get().c;
if (docCount === 0) {
  const D = (t,c,r,h,n,f) => insertDoc.run(t,c,'Active',1,'2026-11-01',1,r,h,n,f||null);
  // ═══ SAFEGUARDING ═══
  D('Child Safeguarding Policy','Safeguarding','CM-CSP-001','HIQA Standard 2 · Children First Act 2015','DLP: PIC. DDLP: Team Lead.','child-safeguarding-policy.html');
  D('Child Safeguarding Statement','Safeguarding','CM-CSS-001','Children First Act 2015 s.11','Publicly displayed. Reviewed annually.','child-safeguarding-statement.html');
  D('Child Safeguarding Risk Assessment','Safeguarding','CM-CSRA-001','Children First Act 2015 s.11','Harm risks and mitigations.','child-safeguarding-risk-assessment.html');
  D('Safeguarding & Protection of Vulnerable Adults','Safeguarding','CM-SPP-001','HIQA Standard 2 · Tusla','Safeguarding procedures.','safeguarding-protection-policy.html');
  D('Safeguarding Vulnerable Adults Policy','Safeguarding','CM-SVA-001','HSE National Policy 2014','Adult safeguarding.','safeguarding-vulnerable-adults.html');
  D('Child Risk Assessment Sample','Safeguarding','CM-CRA-001','HIQA Standard 2','Individual child risk template.','child-risk-assessment-sample.html');
  D('Child Protection Incident / Concern Report Form','Safeguarding','CM-CPIR-001','Children First Act 2015','Mandated reporting form.','child-protection-incident-report.html');
  D("Children's Participation & Rights Policy",'Safeguarding','CM-CPR-001','HIQA Standard 1 · UNCRC','Child voice, participation, EPIC.','childrens-participation-policy.html');
  // ═══ GOVERNANCE ═══
  D('Governance Policy','Governance','CM-GOV-001','HIQA Standard 5 · S.I. 674/2017','Structure, oversight.','governance-policy.html');
  D('Governance Structure & Organisational Chart','Governance','CM-GSO-001','HIQA Standard 5','Org chart.','governance-structure-orgchart.html');
  D('Management Structure','Governance','CM-MGT-001','HIQA Standard 5','Roles and responsibilities.','management-structure.html');
  D('Statement of Purpose','Governance','CM-SOP-001','S.I. 674/2017 Article 3','Centre aims, objectives.','hiqa-statement-of-purpose.html');
  D('Tusla Compliance Policy Bundle','Governance','CM-TCB-001','Tusla Registration','Compliance bundle.','tusla-compliance-bundle.html');
  D('Tusla Policy Submission Pack','Governance','CM-TSP-001','Tusla Registration','Registration documents.','tusla-submission-pack.html');
  D('Governance & Compliance Meeting Minutes','Governance','CM-GMM-001','HIQA Standard 5','Meeting minutes template.','governance-meeting-minutes.html');
  D('Inspection Evidence Folder','Governance','CM-IEF-001','HIQA Standards 2018','Evidence index.','inspection-evidence-index.html');
  // ═══ RISK MANAGEMENT ═══
  D('Risk Management Policy','Risk Management','CM-RMP-001','HIQA Standard 3 · S.I. 674/2017','Risk framework.','risk-management-policy.html');
  D('Risk Register','Risk Management','CM-RRR-001','HIQA Standard 3','Live risk register.','risk-register-responsibilities.html');
  D('Risk Register & Index','Risk Management','CM-RRI-001','HIQA Standard 3','Master index.','risk-register.html');
  D('House Risk Assessment','Risk Management','CM-HRA-001','HIQA Standard 3','Environment risk.','house-risk-assessment.html');
  // ═══ STAFF & HR ═══
  D('Recruitment & Safer Hiring Framework','Staff & HR','CM-SRP-001','HIQA Standard 6 · S.I. 674/2017','Safer recruitment.','recruitment-safer-hiring.html');
  D('Staff Recruitment, Vetting & Induction','Staff & HR','CM-RVI-001','HIQA Standard 6','Vetting procedures.','staff-recruitment-vetting-induction.html');
  D('Staff Supervision & Performance Management','Staff & HR','CM-SSP-001','HIQA Standard 6','Formal supervision.','staff-supervision-performance-policy.html');
  D('Staff Supervision Record','Staff & HR','CM-SSR-001','HIQA Standard 6','Session template.','staff-supervision-record.html');
  D('Code of Behaviour for Staff','Staff & HR','CM-COB-001','HIQA Standard 6','Conduct standards.','code-of-behaviour.html');
  // ═══ TRAINING ═══
  D('Training Governance & Compliance Matrix','Training','CM-TGM-001','HIQA Standard 6','Training matrix.','training-governance-matrix.html');
  // ═══ CARE PLANNING ═══
  D('Service User Rights & Advocacy Policy','Care Planning','CM-SRA-001','HIQA Standard 1 · UNCRC','Rights, participation.','service-user-rights-advocacy.html');
  D('Social, Recreational & Community Participation','Care Planning','CM-SRC-001','HIQA Standard 1','Community integration.','social-recreational-community.html');
  D('Education Arrangements','Care Planning','CM-EDU-001','HIQA Standard 1 · Education Act','TUSLA-ESA liaison.','education-arrangements.html');
  D('Education Compliance Toolkit','Care Planning','CM-ECT-001','HIQA Standard 1','Education compliance.','education-compliance-toolkit.html');
  D('Healthcare Provision','Care Planning','CM-HCP-001','HIQA Standard 1','GP, health assessments.','healthcare-provision.html');
  D('Nutrition & Hydration Policy','Care Planning','CM-NHP-001','HIQA Standard 1','Dietary needs.','nutrition-hydration-policy.html');
  D('Intimate Care Policy','Care Planning','CM-ICP-001','HIQA Standard 2','Dignity, privacy.','intimate-care-policy.html');
  D('End of Life Care Policy','Care Planning','CM-EOL-001','HIQA Standard 1','End of life care.','end-of-life-care-policy.html');
  D('Statutory Care Plan','Care Planning','CM-SCP-001','S.I. 259/1995 · HIQA Standard 2','Placement plan.','care-plan-placement-plan.html');
  D('Keyworking Session Record','Care Planning','CM-KSR-001','HIQA Standard 4','Keyworking contacts.','keyworking-healthcare-education-contacts.html');
  // ═══ COMMUNICATION ═══
  D('Communication Policy','Policies & Procedures','CM-COM-001','HIQA Standard 4','GDPR.','communication-policy.html');
  // ═══ COMPLAINTS & FEEDBACK ═══
  D('Complaints Policy','Complaints & Feedback','CM-CMP-001','HIQA Standard 4 · S.I. 674/2017','Complaints procedure.','complaints-policy.html');
  D('Complaints Log & Monthly Review','Complaints & Feedback','CM-CLR-001','HIQA Standard 4','Monthly quality audit.','complaints-review-quality-audit.html');
  // ═══ MEDICATION ═══
  D('Medication Management Policy','Medication','CM-MMP-001','HIQA Standard 1 · Pharmacy Act','MAR, controlled drugs.','medication-management-policy.html');
  D('Medication Audit','Medication','CM-MAD-001','HIQA Standard 1','Monthly audit.','medication-audit-fire-drill-log.html');
  // ═══ FIRE & HEALTH SAFETY ═══
  D('Health & Safety Policy','Fire & Health Safety','CM-HSP-001','Safety, Health & Welfare at Work Act 2005','H&S policy.','health-safety-policy.html');
  D('Fire Safety & Evacuation Procedure','Fire & Health Safety','CM-FSE-001','Fire Services Acts 1981/2003','PEEP, fire drills.','fire-safety-evacuation-procedure.html');
  D('Emergency Evacuation Plan','Fire & Health Safety','CM-EEP-001','Fire Services Acts 1981/2003','Evacuation procedures.','emergency-evacuation-plan.html');
  D('Infection Prevention & Control Policy','Fire & Health Safety','CM-IPC-001','HIQA Standard 1 · HSE IPC','Cleaning, outbreaks.','infection-prevention-control.html');
  D('Weekly Health & Safety Inspection','Fire & Health Safety','CM-WHI-001','Safety, Health & Welfare Act 2005','Weekly checklist.','health-safety-inspection-log.html');
  // ═══ INCIDENT MANAGEMENT ═══
  D('Incident Reporting Procedure','Incident Management','CM-IRP-001','HIQA Standard 3 · Tusla NIMS','SEN, NIMS.','incident-reporting-procedure.html');
  D('Positive Behaviour Support & Restrictive Practice Policy','Incident Management','CM-PBS-001','HIQA Standard 3 · TCI Model','PBS, TCI.','pbs-restrictive-practice-policy.html');
  D('Emergency Placement Procedure','Emergency Placement','CM-EPP-001','Child Care Act 1991 s.12/s.13','Emergency admission.','emergency-placement-procedure.html');
  D('Missing Child / Absconding Procedure','Incident Management','CM-MCA-001','Tusla/AGS Joint Protocol','15-min AGS.','missing-child-absconding-procedure.html');
  // ═══ INSPECTION EVIDENCE ═══
  D('Personal Evacuation Plan (PEEP)','Inspection Evidence','CM-PEP-001','Fire Services Acts','PEEP templates.','operational-templates.html');
  // ═══ LOGBOOKS ═══
  D('Incident & Near Miss Log','Templates & Forms','CM-IML-001','Tusla NIMS · HIQA Standard 3','CMS: Incidents.','incident-near-miss-log.html');
  D('Daily Shift Handover Log','Templates & Forms','CM-DSH-001','HIQA Standards 3 & 5','CMS: Handover.','daily-shift-handover-log.html');
  D('Visitor Access Log','Templates & Forms','CM-VAL-001','HIQA Standard 3','CMS: Visitors.','visitor-log.html');
  D('Restrictive Practice Log','Templates & Forms','CM-RPL-001','HIQA Standard 3 · TCI','CMS: Restrictive.','restrictive-practice-log.html');
  D('Missing Child Chronology & Return Interview','Templates & Forms','CM-MCC-001','Tusla/AGS Joint Protocol','CMS: Missing.','missing-child-chronology-log.html');
  D('Admissions & Discharge Log','Templates & Forms','CM-ADL-001','S.I. 259/1995','CMS: Admissions.','admissions-discharge-log.html');
  D('Sanctions & Consequences Log','Templates & Forms','CM-SCL-001','HIQA Standard 3 · UNCRC','CMS: Sanctions.','sanctions-consequences-log.html');
  D('Keyworking Session Log','Templates & Forms','CM-KWS-001','HIQA Standard 4','CMS: Keyworking.','keyworking-session-log.html');
  D('On-Call & Escalation Log','Templates & Forms','CM-OCE-001','HIQA Standard 5','CMS: On-Call.','on-call-escalation-log.html');
  D('Staff Attendance, Sick Leave & Staffing Stability Log','Templates & Forms','CM-SAL-001','HIQA Standard 6','Attendance.','staff-attendance-sick-leave-log.html');
  D('Training Attendance & Sign-Off','Templates & Forms','CM-TAS-001','HIQA Standard 6','Competency sheets.','training-attendance-sign-off.html');
  D('Maintenance & Repairs Log','Templates & Forms','CM-MRL-001','HIQA Standard 7','Maintenance.','maintenance-repairs-log.html');
  D('Compliments & Feedback Log','Templates & Forms','CM-CPF-001','HIQA Standard 4','Positive feedback.','compliments-feedback-log.html');
  D('Room Search & Contraband Log','Templates & Forms','CM-RSC-001','HIQA Standard 3','Room search.','room-search-contraband-log.html');
  // ═══ NEW POLICIES (June 2026) ═══
  D('Whistleblowing Policy','Governance','CM-WBP-001','Protected Disclosures Act 2014','Reporting concerns, protection for disclosers.','whistleblowing-policy.pdf');
  D('Allegations Against Staff Procedure','Staff & HR','CM-AAS-001','Children First Act 2015 · HIQA Standard 6','Managing allegations, interim measures, investigation.','allegations-against-staff-procedure.pdf');
  D('Anti-Bullying Policy','Safeguarding','CM-ABP-001','HIQA Standard 2 · UNCRC','Prevention, response, peer-on-peer abuse.','anti-bullying-policy.pdf');
  D('Business Continuity Plan','Governance','CM-BCP-001','HIQA Standard 5','Emergency planning, service continuity.','business-continuity-plan.pdf');
  D('Children First Safeguarding & Child Protection Policy','Safeguarding','CM-CF-001','Children First Act 2015','Mandated reporting, DLP, child protection.','children-first-safeguarding-policy.pdf');
  D('Family Contact & Access Policy','Care Planning','CM-FCA-001','Child Care Act 1991 · HIQA Standard 1','Family visits, supervised access, communication.','family-contact-access-policy.pdf');
  D('GDPR & Data Protection Policy','Policies & Procedures','CM-GDP-001','GDPR · Data Protection Act 2018','Data processing, retention, subject access requests.','gdpr-data-protection-policy.pdf');
  D('Online Safety, Mobile Phone & Internet Use Policy','Safeguarding','CM-OSP-001','HIQA Standard 2','Online safety, device management, e-safety.','online-safety-policy.pdf');
  D('Placement Matching & Admissions Policy','Care Planning','CM-PMA-001','S.I. 259/1995 · HIQA Standard 2','Matching criteria, impact assessments, admission process.','placement-matching-admissions-policy.pdf');
  D('Self-Harm & Suicide Risk Management Policy','Safeguarding','CM-SHR-001','HIQA Standard 2 · Connecting for Life','Risk assessment, safety planning, postvention.','self-harm-suicide-risk-policy.pdf');
  D('Substance Misuse Policy','Safeguarding','CM-SMP-001','HIQA Standard 2','Drug/alcohol awareness, response procedures.','substance-misuse-policy.pdf');
  D('Vehicle & Transport Risk Policy','Fire & Health Safety','CM-VTR-001','Safety, Health & Welfare at Work Act 2005','Vehicle checks, transport risk, insurance.','vehicle-transport-risk-policy.pdf');
  // ═══ NEW POLICIES (July 2026) ═══
  D('Food Safety & HACCP Records Policy','Fire & Health Safety','CM-FSH-001','HIQA Standard 6 · FSAI Regulations','Food safety procedures, HACCP record keeping, kitchen hygiene.','food-safety-haccp-records-policy.pdf');
  D('Exit & Transition Planning Procedure','Care Planning','CM-ETP-001','HIQA Standard 4 · Child Care Act 1991','Discharge planning, aftercare, transition support.','exit-transition-planning-procedure.pdf');
  D('Individual Placement Plan Procedure','Care Planning','CM-IPP-001','HIQA Standard 3 · S.I. 259/1995','Individual placement planning, objectives, review.','individual-placement-plan-procedure.pdf');
  D('Young Person Welcome Pack & Orientation Policy','Care Planning','CM-YPW-001','HIQA Standard 1 · UNCRC','Welcome pack, orientation process, settling in.','young-person-welcome-pack-orientation.pdf');
  D('Designated Liaison Person (DLP) Role & Responsibilities','Safeguarding','CM-DLP-001','Children First Act 2015 · HIQA Standard 2','DLP appointment, duties, mandated reporting.','designated-liaison-person-dlp.pdf');
  D('Fair Street Policy Suite','Policies & Procedures','CM-FSP-002','HIQA Standards','Comprehensive policy suite for Fair Street.','fair-street-policy-suite.pdf');
}

// Seed demo children
const insertChild = db.prepare(`INSERT OR IGNORE INTO children
  (ref_code,first_name,last_name,dob,gender,legal_status,social_worker,tusla_area,admission_date,keyworker_id)
  VALUES (?,?,?,?,?,?,?,?,?,?)`);
[
  ['CYP-001','A.','Murphy','2010-03-15','Male','Section 18','Claire Daly','Louth/Meath','2025-01-10',4],
  ['CYP-002','B.','Kelly','2009-07-22','Female','Section 4','Mark Ryan','Dublin North','2025-02-18',5],
  ['CYP-003','C.','Walsh','2011-11-03','Male','Section 12','Jane Brennan','Louth/Meath','2025-04-01',4],
].forEach(c => insertChild.run(...c));

// Seed default recurring tasks
const taskCount = db.prepare('SELECT COUNT(*) as c FROM recurring_tasks').get().c;
if (taskCount === 0) {
  const rt = db.prepare(`INSERT INTO recurring_tasks (task_name,category,assigned_role_id,site_id,frequency,due_date,escalation_route,evidence_required,created_by) VALUES (?,?,?,?,?,?,?,?,?)`);
  const T = (n,c,r,s,f,d,e,ev) => rt.run(n,c,r,s,f,d,e,ev,1);
  const nextMonth = new Date(); nextMonth.setDate(nextMonth.getDate() + 30); const nms = nextMonth.toISOString().split('T')[0];
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7); const nws = nextWeek.toISOString().split('T')[0];
  const nextQ = new Date(); nextQ.setDate(nextQ.getDate() + 90); const nqs = nextQ.toISOString().split('T')[0];
  const nextY = new Date(); nextY.setDate(nextY.getDate() + 365); const nys = nextY.toISOString().split('T')[0];
  
  T('Staff Supervision', 'Staffing', 3, null, 'Every 6 Weeks', nms, 'Director', 1);
  T('Fire Drill & Alarm Test', 'Safety', 3, 1, 'Monthly', nms, 'Director', 1);
  T('Medication Audit', 'Medication', 3, 1, 'Monthly', nms, 'Director', 1);
  T('Governance Meeting', 'Governance', 5, null, 'Monthly', nms, 'Board', 1);
  T('Quality Audit', 'Governance', 4, null, 'Quarterly', nqs, 'Director', 1);
  T('Policy Review', 'Governance', 5, null, 'Annually', nys, 'Board', 1);
  T('Training Refresher Reminders', 'Staffing', 4, null, 'Monthly', nms, 'Director', 0);
  T('Garda Vetting Renewal Tracking', 'Staffing', 4, null, 'Monthly', nms, 'Director', 0);
  T('Care Plan Review Schedule', 'Care Planning', 2, null, 'Monthly', nms, 'PIC', 0);
  T('Risk Assessment Review Schedule', 'Risk Management', 3, null, 'Quarterly', nqs, 'Director', 1);
  T('PEEP Review Schedule', 'Safety', 3, null, 'Quarterly', nqs, 'Director', 1);
  T('Maintenance Checks', 'Safety', 3, 1, 'Weekly', nws, 'Director', 0);
  T('Complaints Review', 'Governance', 3, null, 'Monthly', nms, 'Director', 1);
  T('Incident Trend Review', 'Governance', 3, null, 'Monthly', nms, 'Director', 1);
  T('QIP Review', 'Governance', 4, null, 'Quarterly', nqs, 'Director', 1);
}

export default db;
