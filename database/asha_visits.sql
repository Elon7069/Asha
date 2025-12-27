-- ASHA Visits Table Schema
-- This table stores voice-based visit records by ASHA workers
-- Run this in Supabase SQL Editor to create the table

-- Drop table if exists (for clean re-creation)
DROP TABLE IF EXISTS asha_visits;

CREATE TABLE asha_visits (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Foreign key to ASHA worker (who created the visit)
    asha_worker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Foreign key to beneficiary/user (visited person) - optional
    beneficiary_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Visit Date & Time
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    visit_time TIME,
    completed_at TIMESTAMPTZ,
    
    -- Status tracking
    status TEXT DEFAULT 'completed',
    visit_type TEXT,
    visit_duration_minutes INTEGER,
    
    -- Voice Recording Data
    voice_recording_url TEXT,
    voice_transcription TEXT,
    transcription_language TEXT DEFAULT 'hi',
    
    -- AI Extracted Data (JSONB for flexibility)
    ai_extracted_data JSONB DEFAULT '{}'::jsonb,
    ai_confidence_score DECIMAL(5,4),
    extraction_model TEXT,
    
    -- Extracted Vitals (for quick queries)
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    weight_kg DECIMAL(5,2),
    temperature_celsius DECIMAL(4,2),
    
    -- Symptoms & Observations
    symptoms TEXT[] DEFAULT '{}',
    symptom_severity TEXT,
    observations TEXT,
    concerns_noted TEXT,
    
    -- Services Provided
    services_provided TEXT[] DEFAULT '{}',
    medicines_distributed TEXT[] DEFAULT '{}',
    counseling_topics TEXT[] DEFAULT '{}',
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    next_visit_date DATE,
    
    -- Referral
    referral_made BOOLEAN DEFAULT false,
    referral_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_asha_visits_asha_worker_id ON asha_visits(asha_worker_id);
CREATE INDEX idx_asha_visits_visit_date ON asha_visits(visit_date);
CREATE INDEX idx_asha_visits_created_at ON asha_visits(created_at);

-- Row Level Security (RLS)
ALTER TABLE asha_visits ENABLE ROW LEVEL SECURITY;

-- Policy: ASHA workers can see and edit their own visits
CREATE POLICY "ASHA workers can view own visits" ON asha_visits
    FOR SELECT USING (auth.uid() = asha_worker_id);

CREATE POLICY "ASHA workers can insert own visits" ON asha_visits
    FOR INSERT WITH CHECK (auth.uid() = asha_worker_id);

CREATE POLICY "ASHA workers can update own visits" ON asha_visits
    FOR UPDATE USING (auth.uid() = asha_worker_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_asha_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_asha_visits_timestamp
    BEFORE UPDATE ON asha_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_asha_visits_updated_at();
