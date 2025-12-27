// User Types
export type UserRole = 'user' | 'asha_worker' | 'ngo_partner' | 'health_supervisor'
export type AccountStatus = 'active' | 'suspended' | 'pending_verification' | 'deleted'
export type PregnancyStage = 'not_pregnant' | 'first_trimester' | 'second_trimester' | 'third_trimester' | 'postnatal' | 'planning'
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'
export type AnemiaStatus = 'none' | 'mild' | 'moderate' | 'severe' | 'unknown'
export type MenstrualFlow = 'light' | 'medium' | 'heavy' | 'very_heavy' | 'spotting'
export type MoodType = 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad' | 'anxious' | 'stressed'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency'
export type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'false_alarm'
export type AlertType = 'emergency_sos' | 'red_flag_symptom' | 'missed_checkup' | 'abnormal_vitals' | 'mental_health_concern' | 'severe_bleeding' | 'severe_pain'
export type VaccinationStatus = 'scheduled' | 'completed' | 'missed' | 'rescheduled'
export type VisitStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type ReferralStatus = 'pending' | 'accepted' | 'completed' | 'cancelled'
export type ReferralUrgency = 'routine' | 'urgent' | 'emergency'
export type AudioLessonCategory = 'menstrual_health' | 'pregnancy' | 'nutrition' | 'mental_health' | 'puberty' | 'hygiene' | 'danger_signs'

// User Interface
export interface AshaUser {
  id: string
  auth_id: string | null
  phone_number: string | null
  alternate_contact: string | null
  role: UserRole
  full_name: string | null
  display_name: string | null
  profile_photo_url: string | null
  age: number | null
  preferred_language: string
  voice_speed: number
  enable_auto_delete: boolean
  auto_delete_days: number
  account_status: AccountStatus
  is_shared_device: boolean
  last_privacy_review_at: string | null
  onboarding_completed: boolean
  last_active_at: string | null
  total_voice_interactions: number
  created_at: string
  updated_at: string
}

// User Profile Interface
export interface AshaUserProfile {
  id: string
  user_id: string
  linked_asha_id: string | null
  date_of_birth: string | null
  education_level: string | null
  marital_status: string | null
  is_currently_pregnant: boolean
  pregnancy_stage: PregnancyStage
  last_period_date: string | null
  expected_delivery_date: string | null
  current_pregnancy_week: number | null
  average_cycle_length: number
  last_menstrual_flow: MenstrualFlow | null
  menstrual_pain_level: number | null
  has_irregular_cycles: boolean
  blood_group: BloodGroup
  anemia_status: AnemiaStatus
  last_hemoglobin_level: number | null
  hemoglobin_test_date: string | null
  previous_pregnancies: number
  previous_live_births: number
  previous_miscarriages: number
  previous_complications: string | null
  chronic_conditions: string[] | null
  allergies: string[] | null
  current_medications: string[] | null
  is_high_risk: boolean
  risk_factors: string[] | null
  ai_calculated_risk_score: number | null
  last_risk_assessment_date: string | null
  village: string | null
  block: string | null
  district: string | null
  state: string
  pin_code: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relation: string | null
  ifa_tablets_provided: boolean
  ifa_start_date: string | null
  ifa_reminders_enabled: boolean
  created_at: string
  updated_at: string
}

// Menstrual Cycle Interface
export interface MenstrualCycle {
  id: string
  user_id: string
  period_start_date: string
  period_end_date: string | null
  cycle_length: number | null
  flow_intensity: MenstrualFlow | null
  pain_level: number | null
  symptoms: Record<string, unknown> | null
  is_predicted: boolean
  predicted_next_period: string | null
  predicted_fertile_window_start: string | null
  predicted_fertile_window_end: string | null
  voice_note_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Health Log Interface
export interface HealthLog {
  id: string
  user_id: string
  logged_by_user_id: string | null
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
  weight_kg: number | null
  temperature_celsius: number | null
  heart_rate_bpm: number | null
  fetal_movement_count: number | null
  swelling_location: string[] | null
  symptoms: Record<string, unknown> | null
  symptom_severity: string | null
  mood: MoodType | null
  energy_level: number | null
  appetite: string | null
  sleep_quality: number | null
  voice_note_url: string | null
  voice_transcription: string | null
  user_spoken_language: string | null
  is_red_flag: boolean
  red_flag_reasons: string[] | null
  ai_risk_score: number | null
  ai_recommendation: string | null
  is_emergency: boolean
  emergency_triggered_at: string | null
  log_date: string
  created_at: string
}

// Alert Interface
export interface AshaAlert {
  id: string
  user_id: string
  triggered_by_user_id: string | null
  severity_level: AlertSeverity
  alert_type: AlertType
  description: string
  symptoms_reported: Record<string, unknown> | null
  voice_note_url: string | null
  voice_transcription: string | null
  location_lat: number | null
  location_lng: number | null
  location_address: string | null
  ai_detected: boolean
  ai_confidence_score: number | null
  status: AlertStatus
  acknowledged_at: string | null
  acknowledged_by_asha_id: string | null
  responded_by_partner_id: string | null
  resolution_notes: string | null
  referral_made: boolean
  referral_facility: string | null
  resolved_at: string | null
  follow_up_required: boolean
  follow_up_date: string | null
  created_at: string
  updated_at: string
}

// Chat Message Interface
export interface ChatMessage {
  id: string
  user_id: string
  session_id: string
  message_sequence: number
  user_message: string
  user_voice_url: string | null
  user_voice_duration_seconds: number | null
  ai_response: string
  ai_voice_url: string | null
  ai_model_used: string
  intent_detected: string | null
  category: string | null
  language_used: string
  was_helpful: boolean | null
  follow_up_action: string | null
  contains_sensitive_info: boolean
  auto_delete_scheduled: boolean
  created_at: string
}

// Audio Lesson Interface
export interface AudioLesson {
  id: string
  title: string
  title_hindi: string
  category: AudioLessonCategory
  description: string | null
  description_hindi: string | null
  audio_url_hindi: string
  audio_url_english: string | null
  audio_url_local_dialect: string | null
  duration_seconds: number
  transcript_hindi: string | null
  transcript_english: string | null
  difficulty_level: string | null
  tags: string[] | null
  is_medically_verified: boolean
  verified_by_doctor: string | null
  verification_date: string | null
  play_count: number
  completion_rate: number | null
  is_active: boolean
  published_date: string | null
  created_at: string
  updated_at: string
}

// Government Scheme Interface
export interface GovtScheme {
  id: string
  scheme_name: string
  scheme_name_hindi: string
  scheme_code: string | null
  scheme_category: string | null
  description: string
  description_hindi: string
  short_description: string | null
  eligibility_criteria: string
  eligibility_criteria_hindi: string | null
  min_age: number | null
  max_age: number | null
  pregnancy_stage_applicable: string[] | null
  income_criteria: string | null
  benefits: string
  benefits_hindi: string | null
  benefit_amount: number | null
  how_to_apply: string | null
  how_to_apply_hindi: string | null
  required_documents: string[] | null
  application_deadline: string | null
  official_website_url: string | null
  helpline_number: string | null
  contact_person: string | null
  target_states: string[] | null
  target_districts: string[] | null
  implementing_agency: string | null
  is_active: boolean
  start_date: string | null
  end_date: string | null
  views_count: number
  applications_count: number
  created_at: string
  updated_at: string
}

// ASHA Worker Profile Interface
export interface AshaWorkerProfile {
  id: string
  user_id: string
  worker_id: string
  certification_number: string | null
  certification_date: string | null
  years_of_experience: number | null
  specializations: string[] | null
  assigned_villages: string[]
  assigned_blocks: string[] | null
  assigned_district: string
  assigned_phc: string | null
  supervisor_name: string | null
  supervisor_contact: string | null
  max_beneficiaries: number
  current_beneficiaries_count: number
  high_risk_beneficiaries_count: number
  total_visits_completed: number
  total_referrals_made: number
  average_response_time_minutes: number | null
  last_training_date: string | null
  whatsapp_number: string | null
  preferred_contact_time: string | null
  offline_mode_enabled: boolean
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

// Visit Interface
export interface AshaVisit {
  id: string
  asha_worker_id: string
  user_id: string
  scheduled_date: string
  scheduled_time: string | null
  completed_date: string | null
  status: VisitStatus
  visit_duration_minutes: number | null
  visit_type: string | null
  is_first_visit: boolean
  voice_recording_url: string | null
  voice_transcription: string | null
  ai_extracted_data: Record<string, unknown> | null
  services_provided: string[] | null
  medicines_distributed: string[] | null
  counseling_topics: string[] | null
  observations: string | null
  concerns_noted: string | null
  follow_up_required: boolean
  next_visit_date: string | null
  referral_made: boolean
  referral_reason: string | null
  referred_to: string | null
  visit_location_lat: number | null
  visit_location_lng: number | null
  created_at: string
  updated_at: string
}

// Voice Recording State
export interface VoiceRecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob: Blob | null
  audioUrl: string | null
  error: string | null
}

// Language Options
export const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', nameEn: 'Hindi' },
  { code: 'en', name: 'English', nameEn: 'English' },
  { code: 'bho', name: 'भोजपुरी', nameEn: 'Bhojpuri' },
  { code: 'mr', name: 'मराठी', nameEn: 'Marathi' },
  { code: 'ta', name: 'தமிழ்', nameEn: 'Tamil' },
  { code: 'te', name: 'తెలుగు', nameEn: 'Telugu' },
] as const

export type LanguageCode = typeof LANGUAGES[number]['code']

