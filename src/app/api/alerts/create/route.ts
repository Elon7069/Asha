import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      severity_level,
      alert_type,
      description,
      symptoms_reported,
      voice_note_url,
      voice_transcription,
      location_lat,
      location_lng,
      location_address,
    } = body

    // Validate required fields
    if (!severity_level || !alert_type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: severity_level, alert_type, description' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's ASHA user record
    const { data: ashaUser, error: userError } = await supabase
      .from('asha_users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (userError || !ashaUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get the user's profile (for the alert association)
    const { data: userProfile } = await supabase
      .from('asha_user_profiles')
      .select('id, linked_asha_id')
      .eq('user_id', ashaUser.id)
      .single()

    // Create the alert
    const { data: alert, error: alertError } = await supabase
      .from('asha_alerts')
      .insert({
        user_id: userProfile?.id,
        triggered_by_user_id: ashaUser.id,
        severity_level,
        alert_type,
        description,
        symptoms_reported,
        voice_note_url,
        voice_transcription,
        location_lat,
        location_lng,
        location_address,
        status: 'open',
        follow_up_required: true,
      })
      .select()
      .single()

    if (alertError) {
      console.error('Error creating alert:', alertError)
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 500 }
      )
    }

    // If user has a linked ASHA worker, notify them (in a real app, send SMS/notification)
    if (userProfile?.linked_asha_id) {
      // TODO: Send notification to ASHA worker
      console.log('Alert created, notify ASHA worker:', userProfile.linked_asha_id)
    }

    return NextResponse.json({
      success: true,
      alert: {
        id: alert.id,
        severity_level: alert.severity_level,
        status: alert.status,
        created_at: alert.created_at,
      },
      message: 'Emergency alert created successfully. Help is on the way.',
      message_hindi: 'इमरजेंसी अलर्ट भेज दिया गया है। मदद आ रही है।'
    })
  } catch (error) {
    console.error('Alert creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

