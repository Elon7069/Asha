-- ASHA Worker Profiles Table Schema
-- This table stores profile information for ASHA (Accredited Social Health Activist) workers

CREATE TABLE IF NOT EXISTS asha_worker_profiles (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Foreign key to auth.users
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Personal Information
    full_name TEXT,
    display_name TEXT, -- Optional shorter/preferred name
    age INTEGER CHECK (age > 0 AND age <= 120),
    phone_number TEXT,
    email TEXT,
    
    -- Location Information
    village TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    
    -- Professional Information
    employee_id TEXT UNIQUE, -- Official ASHA worker ID
    certification_date DATE,
    certification_number TEXT,
    supervisor_name TEXT,
    supervisor_phone TEXT,
    
    -- Work Assignment
    assigned_villages TEXT[], -- Array of villages assigned
    assigned_anganwadi_centers TEXT[], -- Array of anganwadi centers
    coverage_area_radius INTEGER, -- Coverage area in kilometers
    
    -- Performance Metrics
    total_beneficiaries INTEGER DEFAULT 0,
    active_beneficiaries INTEGER DEFAULT 0,
    completed_visits_this_month INTEGER DEFAULT 0,
    target_visits_per_month INTEGER DEFAULT 0,
    
    -- Training & Certification
    training_completed JSONB DEFAULT '[]'::jsonb, -- Array of completed training modules
    last_training_date DATE,
    next_training_due DATE,
    skill_certifications TEXT[],
    
    -- Equipment & Resources
    has_smartphone BOOLEAN DEFAULT false,
    has_weighing_scale BOOLEAN DEFAULT false,
    has_bp_monitor BOOLEAN DEFAULT false,
    has_hemoglobin_device BOOLEAN DEFAULT false,
    medical_kit_status TEXT DEFAULT 'pending', -- pending, received, needs_refill
    
    -- Emergency Response
    emergency_response_trained BOOLEAN DEFAULT false,
    first_aid_certified BOOLEAN DEFAULT false,
    can_handle_deliveries BOOLEAN DEFAULT false,
    
    -- Banking & Payments
    bank_account_number TEXT,
    ifsc_code TEXT,
    aadhar_number TEXT,
    pan_number TEXT,
    
    -- Communication Preferences
    preferred_language TEXT DEFAULT 'hindi',
    communication_channels JSONB DEFAULT '{"sms": true, "voice_calls": true, "whatsapp": false}'::jsonb,
    
    -- Work Schedule
    working_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]'::jsonb,
    working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}'::jsonb,
    
    -- Status & Activity
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'training')),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    last_report_submitted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional metadata
    profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
    onboarding_completed BOOLEAN DEFAULT false,
    
    -- Recognition & Awards
    awards_received TEXT[],
    performance_ratings JSONB DEFAULT '[]'::jsonb,
    community_feedback_score DECIMAL(3,2) DEFAULT 0.00 CHECK (community_feedback_score >= 0 AND community_feedback_score <= 5.00)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_asha_worker_profiles_user_id ON asha_worker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_asha_worker_profiles_employee_id ON asha_worker_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_asha_worker_profiles_district ON asha_worker_profiles(district);
CREATE INDEX IF NOT EXISTS idx_asha_worker_profiles_state ON asha_worker_profiles(state);
CREATE INDEX IF NOT EXISTS idx_asha_worker_profiles_village ON asha_worker_profiles(village);
CREATE INDEX IF NOT EXISTS idx_asha_worker_profiles_status ON asha_worker_profiles(status);
CREATE INDEX IF NOT EXISTS idx_asha_worker_profiles_supervisor ON asha_worker_profiles(supervisor_name);
CREATE INDEX IF NOT EXISTS idx_asha_worker_profiles_last_active ON asha_worker_profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_asha_worker_profiles_assigned_villages ON asha_worker_profiles USING GIN(assigned_villages);

-- Row Level Security (RLS) Policies
ALTER TABLE asha_worker_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: ASHA workers can only see and edit their own profile
CREATE POLICY "ASHA workers can view own profile" ON asha_worker_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ASHA workers can insert own profile" ON asha_worker_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ASHA workers can update own profile" ON asha_worker_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Supervisors can view profiles of their ASHA workers
-- This would require a separate supervisors table, for now we'll handle at app level

-- Policy: NGO partners can view aggregated ASHA worker performance data
-- This will be handled at the application level with specific aggregation queries

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_asha_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_asha_worker_profiles_updated_at
    BEFORE UPDATE ON asha_worker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_asha_updated_at_column();

-- Function to calculate ASHA worker profile completion percentage
CREATE OR REPLACE FUNCTION calculate_asha_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
    completion_count INTEGER := 0;
    total_fields INTEGER := 18; -- Adjust based on required fields
BEGIN
    -- Count completed fields
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.age IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.phone_number IS NOT NULL AND NEW.phone_number != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.village IS NOT NULL AND NEW.village != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.district IS NOT NULL AND NEW.district != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.state IS NOT NULL AND NEW.state != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.employee_id IS NOT NULL AND NEW.employee_id != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.certification_date IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.certification_number IS NOT NULL AND NEW.certification_number != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.supervisor_name IS NOT NULL AND NEW.supervisor_name != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.supervisor_phone IS NOT NULL AND NEW.supervisor_phone != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.assigned_villages IS NOT NULL AND array_length(NEW.assigned_villages, 1) > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.target_visits_per_month IS NOT NULL AND NEW.target_visits_per_month > 0 THEN completion_count := completion_count + 1; END IF;
    IF NEW.bank_account_number IS NOT NULL AND NEW.bank_account_number != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.ifsc_code IS NOT NULL AND NEW.ifsc_code != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.aadhar_number IS NOT NULL AND NEW.aadhar_number != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.preferred_language IS NOT NULL AND NEW.preferred_language != '' THEN completion_count := completion_count + 1; END IF;
    
    -- Calculate percentage
    NEW.profile_completion_percentage := (completion_count * 100) / total_fields;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate profile completion
CREATE TRIGGER calculate_asha_profile_completion
    BEFORE INSERT OR UPDATE ON asha_worker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_asha_profile_completion();

-- Function to update performance metrics
CREATE OR REPLACE FUNCTION update_asha_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Reset monthly counters on the first of each month
    IF EXTRACT(DAY FROM NEW.updated_at) = 1 AND 
       (OLD.updated_at IS NULL OR EXTRACT(MONTH FROM NEW.updated_at) != EXTRACT(MONTH FROM OLD.updated_at)) THEN
        NEW.completed_visits_this_month := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for performance metrics
CREATE TRIGGER update_asha_performance
    BEFORE UPDATE ON asha_worker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_asha_performance_metrics();

-- Comments
COMMENT ON TABLE asha_worker_profiles IS 'Stores profile information for ASHA workers (Accredited Social Health Activists)';
COMMENT ON COLUMN asha_worker_profiles.user_id IS 'Foreign key reference to auth.users table';
COMMENT ON COLUMN asha_worker_profiles.employee_id IS 'Official government-issued ASHA worker identification';
COMMENT ON COLUMN asha_worker_profiles.assigned_villages IS 'Array of villages assigned to this ASHA worker';
COMMENT ON COLUMN asha_worker_profiles.training_completed IS 'JSON array of completed training modules';
COMMENT ON COLUMN asha_worker_profiles.medical_kit_status IS 'Status of medical kit: pending, received, needs_refill';
COMMENT ON COLUMN asha_worker_profiles.performance_ratings IS 'JSON array of performance evaluation ratings';
COMMENT ON COLUMN asha_worker_profiles.community_feedback_score IS 'Average community feedback rating (0-5 scale)';
COMMENT ON COLUMN asha_worker_profiles.profile_completion_percentage IS 'Automatically calculated completion percentage';