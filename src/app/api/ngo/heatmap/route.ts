import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Mock villages data for heatmap
const mockVillages = [
  {
    id: 'v1',
    name: 'Rampur',
    totalWomen: 156,
    highRiskPercentage: 23,
    alertsRaised: 8,
    avgResponseTime: '45 min',
    riskLevel: 'high',
    coordinates: { x: 20, y: 30 }
  },
  {
    id: 'v2',
    name: 'Sitapur',
    totalWomen: 89,
    highRiskPercentage: 45,
    alertsRaised: 15,
    avgResponseTime: '1.2 hrs',
    riskLevel: 'critical',
    coordinates: { x: 45, y: 25 }
  },
  {
    id: 'v3',
    name: 'Gokulpur',
    totalWomen: 234,
    highRiskPercentage: 12,
    alertsRaised: 3,
    avgResponseTime: '25 min',
    riskLevel: 'low',
    coordinates: { x: 65, y: 40 }
  },
  {
    id: 'v4',
    name: 'Shanti Nagar',
    totalWomen: 178,
    highRiskPercentage: 34,
    alertsRaised: 11,
    avgResponseTime: '55 min',
    riskLevel: 'medium',
    coordinates: { x: 30, y: 65 }
  },
  {
    id: 'v5',
    name: 'Naya Gaon',
    totalWomen: 67,
    highRiskPercentage: 8,
    alertsRaised: 1,
    avgResponseTime: '20 min',
    riskLevel: 'low',
    coordinates: { x: 75, y: 60 }
  }
]

// GET: Fetch heatmap village data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const riskFilter = searchParams.get('risk') // critical, high, medium, low, all
    
    let filteredVillages = mockVillages
    
    if (riskFilter && riskFilter !== 'all') {
      filteredVillages = mockVillages.filter(v => v.riskLevel === riskFilter)
    }

    const summary = {
      totalVillages: mockVillages.length,
      criticalRisk: mockVillages.filter(v => v.riskLevel === 'critical').length,
      highRisk: mockVillages.filter(v => v.riskLevel === 'high').length,
      avgResponseTime: '49 min'
    }

    return NextResponse.json({
      success: true,
      data: {
        villages: filteredVillages,
        summary,
        lastUpdated: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Heatmap data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    )
  }
}
