-- ============================================
-- ASHA AI - Complete Database Schema Migration
-- ============================================
-- This migration creates all tables, enums, indexes, and RLS policies
-- as specified in the comprehensive feature specification

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geo-queries

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('user', 'asha_worker', 'ngo_partner', 'health_supervisor');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'pending_verification', 'deleted');
CREATE TYPE pregnancy_stage AS ENUM ('not_pregnant', 'first_trimester', 'second_trimester', 'third_trimester', 'postnatal', 'planning');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');
CREATE TYPE anemia_status AS ENUM ('none', 'mild', 'moderate', 'severe', 'unknown');
CREATE TYPE menstrual_flow AS ENUM ('light', 'medium', 'heavy', 'very_heavy', 'spotting');
CREATE TYPE mood_type AS ENUM ('very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'stressed');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical', 'emergency');
CREATE TYPE alert_status AS ENUM ('open', 'acknowledged', 'in_progress', 'resolved', 'false_alarm');
CREATE TYPE alert_type AS ENUM ('emergency_sos', 'red_flag_symptom', 'missed_checkup', 'abnormal_vitals', 'mental_health_concern', 'severe_bleeding', 'severe_pain');
CREATE TYPE vaccination_status AS ENUM ('scheduled', 'completed', 'missed', 'rescheduled');
CREATE TYPE visit_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE referral_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');
CREATE TYPE referral_urgency AS ENUM ('routine', 'urgent', 'emergency');
CREATE TYPE audio_lesson_category AS ENUM ('menstrual_health', 'pregnancy', 'nutrition', 'mental_health', 'puberty', 'hygiene', 'danger_signs');

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.asha_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Contact (Privacy-conscious)
  phone_number VARCHAR(15) UNIQUE,
  alternate_contact VARCHAR(15),
  
  -- Identity
  role user_role NOT NULL DEFAULT 'user',
  full_name VARCHAR(255),
  display_name VARCHAR(100),
  profile_photo_url TEXT,
  age INTEGER CHECK (age >= 10 AND age <= 60),
  
  -- Preferences
  preferred_language VARCHAR(10) DEFAULT 'hi',
  voice_speed DECIMAL(2,1) DEFAULT 1.0,
  enable_auto_delete BOOLEAN DEFAULT FALSE,
  auto_delete_days INTEGER DEFAULT 7,
  
  -- Privacy & Safety
  account_status account_status DEFAULT 'active',
  is_shared_device BOOLEAN DEFAULT FALSE,
  last_privacy_review_at TIMESTAMPTZ,
  
  -- Engagement
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ,
  total_voice_interactions INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. USER PROFILES (Women & Girls)
-- ============================================
CREATE TABLE IF NOT EXISTS public.asha_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_users(id) ON DELETE CASCADE UNIQUE,
  linked_asha_id UUID REFERENCES public.asha_users(id),
  
  -- Personal (Optional for privacy)
  date_of_birth DATE,
  education_level VARCHAR(50),
  marital_status VARCHAR(50),
  
  -- Pregnancy Status
  is_currently_pregnant BOOLEAN DEFAULT FALSE,
  pregnancy_stage pregnancy_stage DEFAULT 'not_pregnant',
  last_period_date DATE,
  expected_delivery_date DATE,
  current_pregnancy_week INTEGER,
  
  -- Menstrual Health
  average_cycle_length INTEGER DEFAULT 28,
  last_menstrual_flow menstrual_flow,
  menstrual_pain_level INTEGER CHECK (menstrual_pain_level BETWEEN 0 AND 10),
  has_irregular_cycles BOOLEAN DEFAULT FALSE,
  
  -- Medical History
  blood_group blood_group DEFAULT 'unknown',
  anemia_status anemia_status DEFAULT 'unknown',
  last_hemoglobin_level DECIMAL(4,2),
  hemoglobin_test_date DATE,
  
  -- Pregnancy History
  previous_pregnancies INTEGER DEFAULT 0,
  previous_live_births INTEGER DEFAULT 0,
  previous_miscarriages INTEGER DEFAULT 0,
  previous_complications TEXT,
  
  -- Health Conditions
  chronic_conditions TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  
  -- Risk Assessment
  is_high_risk BOOLEAN DEFAULT FALSE,
  risk_factors TEXT[],
  ai_calculated_risk_score INTEGER CHECK (ai_calculated_risk_score BETWEEN 0 AND 100),
  last_risk_assessment_date DATE,
  
  -- Location (Village-level only for privacy)
  village VARCHAR(255),
  block VARCHAR(255),
  district VARCHAR(255) NOT NULL,
  state VARCHAR(100) DEFAULT 'India',
  pin_code VARCHAR(6),
  location_geom GEOGRAPHY(POINT, 4326),
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(15),
  emergency_contact_relation VARCHAR(50),
  
  -- IFA Tablet Tracking
  ifa_tablets_provided BOOLEAN DEFAULT FALSE,
  ifa_start_date DATE,
  ifa_reminders_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. MENSTRUAL CYCLE TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS public.menstrual_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_user_profiles(id) ON DELETE CASCADE,
  
  -- Cycle Data
  period_start_date DATE NOT NULL,
  period_end_date DATE,
  cycle_length INTEGER,
  
  -- Symptoms & Flow
  flow_intensity menstrual_flow,
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  symptoms JSONB,
  
  -- Predictions
  is_predicted BOOLEAN DEFAULT FALSE,
  predicted_next_period DATE,
  predicted_fertile_window_start DATE,
  predicted_fertile_window_end DATE,
  
  -- Notes
  voice_note_url TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. HEALTH LOGS (Daily Symptom Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_user_profiles(id) ON DELETE CASCADE,
  logged_by_user_id UUID REFERENCES public.asha_users(id),
  
  -- Vital Signs
  blood_pressure_systolic INTEGER CHECK (blood_pressure_systolic BETWEEN 60 AND 250),
  blood_pressure_diastolic INTEGER CHECK (blood_pressure_diastolic BETWEEN 40 AND 150),
  weight_kg DECIMAL(5, 2),
  temperature_celsius DECIMAL(4, 2),
  heart_rate_bpm INTEGER,
  
  -- Pregnancy-Specific
  fetal_movement_count INTEGER,
  swelling_location TEXT[],
  
  -- Symptoms (Flexible JSON)
  symptoms JSONB,
  symptom_severity VARCHAR(20),
  
  -- Subjective Well-being
  mood mood_type,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  appetite VARCHAR(20),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  
  -- Voice Data
  voice_note_url TEXT,
  voice_transcription TEXT,
  user_spoken_language VARCHAR(10),
  
  -- AI Analysis
  is_red_flag BOOLEAN DEFAULT FALSE,
  red_flag_reasons TEXT[],
  ai_risk_score INTEGER CHECK (ai_risk_score BETWEEN 0 AND 100),
  ai_recommendation TEXT,
  
  -- Emergency
  is_emergency BOOLEAN DEFAULT FALSE,
  emergency_triggered_at TIMESTAMPTZ,
  
  log_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. VACCINATIONS & IFA TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_user_profiles(id) ON DELETE CASCADE,
  
  -- Vaccine Details
  vaccine_name VARCHAR(255) NOT NULL,
  vaccine_type VARCHAR(100),
  dose_number INTEGER,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status vaccination_status DEFAULT 'scheduled',
  
  -- Administration
  administered_by_asha_id UUID REFERENCES public.asha_users(id),
  administration_location VARCHAR(255),
  batch_number VARCHAR(100),
  
  -- Side Effects
  side_effects_reported BOOLEAN DEFAULT FALSE,
  side_effects_description TEXT,
  
  -- Reminders
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  voice_reminder_played BOOLEAN DEFAULT FALSE,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ALERTS (Red Zone Emergency System)
-- ============================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_user_profiles(id) ON DELETE CASCADE,
  triggered_by_user_id UUID REFERENCES public.asha_users(id),
  
  -- Alert Classification
  severity_level alert_severity NOT NULL,
  alert_type alert_type NOT NULL,
  
  -- Alert Details
  description TEXT NOT NULL,
  symptoms_reported JSONB,
  voice_note_url TEXT,
  voice_transcription TEXT,
  
  -- Location (for emergency response)
  location_geom GEOGRAPHY(POINT, 4326),
  location_address TEXT,
  
  -- AI Analysis
  ai_detected BOOLEAN DEFAULT FALSE,
  ai_confidence_score DECIMAL(3,2),
  
  -- Response Tracking
  status alert_status DEFAULT 'open',
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by_asha_id UUID REFERENCES public.asha_users(id),
  responded_by_partner_id UUID REFERENCES public.asha_users(id),
  
  -- Resolution
  resolution_notes TEXT,
  referral_made BOOLEAN DEFAULT FALSE,
  referral_facility VARCHAR(255),
  resolved_at TIMESTAMPTZ,
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT TRUE,
  follow_up_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. ASHA WORKER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.asha_worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_users(id) ON DELETE CASCADE UNIQUE,
  
  -- Professional Details
  worker_id VARCHAR(50) UNIQUE NOT NULL,
  certification_number VARCHAR(100),
  certification_date DATE,
  years_of_experience INTEGER,
  specializations TEXT[],
  
  -- Service Area
  assigned_villages TEXT[] NOT NULL,
  assigned_blocks TEXT[],
  assigned_district VARCHAR(255) NOT NULL,
  assigned_phc VARCHAR(255),
  supervisor_name VARCHAR(255),
  supervisor_contact VARCHAR(15),
  
  -- Capacity Management
  max_beneficiaries INTEGER DEFAULT 50,
  current_beneficiaries_count INTEGER DEFAULT 0,
  high_risk_beneficiaries_count INTEGER DEFAULT 0,
  
  -- Performance Metrics
  total_visits_completed INTEGER DEFAULT 0,
  total_referrals_made INTEGER DEFAULT 0,
  average_response_time_minutes INTEGER,
  last_training_date DATE,
  
  -- Communication
  whatsapp_number VARCHAR(15),
  preferred_contact_time VARCHAR(50),
  
  -- Offline Support
  offline_mode_enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. ASHA VISITS (Field Visit Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.asha_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asha_worker_id UUID REFERENCES public.asha_worker_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.asha_user_profiles(id) ON DELETE CASCADE,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  completed_date TIMESTAMP,
  status visit_status DEFAULT 'scheduled',
  visit_duration_minutes INTEGER,
  
  -- Visit Type
  visit_type VARCHAR(100),
  is_first_visit BOOLEAN DEFAULT FALSE,
  
  -- Voice-Based Logging
  voice_recording_url TEXT,
  voice_transcription TEXT,
  ai_extracted_data JSONB,
  
  -- Services Provided
  services_provided TEXT[],
  medicines_distributed TEXT[],
  counseling_topics TEXT[],
  
  -- Observations
  observations TEXT,
  concerns_noted TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  next_visit_date DATE,
  
  -- Referrals
  referral_made BOOLEAN DEFAULT FALSE,
  referral_reason TEXT,
  referred_to VARCHAR(255),
  
  -- Location
  visit_location_geom GEOGRAPHY(POINT, 4326),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. REFERRALS
-- ============================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_user_profiles(id) ON DELETE CASCADE,
  referred_by_asha_id UUID REFERENCES public.asha_worker_profiles(id),
  alert_id UUID REFERENCES public.alerts(id),
  
  -- Referral Details
  urgency referral_urgency NOT NULL,
  reason TEXT NOT NULL,
  symptoms JSONB,
  
  -- Facility Details
  referred_to_facility VARCHAR(255) NOT NULL,
  facility_type VARCHAR(50),
  facility_contact VARCHAR(15),
  
  -- Status
  status referral_status DEFAULT 'pending',
  appointment_date DATE,
  appointment_time TIME,
  
  -- Follow-up
  visited BOOLEAN DEFAULT FALSE,
  visit_date DATE,
  diagnosis_received TEXT,
  treatment_received TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. NGO PARTNER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.ngo_partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_users(id) ON DELETE CASCADE UNIQUE,
  
  -- Organization
  organization_name VARCHAR(255) NOT NULL,
  organization_type VARCHAR(100),
  registration_number VARCHAR(100) UNIQUE,
  registration_date DATE,
  
  -- Verification
  verification_status VARCHAR(50) DEFAULT 'pending',
  verified_by UUID REFERENCES public.asha_users(id),
  verified_at TIMESTAMPTZ,
  
  -- Coverage
  operational_districts TEXT[] NOT NULL,
  operational_states TEXT[] NOT NULL,
  total_beneficiaries_impacted INTEGER DEFAULT 0,
  
  -- Contact
  official_email VARCHAR(255),
  official_phone VARCHAR(15),
  website_url TEXT,
  address TEXT,
  
  -- Dashboard Access
  dashboard_access_level VARCHAR(50) DEFAULT 'read_only',
  can_add_schemes BOOLEAN DEFAULT FALSE,
  can_export_data BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. GOVERNMENT SCHEMES (CMS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.govt_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Scheme Identity
  scheme_name VARCHAR(255) NOT NULL,
  scheme_name_hindi VARCHAR(255) NOT NULL,
  scheme_code VARCHAR(50) UNIQUE,
  scheme_category VARCHAR(100),
  
  -- Description
  description TEXT NOT NULL,
  description_hindi TEXT NOT NULL,
  short_description VARCHAR(500),
  
  -- Eligibility
  eligibility_criteria TEXT NOT NULL,
  eligibility_criteria_hindi TEXT,
  min_age INTEGER,
  max_age INTEGER,
  pregnancy_stage_applicable TEXT[],
  income_criteria TEXT,
  
  -- Benefits
  benefits TEXT NOT NULL,
  benefits_hindi TEXT,
  benefit_amount DECIMAL(10,2),
  
  -- Application
  how_to_apply TEXT,
  how_to_apply_hindi TEXT,
  required_documents TEXT[],
  application_deadline DATE,
  
  -- Contact
  official_website_url TEXT,
  helpline_number VARCHAR(15),
  contact_person VARCHAR(255),
  
  -- Coverage
  target_states TEXT[],
  target_districts TEXT[],
  implementing_agency VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  
  -- Engagement
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  
  -- Management
  created_by_ngo_id UUID REFERENCES public.ngo_partner_profiles(id),
  last_updated_by UUID REFERENCES public.asha_users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. AI CHAT HISTORY (Asha Didi Conversations)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_users(id) ON DELETE CASCADE,
  
  -- Conversation Context
  session_id UUID NOT NULL,
  message_sequence INTEGER NOT NULL,
  
  -- User Input
  user_message TEXT NOT NULL,
  user_voice_url TEXT,
  user_voice_duration_seconds INTEGER,
  
  -- AI Response
  ai_response TEXT NOT NULL,
  ai_voice_url TEXT,
  ai_model_used VARCHAR(50) DEFAULT 'mistral-large',
  
  -- Classification
  intent_detected VARCHAR(100),
  category VARCHAR(50),
  language_used VARCHAR(10) DEFAULT 'hi',
  
  -- Context
  was_helpful BOOLEAN,
  follow_up_action VARCHAR(100),
  
  -- Privacy
  contains_sensitive_info BOOLEAN DEFAULT FALSE,
  auto_delete_scheduled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. AUDIO MICRO-LESSONS (30-45 sec clips)
-- ============================================
CREATE TABLE IF NOT EXISTS public.audio_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  title_hindi VARCHAR(255) NOT NULL,
  category audio_lesson_category NOT NULL,
  
  description TEXT,
  description_hindi TEXT,
  
  -- Audio Files
  audio_url_hindi TEXT NOT NULL,
  audio_url_english TEXT,
  audio_url_local_dialect TEXT,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds BETWEEN 30 AND 60),
  
  -- Transcript (for accessibility)
  transcript_hindi TEXT,
  transcript_english TEXT,
  
  -- Metadata
  difficulty_level VARCHAR(20),
  tags TEXT[],
  
  -- Medical Verification
  is_medically_verified BOOLEAN DEFAULT FALSE,
  verified_by_doctor VARCHAR(255),
  verification_date DATE,
  
  -- Engagement
  play_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(3,2),
  
  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  published_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. USER AUDIO LESSON PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.audio_lessons(id) ON DELETE CASCADE,
  
  -- Progress
  listened BOOLEAN DEFAULT FALSE,
  listen_count INTEGER DEFAULT 0,
  last_listened_at TIMESTAMPTZ,
  completion_percentage INTEGER CHECK (completion_percentage BETWEEN 0 AND 100),
  
  -- Engagement
  was_helpful BOOLEAN,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);

-- ============================================
-- 15. NUTRITION LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_user_profiles(id) ON DELETE CASCADE,
  
  -- Meal Tracking
  log_date DATE DEFAULT CURRENT_DATE,
  meal_type VARCHAR(50),
  
  -- Foods Consumed (voice-logged)
  foods_consumed TEXT[],
  voice_note_url TEXT,
  voice_transcription TEXT,
  
  -- Nutrition Analysis (AI)
  estimated_iron_mg DECIMAL(5,2),
  estimated_protein_g DECIMAL(5,2),
  estimated_calories INTEGER,
  nutritional_quality_score INTEGER CHECK (nutritional_quality_score BETWEEN 0 AND 100),
  
  -- IFA Tablet
  ifa_tablet_taken BOOLEAN DEFAULT FALSE,
  ifa_tablet_time TIME,
  
  -- Notes
  appetite_level VARCHAR(20),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 16. MENTAL HEALTH CHECK-INS (Optional, Ethical)
-- ============================================
CREATE TABLE IF NOT EXISTS public.mental_health_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.asha_user_profiles(id) ON DELETE CASCADE,
  
  -- Check-in Data
  checkin_date DATE DEFAULT CURRENT_DATE,
  mood mood_type NOT NULL,
  
  -- Voice Input
  voice_note_url TEXT,
  voice_transcription TEXT,
  user_response TEXT,
  
  -- Emotional State (Simple, non-diagnostic)
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  feeling_overwhelmed BOOLEAN,
  feeling_supported BOOLEAN,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  
  -- Support Provided
  calming_audio_played BOOLEAN DEFAULT FALSE,
  calming_audio_id UUID REFERENCES public.audio_lessons(id),
  
  -- Follow-up
  requires_attention BOOLEAN DEFAULT FALSE,
  suggested_action TEXT,
  
  -- Privacy
  is_private BOOLEAN DEFAULT TRUE,
  shared_with_asha BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. SYSTEM ANALYTICS (Village-Level)
-- ============================================
CREATE TABLE IF NOT EXISTS public.village_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Location
  village VARCHAR(255) NOT NULL,
  block VARCHAR(255),
  district VARCHAR(255) NOT NULL,
  state VARCHAR(100),
  
  -- Date
  report_date DATE DEFAULT CURRENT_DATE,
  report_month INTEGER,
  report_year INTEGER,
  
  -- User Metrics
  total_active_users INTEGER DEFAULT 0,
  new_users_this_month INTEGER DEFAULT 0,
  pregnant_users_count INTEGER DEFAULT 0,
  high_risk_users_count INTEGER DEFAULT 0,
  
  -- Health Metrics
  red_flag_cases_count INTEGER DEFAULT 0,
  anemia_related_queries INTEGER DEFAULT 0,
  menstrual_health_queries INTEGER DEFAULT 0,
  emergency_alerts_count INTEGER DEFAULT 0,
  
  -- ASHA Metrics
  total_visits_completed INTEGER DEFAULT 0,
  average_response_time_hours DECIMAL(5,2),
  referrals_made INTEGER DEFAULT 0,
  
  -- Engagement
  total_voice_interactions INTEGER DEFAULT 0,
  audio_lessons_played INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(village, district, report_date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_asha ON asha_user_profiles(linked_asha_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON asha_user_profiles USING GIST(location_geom);
CREATE INDEX IF NOT EXISTS idx_alerts_status_severity ON alerts(status, severity_level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_logs_user_date ON health_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_logs_red_flags ON health_logs(is_red_flag, created_at DESC) WHERE is_red_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_vaccinations_upcoming ON vaccinations(user_id, scheduled_date) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user ON menstrual_cycles(user_id, period_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_asha_visits_worker_date ON asha_visits(asha_worker_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON ai_chat_history(session_id, message_sequence);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON asha_users(role, account_status) WHERE account_status = 'active';
CREATE INDEX IF NOT EXISTS idx_alerts_user_created ON alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_mental_health_user_date ON mental_health_checkins(user_id, checkin_date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE public.asha_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asha_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asha_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_health_checkins ENABLE ROW LEVEL SECURITY;

-- Users can view/edit their own data
CREATE POLICY "Users manage own data"
ON public.asha_users FOR ALL
USING (auth.uid() = auth_id);

CREATE POLICY "Users view own profile"
ON public.asha_user_profiles FOR SELECT
USING (auth.uid() = (SELECT auth_id FROM public.asha_users WHERE id = user_id));

CREATE POLICY "Users manage own profile"
ON public.asha_user_profiles FOR ALL
USING (auth.uid() = (SELECT auth_id FROM public.asha_users WHERE id = user_id));

-- ASHA Workers can view assigned beneficiaries
CREATE POLICY "ASHA view assigned users"
ON public.asha_user_profiles FOR SELECT
USING (
  linked_asha_id IN (
    SELECT id FROM public.asha_worker_profiles
    WHERE user_id = (SELECT id FROM public.asha_users WHERE auth_id = auth.uid())
  )
);

-- Privacy: Auto-delete chat history if enabled
CREATE POLICY "Auto-delete chat history"
ON public.ai_chat_history FOR SELECT
USING (
  CASE
    WHEN (SELECT enable_auto_delete FROM public.asha_users WHERE id = user_id)
    THEN created_at > NOW() - INTERVAL '7 days'
    ELSE TRUE
  END
);

-- NGO Partners: Read-only access to anonymized data
CREATE POLICY "NGO read analytics"
ON public.village_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ngo_partner_profiles npp
    JOIN public.asha_users u ON npp.user_id = u.id
    WHERE u.auth_id = auth.uid()
    AND district = ANY(npp.operational_districts)
  )
);

-- ASHA workers can manage their own visits
CREATE POLICY "ASHA manage own visits"
ON public.asha_visits FOR ALL
USING (
  asha_worker_id IN (
    SELECT id FROM public.asha_worker_profiles
    WHERE user_id = (SELECT id FROM public.asha_users WHERE auth_id = auth.uid())
  )
);

-- Users can manage their own health logs
CREATE POLICY "Users manage own health logs"
ON public.health_logs FOR ALL
USING (
  user_id IN (
    SELECT id FROM public.asha_user_profiles
    WHERE user_id = (SELECT id FROM public.asha_users WHERE auth_id = auth.uid())
  )
);

-- Users can manage their own menstrual cycles
CREATE POLICY "Users manage own cycles"
ON public.menstrual_cycles FOR ALL
USING (
  user_id IN (
    SELECT id FROM public.asha_user_profiles
    WHERE user_id = (SELECT id FROM public.asha_users WHERE auth_id = auth.uid())
  )
);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.asha_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.asha_user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asha_worker_profiles_updated_at BEFORE UPDATE ON public.asha_worker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asha_visits_updated_at BEFORE UPDATE ON public.asha_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ngo_partner_profiles_updated_at BEFORE UPDATE ON public.ngo_partner_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_govt_schemes_updated_at BEFORE UPDATE ON public.govt_schemes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audio_lessons_updated_at BEFORE UPDATE ON public.audio_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON public.user_lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON public.vaccinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menstrual_cycles_updated_at BEFORE UPDATE ON public.menstrual_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

