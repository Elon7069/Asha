-- NGO Partner Profiles Table Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.ngo_partner_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Personal Information
    full_name TEXT,
    display_name TEXT,
    phone_number TEXT,
    email TEXT,
    age INTEGER CHECK (age > 0 AND age < 150),
    
    -- Location Information
    village TEXT,
    district TEXT,
    state TEXT,
    
    -- Organization Information
    organization_name TEXT NOT NULL,
    organization_type TEXT CHECK (organization_type IN ('health', 'women', 'education', 'rural', 'government', 'other')),
    registration_number TEXT,
    focus_areas TEXT[] DEFAULT '{}', -- Array of focus areas
    partnership_since DATE DEFAULT CURRENT_DATE,
    
    -- Profile Information
    profile_photo_url TEXT,
    preferred_language TEXT DEFAULT 'en',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id), -- One profile per user
    UNIQUE(registration_number) -- Unique registration numbers
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ngo_partner_profiles_user_id ON public.ngo_partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ngo_partner_profiles_organization_type ON public.ngo_partner_profiles(organization_type);
CREATE INDEX IF NOT EXISTS idx_ngo_partner_profiles_district ON public.ngo_partner_profiles(district);
CREATE INDEX IF NOT EXISTS idx_ngo_partner_profiles_state ON public.ngo_partner_profiles(state);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ngo_partner_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view and edit their own profile
CREATE POLICY "Users can view own NGO partner profile" 
    ON public.ngo_partner_profiles FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NGO partner profile" 
    ON public.ngo_partner_profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own NGO partner profile" 
    ON public.ngo_partner_profiles FOR UPDATE 
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_ngo_partner_profiles_updated_at 
    BEFORE UPDATE ON public.ngo_partner_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.ngo_partner_profiles TO authenticated;
GRANT ALL ON public.ngo_partner_profiles TO service_role;