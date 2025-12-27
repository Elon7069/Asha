import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Mock ASHA coverage data
const ashaData = [
  {
    id: 'a1',
    name: 'Sunita Devi',
    block: 'Block A',
    beneficiaries: 156,
    recommendedLimit: 150,
    lastVisitDays: 2,
    coverageStatus: 'optimal',
    villages: ['Rampur', 'Sitapur'],
    capacity: 104
  },
  {
    id: 'a2',
    name: 'Meera Sharma',
    block: 'Block A',
    beneficiaries: 189,
    recommendedLimit: 150,
    lastVisitDays: 1,
    coverageStatus: 'needs-support',
    villages: ['Gokulpur', 'Naya Gaon'],
    capacity: 126
  },
  {
    id: 'a3',
    name: 'Priya Yadav',
    block: 'Block B',
    beneficiaries: 134,
    recommendedLimit: 150,
    lastVisitDays: 3,
    coverageStatus: 'optimal',
    villages: ['Shanti Nagar'],
    capacity: 89
  },
  {
    id: 'a4',
    name: 'Kavita Singh',
    block: 'Block B',
    beneficiaries: 201,
    recommendedLimit: 150,
    lastVisitDays: 5,
    coverageStatus: 'needs-support',
    villages: ['Purana Gaon', 'Navin Basti', 'Gram Panchayat'],
    capacity: 134
  },
  {
    id: 'a5',
    name: 'Anita Kumari',
    block: 'Block C',
    beneficiaries: 128,
    recommendedLimit: 150,
    lastVisitDays: 1,
    coverageStatus: 'optimal',
    villages: ['Naya Basti'],
    capacity: 85
  }
]

const blockSummary = [
  {
    block: 'Block A',
    ashaCount: 8,
    totalBeneficiaries: 1245,
    avgBeneficiariesPerAsha: 156,
    underCoveredVillages: 2,
    status: 'needs-attention'
  },
  {
    block: 'Block B',
    ashaCount: 6,
    totalBeneficiaries: 987,
    avgBeneficiariesPerAsha: 165,
    underCoveredVillages: 1,
    status: 'needs-support'
  },
  {
    block: 'Block C',
    ashaCount: 5,
    totalBeneficiaries: 678,
    avgBeneficiariesPerAsha: 136,
    underCoveredVillages: 0,
    status: 'optimal'
  }
]

const underCoveredAreas = [
  {
    village: 'Remote Village A',
    block: 'Block A',
    population: 89,
    lastVisit: '12 days ago',
    nearestAsha: 'Sunita Devi (8km away)',
    priority: 'high'
  },
  {
    village: 'Hill Settlement B',
    block: 'Block B',
    population: 67,
    lastVisit: '8 days ago',
    nearestAsha: 'Priya Yadav (6km away)',
    priority: 'medium'
  }
]

// GET: Fetch ASHA coverage data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const block = searchParams.get('block') || 'all'
    
    let filteredAshas = ashaData
    let filteredBlocks = blockSummary
    
    if (block !== 'all') {
      filteredAshas = ashaData.filter(a => a.block === block)
      filteredBlocks = blockSummary.filter(b => b.block === block)
    }

    const capacityMetrics = {
      totalAshas: ashaData.length,
      avgBeneficiariesPerAsha: Math.round(ashaData.reduce((sum, a) => sum + a.beneficiaries, 0) / ashaData.length),
      needSupport: ashaData.filter(a => a.coverageStatus === 'needs-support').length,
      underCoveredVillages: blockSummary.reduce((sum, b) => sum + b.underCoveredVillages, 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        ashas: filteredAshas,
        blocks: filteredBlocks,
        underCoveredAreas,
        capacityMetrics,
        lastUpdated: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('ASHA coverage error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ASHA coverage data' },
      { status: 500 }
    )
  }
}
