import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET: Fetch NGO dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // For MVP, return mock data with structure ready for real data
    // Once tables are populated, these will be real queries
    
    const stats = {
      totalActiveWomen: 2847,
      pregnantWomen: 342,
      highRiskCases: 89,
      redZoneAlerts: 23,
      vaccinationCoverage: 87.5,
      trend: 'up' as const,
    }

    const districts = [
      {
        district: 'Raipur',
        activeWomen: 1256,
        pregnantWomen: 156,
        highRiskCases: 45,
        alerts: 12,
        vaccination: 89.2
      },
      {
        district: 'Bilaspur',
        activeWomen: 987,
        pregnantWomen: 120,
        highRiskCases: 28,
        alerts: 8,
        vaccination: 85.1
      },
      {
        district: 'Durg',
        activeWomen: 604,
        pregnantWomen: 66,
        highRiskCases: 16,
        alerts: 3,
        vaccination: 88.7
      }
    ]

    const systemHealth = {
      ashaResponseTime: 'good',
      coverageGaps: 'needs-attention',
      emergencyResponse: 'optimal'
    }

    const interventions = [
      {
        type: 'nutrition',
        title: 'Nutrition Camp Needed',
        description: 'Block A showing high anemia cases',
        priority: 'high'
      },
      {
        type: 'staff',
        title: 'Staff Support',
        description: '3 villages under-covered',
        priority: 'medium'
      },
      {
        type: 'scheme',
        title: 'Scheme Awareness',
        description: 'Good uptake in rural areas',
        priority: 'low'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        stats,
        districts,
        systemHealth,
        interventions,
        lastUpdated: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('NGO stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NGO statistics' },
      { status: 500 }
    )
  }
}
