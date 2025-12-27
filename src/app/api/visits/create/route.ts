import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface VisitVitals {
  blood_pressure?: { systolic: number; diastolic: number } | null
  weight_kg?: number | null
  temperature_celsius?: number | null
}

interface VisitData {
  // ASHA worker info
  asha_worker_id?: string
  
  // Beneficiary info
  beneficiary_id?: string
  beneficiary_name?: string // For display, not stored
  
  // Visit metadata
  visit_date?: string
  visit_type?: string | null
  visit_duration_minutes?: number
  
  // Voice recording data
  voice_recording_url?: string
  voice_transcription?: string
  transcription_language?: string
  
  // AI extracted data
  ai_extracted_data?: Record<string, unknown>
  ai_confidence_score?: number
  
  // Vitals
  vitals?: VisitVitals
  
  // Symptoms & observations
  symptoms?: string[]
  symptom_severity?: string | null
  observations?: string | null
  concerns_noted?: string | null
  
  // Services
  services_provided?: string[]
  medicines_distributed?: string[]
  counseling_topics?: string[]
  
  // Follow-up & referral
  follow_up_required?: boolean
  next_visit_date?: string | null
  referral_needed?: boolean
  referral_reason?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body: VisitData = await request.json()
    
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      )
    }

    // Build visit record matching asha_visits table schema
    const visitRecord = {
      asha_worker_id: user.id,
      beneficiary_id: body.beneficiary_id || null,
      visit_date: body.visit_date || new Date().toISOString().split('T')[0],
      visit_time: new Date().toTimeString().split(' ')[0],
      completed_at: new Date().toISOString(),
      status: 'completed',
      visit_type: body.visit_type || null,
      visit_duration_minutes: body.visit_duration_minutes || null,
      
      // Voice data
      voice_recording_url: body.voice_recording_url || null,
      voice_transcription: body.voice_transcription || null,
      transcription_language: body.transcription_language || 'hi',
      
      // AI data
      ai_extracted_data: body.ai_extracted_data || {},
      ai_confidence_score: body.ai_confidence_score || null,
      extraction_model: 'mistral-large-latest',
      
      // Vitals
      blood_pressure_systolic: body.vitals?.blood_pressure?.systolic || null,
      blood_pressure_diastolic: body.vitals?.blood_pressure?.diastolic || null,
      weight_kg: body.vitals?.weight_kg || null,
      temperature_celsius: body.vitals?.temperature_celsius || null,
      
      // Symptoms
      symptoms: body.symptoms || [],
      symptom_severity: body.symptom_severity || null,
      observations: body.observations || null,
      concerns_noted: body.concerns_noted || null,
      
      // Services
      services_provided: body.services_provided || [],
      medicines_distributed: body.medicines_distributed || [],
      counseling_topics: body.counseling_topics || [],
      
      // Follow-up
      follow_up_required: body.follow_up_required || false,
      next_visit_date: body.next_visit_date || null,
      
      // Referral
      referral_made: body.referral_needed || false,
      referral_reason: body.referral_reason || null,
    }

    // Insert into database
    const { data: visit, error: insertError } = await supabase
      .from('asha_visits')
      .insert(visitRecord)
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save visit', details: insertError.message },
        { status: 500 }
      )
    }

    // Update ASHA worker stats (optional, for MVP we skip this)
    // await supabase
    //   .from('asha_worker_profiles')
    //   .update({ completed_visits_this_month: supabase.raw('completed_visits_this_month + 1') })
    //   .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      visit_id: visit.id,
      message: 'Visit saved successfully',
      visit,
    })
    
  } catch (error) {
    console.error('Create visit error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create visit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET: Fetch visits for current ASHA worker
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const { data: visits, error } = await supabase
      .from('asha_visits')
      .select('*')
      .eq('asha_worker_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch visits' },
        { status: 500 }
      )
    }

    return NextResponse.json({ visits })
    
  } catch (error) {
    console.error('Fetch visits error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    )
  }
}
