import { NextRequest, NextResponse } from 'next/server'
import { predictNextPeriod, calculateFertileWindow } from '@/lib/utils/menstrual'

/**
 * Period Prediction API
 * Calculates next period date and fertile window
 */
export async function POST(request: NextRequest) {
  try {
    const { lastPeriodDate, avgCycleLength = 28 } = await request.json()
    
    if (!lastPeriodDate) {
      return NextResponse.json(
        { error: 'Last period date is required' },
        { status: 400 }
      )
    }
    
    const lastPeriod = new Date(lastPeriodDate)
    const prediction = predictNextPeriod(lastPeriod, avgCycleLength)
    const fertileWindow = calculateFertileWindow(prediction.nextPeriod)
    
    return NextResponse.json({
      next_period_date: prediction.nextPeriod.toISOString().split('T')[0],
      fertile_window_start: fertileWindow.start.toISOString().split('T')[0],
      fertile_window_end: fertileWindow.end.toISOString().split('T')[0],
      confidence: prediction.confidence,
      days_until_period: Math.ceil(
        (prediction.nextPeriod.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    })
    
  } catch (error: any) {
    console.error('Period prediction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to predict period' },
      { status: 500 }
    )
  }
}

