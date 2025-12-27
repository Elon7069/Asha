-- User Profiles Table Schema
-- This table stores profile information for regular users (pregnant women and mothers)

CREATE TABLE IF NOT EXISTS user_profiles (
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
    
    -- Health Information
    is_pregnant BOOLEAN DEFAULT false,
    last_period_date DATE,
    expected_delivery_date DATE,
    number_of_children INTEGER DEFAULT 0 CHECK (number_of_children >= 0),
    previous_pregnancy_complications TEXT,
    
    -- Medical History
    blood_group TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    current_medications TEXT[],
    
    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    
    -- Preferences
    preferred_language TEXT DEFAULT 'hindi',
    notification_preferences JSONB DEFAULT '{"sms": true, "voice": true, "app": true}'::jsonb,
    
    -- ASHA Worker Assignment
    assigned_asha_worker_id UUID,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional metadata
    profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    onboarding_completed BOOLEAN DEFAULT false
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_district ON user_profiles(district);
CREATE INDEX IF NOT EXISTS idx_user_profiles_state ON user_profiles(state);
CREATE INDEX IF NOT EXISTS idx_user_profiles_village ON user_profiles(village);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_pregnant ON user_profiles(is_pregnant);
CREATE INDEX IF NOT EXISTS idx_user_profiles_assigned_asha ON user_profiles(assigned_asha_worker_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active_at);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: ASHA workers can view profiles of assigned users
CREATE POLICY "ASHA workers can view assigned users" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asha_worker_profiles 
            WHERE user_id = auth.uid() 
            AND user_profiles.assigned_asha_worker_id = asha_worker_profiles.user_id
        )
    );

-- Policy: NGO partners can view aggregated data (no individual details)
-- This will be handled at the application level with specific queries

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
    completion_count INTEGER := 0;
    total_fields INTEGER := 15; -- Adjust based on required fields
BEGIN
    -- Count completed fields
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.age IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.phone_number IS NOT NULL AND NEW.phone_number != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.village IS NOT NULL AND NEW.village != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.district IS NOT NULL AND NEW.district != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.state IS NOT NULL AND NEW.state != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.is_pregnant IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.last_period_date IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    IF NEW.blood_group IS NOT NULL AND NEW.blood_group != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.emergency_contact_name IS NOT NULL AND NEW.emergency_contact_name != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.emergency_contact_phone IS NOT NULL AND NEW.emergency_contact_phone != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.emergency_contact_relation IS NOT NULL AND NEW.emergency_contact_relation != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.preferred_language IS NOT NULL AND NEW.preferred_language != '' THEN completion_count := completion_count + 1; END IF;
    IF NEW.number_of_children IS NOT NULL THEN completion_count := completion_count + 1; END IF;
    
    -- Calculate percentage
    NEW.profile_completion_percentage := (completion_count * 100) / total_fields;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate profile completion
CREATE TRIGGER calculate_user_profile_completion
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_profile_completion();

-- Comments
COMMENT ON TABLE user_profiles IS 'Stores profile information for regular users (pregnant women and mothers)';
COMMENT ON COLUMN user_profiles.user_id IS 'Foreign key reference to auth.users table';
COMMENT ON COLUMN user_profiles.is_pregnant IS 'Current pregnancy status';
COMMENT ON COLUMN user_profiles.assigned_asha_worker_id IS 'Reference to assigned ASHA worker';
COMMENT ON COLUMN user_profiles.profile_completion_percentage IS 'Automatically calculated completion percentage';
COMMENT ON COLUMN user_profiles.notification_preferences IS 'JSON object storing user notification preferences';