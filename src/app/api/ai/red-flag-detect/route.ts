import { NextRequest, NextResponse } from 'next/server'
import { analyzeSymptoms } from '@/lib/ai/mistral'
import { getSupabaseClient } from '@/lib/supabase/server'

/**
 * Red Flag Detection API
 * Analyzes symptoms and detects danger signs
 */
export async function POST(request: NextRequest) {
  try {
    const { symptoms, isPregnant, pregnancyWeek, user_id } = await request.json()
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms array is required' },
        { status: 400 }
      )
    }
    
    // Analyze symptoms using AI
    const analysis = await analyzeSymptoms(
      symptoms,
      isPregnant || false,
      pregnancyWeek
    )
    
    // If red flag detected, create alert automatically
    if (analysis.isRedFlag && user_id) {
      const supabase = await getSupabaseClient()
      
      // First get asha_users record (assuming user_id is auth.users.id)
      const { data: ashaUser } = await supabase
        .from('asha_users')
        .select('id')
        .eq('auth_id', user_id)
        .single()
      
      if (!ashaUser) {
        return NextResponse.json({
          ...analysis,
          alert_created: false
        })
      }
      
      // Get user profile for location
      const { data: profile } = await supabase
        .from('asha_user_profiles')
        .select('id, location_geom, linked_asha_id')
        .eq('user_id', ashaUser.id)
        .single()
      
      if (profile) {
        // Create alert (note: alerts table uses asha_users.id for user_id)
        const { data: alert } = await supabase
          .from('asha_alerts')
          .insert({
            user_id: ashaUser.id,
            triggered_by_user_id: ashaUser.id,
            severity_level: analysis.riskScore >= 80 ? 'critical' : 'high',
            alert_type: 'red_flag_symptom',
            description: `Red flag detected: ${analysis.reasons.join(', ')}`,
            symptoms_reported: { list: symptoms },
            ai_detected: true,
            ai_confidence_score: analysis.riskScore / 100,
            location_geom: profile.location_geom,
            status: 'open'
          })
          .select()
          .single()
        
        return NextResponse.json({
          ...analysis,
          alert_created: true,
          alert_id: alert?.id
        })
      }
    }
    
    return NextResponse.json({
      ...analysis,
      alert_created: false
    })
    
  } catch (error: any) {
    console.error('Red flag detection error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to detect red flags' },
      { status: 500 }
    )
  }
}

