-- NGO Partner Profiles Table - Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ngo_partner_profiles (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Foreign key to auth.users
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Personal Information
    full_name TEXT,
    display_name TEXT,
    age INTEGER CHECK (age > 0 AND age <= 120),
    phone_number TEXT,
    email TEXT,
    
    -- Location Information
    village TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    
    -- Organization Information
    organization_name TEXT,
    organization_type TEXT,
    registration_number TEXT,
    focus_areas TEXT[],
    
    -- Partnership Details
    partnership_since DATE DEFAULT CURRENT_DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Profile completion tracking
    profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ngo_partner_profiles_user_id ON ngo_partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ngo_partner_profiles_organization_type ON ngo_partner_profiles(organization_type);
CREATE INDEX IF NOT EXISTS idx_ngo_partner_profiles_district ON ngo_partner_profiles(district);
CREATE INDEX IF NOT EXISTS idx_ngo_partner_profiles_state ON ngo_partner_profiles(state);

-- Enable Row Level Security
ALTER TABLE ngo_partner_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "NGO partners can view own profile" ON ngo_partner_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "NGO partners can insert own profile" ON ngo_partner_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "NGO partners can update own profile" ON ngo_partner_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_ngo_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ngo_partner_profiles_updated_at
    BEFORE UPDATE ON ngo_partner_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_ngo_updated_at_column();