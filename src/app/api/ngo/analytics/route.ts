import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Mock red flag analytics data
const redFlagData = [
  {
    type: 'Severe Bleeding',
    count: 23,
    trend: 'down',
    percentage: -12,
    description: 'Post-delivery complications'
  },
  {
    type: 'High Blood Pressure',
    count: 45,
    trend: 'up',
    percentage: +18,
    description: 'Pregnancy-induced hypertension'
  },
  {
    type: 'Severe Anemia',
    count: 67,
    trend: 'up',
    percentage: +25,
    description: 'Low hemoglobin levels'
  },
  {
    type: 'Repeated Danger Symptoms',
    count: 12,
    trend: 'stable',
    percentage: 0,
    description: 'Multiple concerning symptoms'
  }
]

const monthlyTrends = [
  { month: 'Sep', bleeding: 28, highBP: 38, anemia: 54, repeated: 15 },
  { month: 'Oct', bleeding: 25, highBP: 41, anemia: 59, repeated: 13 },
  { month: 'Nov', bleeding: 21, highBP: 43, anemia: 62, repeated: 11 },
  { month: 'Dec', bleeding: 23, highBP: 45, anemia: 67, repeated: 12 },
]

const blockAnalysis = [
  {
    block: 'Block A',
    totalCases: 89,
    primaryConcern: 'Severe Anemia',
    trend: 'increasing',
    aiInsight: 'Low IFA adherence reported by ASHAs. Consider nutrition camps and iron supplementation drive.'
  },
  {
    block: 'Block B',
    totalCases: 56,
    primaryConcern: 'High BP',
    trend: 'stable',
    aiInsight: 'Consistent monitoring by ASHAs showing good control. Continue current protocols.'
  },
  {
    block: 'Block C',
    totalCases: 34,
    primaryConcern: 'Bleeding',
    trend: 'decreasing',
    aiInsight: 'Improved emergency response times. Training interventions showing positive impact.'
  }
]

// GET: Fetch red flag analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || 'last-3-months'

    return NextResponse.json({
      success: true,
      data: {
        redFlags: redFlagData,
        monthlyTrends,
        blockAnalysis,
        timeRange,
        lastUpdated: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Red flag analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch red flag analytics' },
      { status: 500 }
    )
  }
}
