// Maps document file_path (HTML filenames from DB) → PDF filenames in /policies/
const policyPdfMap = {
  'admissions-discharge-log.html': 'Chosanta_Admissions_Discharge_Log.pdf',
  'care-plan-placement-plan.html': 'Chosanta_Care_Plan_Placement_Plan.pdf',
  'child-protection-incident-report.html': 'Chosanta_Child_Protection_Incident_Report.pdf',
  'child-risk-assessment-sample.html': 'Chosanta_Child_Risk_Assessment_Sample.pdf',
  'child-risk-assessment.html': 'chosanta_risk_assessment_policy_complete.pdf',
  'child-safeguarding-policy.html': 'Chosanta_Child_Safeguarding_Policy.pdf',
  'child-safeguarding-risk-assessment.html': 'Chosanta_Child_Safeguarding_Risk_Assessment.pdf',
  'child-safeguarding-statement.html': 'Chosanta_Child_Safeguarding_Statement.pdf',
  'childrens-participation-policy.html': 'Chosanta_Childrens_Participation_Policy.pdf',
  'code-of-behaviour.html': 'Chosanta_Code_of_Behaviour_Staff.pdf',
  'communication-policy.html': 'Chosanta_Communication_Policy (1).pdf',
  'complaints-policy.html': 'Chosanta_Complaints_Policy.pdf',
  'complaints-review-quality-audit.html': 'Chosanta_Complaints_Review_Quality_Audit.pdf',
  'compliments-feedback-log.html': 'Chosanta_Compliments_Feedback_Log.pdf',
  'daily-shift-handover-log.html': 'Chosanta_Daily_Shift_Handover.pdf',
  'education-arrangements.html': 'Chosanta_Education_Arrangements.pdf',
  'education-compliance-toolkit.html': 'Chosanta_Education_Compliance_Toolkit.pdf',
  'emergency-evacuation-plan.html': 'Chosanta_Emergency_Evacuation_Plan (1).pdf',
  'emergency-placement-procedure.html': 'Chosanta_Emergency_Placement_Procedure.pdf',
  'end-of-life-care-policy.html': 'Chosanta_End_of_Life_Care_Policy.pdf',
  'fire-safety-evacuation-procedure.html': 'Chosanta_Fire_Safety_Evacuation_Procedure.pdf',
  'governance-meeting-minutes.html': 'Chosanta_Governance_Meeting_Minutes.pdf',
  'governance-policy.html': 'Chosanta_Governance_Policy.pdf',
  'governance-structure-orgchart.html': 'Chosanta_Governance_Structure.pdf',
  'health-safety-inspection-log.html': 'Chosanta_Health_Safety_Inspection.pdf',
  'health-safety-policy.html': 'Chosanta_Health_Safety_Policy.pdf',
  'healthcare-provision.html': 'Chosanta_Healthcare_Provision.pdf',
  'hiqa-statement-of-purpose.html': 'Chosanta_HIQA_Statement_of_Purpose.pdf',
  'house-risk-assessment.html': 'Chosanta_House_Risk_Assessment.pdf',
  'incident-near-miss-log.html': 'Chosanta_Incident_Near_Miss_Log.pdf',
  'incident-reporting-procedure.html': 'Chosanta_Incident_Reporting_Procedure.pdf',
  'infection-prevention-control.html': 'Chosanta_Infection_Prevention_Control.pdf',
  'inspection-evidence-index.html': 'Chosanta_Inspection_Evidence_Index.pdf',
  'intimate-care-policy.html': 'Chosanta_Intimate_Care_Policy.pdf',
  'keyworking-healthcare-education-contacts.html': 'Chosanta_Keyworking_Session_Log.pdf',
  'keyworking-session-log.html': 'Chosanta_Keyworking_Session_Log.pdf',
  'maintenance-repairs-log.html': 'Chosanta_Maintenance_Repairs_Log.pdf',
  'management-structure.html': 'Chosanta_Management_Structure.pdf',
  'medication-audit-fire-drill-log.html': 'Chosanta_Medication_Audit_FireDrill.pdf',
  'medication-management-policy.html': 'Chosanta_Medication_Management_Policy.pdf',
  'missing-child-absconding-procedure.html': 'Chosanta_Missing_Child_Absconding_Procedure.pdf',
  'missing-child-chronology-log.html': 'Chosanta_Missing_Child_Chronology.pdf',
  'nutrition-hydration-policy.html': 'Chosanta_Nutrition_Hydration_Policy.pdf',
  'on-call-escalation-log.html': 'Chosanta_OnCall_Escalation_Log.pdf',
  'operational-templates.html': 'Chosanta_Operational_Templates.pdf',
  'pbs-restrictive-practice-policy.html': 'Chosanta_PBS_Restrictive_Practice_Policy.pdf',
  'recruitment-safer-hiring.html': 'Chosanta_Recruitment_Safer_Hiring.pdf',
  'restrictive-practice-log.html': 'Chosanta_Restrictive_Practice_Log.pdf',
  'risk-management-policy.html': 'Chosanta_Risk_Management_Policy.pdf',
  'risk-register.html': 'Chosanta_Risk_Register.pdf',
  'risk-register-responsibilities.html': 'Chosanta_Risk_Register_Responsibilities.pdf',
  'room-search-contraband-log.html': 'Chosanta_Room_Search_Contraband_Log.pdf',
  'safeguarding-protection-policy.html': 'Chosanta_Safeguarding_Protection_Policy.pdf',
  'safeguarding-vulnerable-adults.html': 'Chosanta_Safeguarding_Vulnerable_Adults.pdf',
  'sanctions-consequences-log.html': 'Chosanta_Sanctions_Consequences_Log (2).pdf',
  'service-user-rights-advocacy.html': 'Chosanta_Service_User_Rights_Advocacy.pdf',
  'silverwings-policy-suite.html': 'Chosanta_Silverwings_Policy_Suite.pdf',
  'silverwings-statement-of-purpose.html': 'Chosanta_Silverwings_Policy_Suite.pdf',
  'social-recreational-community.html': 'Chosanta_Social_Recreational_Community.pdf',
  'staff-attendance-sick-leave-log.html': 'Chosanta_Staff_Attendance_Sick_Leave.pdf',
  'staff-recruitment-vetting-induction.html': 'Chosanta_Staff_Recruitment_Vetting_Induction.pdf',
  'staff-supervision-performance-policy.html': 'Chosanta_Staff_Supervision_Performance_Policy.pdf',
  'staff-supervision-record.html': 'Chosanta_Staff_Supervision_Record.pdf',
  'training-attendance-sign-off.html': 'Chosanta_Training_Attendance_Sign_Off.pdf',
  'training-governance-matrix.html': 'Chosanta_Training_Governance_Matrix.pdf',
  'tusla-compliance-bundle.html': 'Chosanta_Tusla_Compliance_Bundle.pdf',
  'tusla-submission-pack.html': 'Chosanta_Tusla_Submission_Pack.pdf',
  'visitor-log.html': 'Chosanta_Visitor_Log.pdf',
  // ═══ NEW POLICIES (June 2026) ═══
  'whistleblowing-policy.pdf': 'Whistleblowing Policy.pdf',
  'allegations-against-staff-procedure.pdf': 'Allegations Against Staff Procedure.pdf',
  'anti-bullying-policy.pdf': 'Anti-Bullying Policy.pdf',
  'business-continuity-plan.pdf': 'Business Continuity Plan.pdf',
  'children-first-safeguarding-policy.pdf': 'Children First Safeguarding and Child Protection Policy.pdf',
  'family-contact-access-policy.pdf': 'Family Contact and Access Policy.pdf',
  'gdpr-data-protection-policy.pdf': 'GDPR and Data Protection Policy.pdf',
  'online-safety-policy.pdf': 'Online Safety, Mobile Phone and Internet Use Policy.pdf',
  'placement-matching-admissions-policy.pdf': 'Placement Matching and Admissions Policy.pdf',
  'self-harm-suicide-risk-policy.pdf': 'Self-Harm & Suicide Risk Management Policy.pdf',
  'substance-misuse-policy.pdf': 'Substance Misuse Policy.pdf',
  'vehicle-transport-risk-policy.pdf': 'Vehicle and Transport Risk Policy.pdf',
  // ═══ NEW POLICIES (July 2026) ═══
  'food-safety-haccp-records-policy.pdf': 'Food Safety  HACCP Records Policy.pdf',
  'exit-transition-planning-procedure.pdf': 'Exit & Transition Planning Procedure.pdf',
  'individual-placement-plan-procedure.pdf': 'Individual Placement Plan Procedure.pdf',
  'young-person-welcome-pack-orientation.pdf': 'Young Person Welcome Pack & Orientation Policy.pdf',
  'designated-liaison-person-dlp.pdf': 'Designated Liaison Person (DLP) Role & Responsibilities.pdf',
};

/**
 * Resolves a document's file_path (HTML filename from DB) to a viewable PDF URL.
 * Returns null if no mapping exists.
 */
export function getPolicyUrl(filePath) {
  if (!filePath) return null;
  const pdfName = policyPdfMap[filePath];
  if (pdfName) {
    return `/policies/${encodeURIComponent(pdfName)}`;
  }
  // Fallback: if the file_path is already a PDF or unknown, try it directly
  return `/policies/${encodeURIComponent(filePath)}`;
}

export default policyPdfMap;
