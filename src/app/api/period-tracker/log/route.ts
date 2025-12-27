import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { addDays, differenceInDays } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      period_start_date,
      period_end_date,
      flow_intensity,
      pain_level,
      symptoms,
      notes,
      voice_note_url,
    } = body

    if (!period_start_date) {
      return NextResponse.json(
        { error: 'Period start date is required' },
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

    // Get the user's profile
    const { data: ashaUser } = await supabase
      .from('asha_users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!ashaUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { data: userProfile } = await supabase
      .from('asha_user_profiles')
      .select('id, average_cycle_length')
      .eq('user_id', ashaUser.id)
      .single()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get the last period to calculate cycle length
    const { data: lastPeriod } = await supabase
      .from('menstrual_cycles')
      .select('period_start_date')
      .eq('user_id', userProfile.id)
      .order('period_start_date', { ascending: false })
      .limit(1)
      .single()

    // Calculate cycle length
    let cycleLength = userProfile.average_cycle_length || 28
    if (lastPeriod) {
      const daysBetween = differenceInDays(
        new Date(period_start_date),
        new Date(lastPeriod.period_start_date)
      )
      if (daysBetween > 0 && daysBetween < 60) {
        cycleLength = daysBetween
      }
    }

    // Calculate predictions
    const startDate = new Date(period_start_date)
    const predictedNextPeriod = addDays(startDate, cycleLength)
    const ovulationDay = addDays(predictedNextPeriod, -14)
    const fertileWindowStart = addDays(ovulationDay, -5)
    const fertileWindowEnd = addDays(ovulationDay, 1)

    // Create the cycle record
    const { data: cycle, error: cycleError } = await supabase
      .from('menstrual_cycles')
      .insert({
        user_id: userProfile.id,
        period_start_date,
        period_end_date,
        cycle_length: cycleLength,
        flow_intensity,
        pain_level,
        symptoms,
        notes,
        voice_note_url,
        is_predicted: false,
        predicted_next_period: predictedNextPeriod.toISOString().split('T')[0],
        predicted_fertile_window_start: fertileWindowStart.toISOString().split('T')[0],
        predicted_fertile_window_end: fertileWindowEnd.toISOString().split('T')[0],
      })
      .select()
      .single()

    if (cycleError) {
      console.error('Error logging period:', cycleError)
      return NextResponse.json(
        { error: 'Failed to log period' },
        { status: 500 }
      )
    }

    // Update user profile with last period date and average cycle length
    const { data: allCycles } = await supabase
      .from('menstrual_cycles')
      .select('cycle_length')
      .eq('user_id', userProfile.id)
      .not('cycle_length', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)

    const avgCycleLength = allCycles && allCycles.length > 0
      ? Math.round(allCycles.reduce((sum, c) => sum + (c.cycle_length || 28), 0) / allCycles.length)
      : 28

    await supabase
      .from('asha_user_profiles')
      .update({
        last_period_date: period_start_date,
        average_cycle_length: avgCycleLength,
        last_menstrual_flow: flow_intensity,
        menstrual_pain_level: pain_level,
      })
      .eq('id', userProfile.id)

    return NextResponse.json({
      success: true,
      cycle: {
        id: cycle.id,
        period_start_date: cycle.period_start_date,
        cycle_length: cycleLength,
        predicted_next_period: cycle.predicted_next_period,
        predicted_fertile_window_start: cycle.predicted_fertile_window_start,
        predicted_fertile_window_end: cycle.predicted_fertile_window_end,
      },
      message: 'Period logged successfully',
      message_hindi: 'पीरियड लॉग हो गया',
    })
  } catch (error) {
    console.error('Period logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log period' },
      { status: 500 }
    )
  }
}

