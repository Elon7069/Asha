import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface Scheme {
  id: string
  name: string
  nameHindi: string
  description: string
  eligibility: string[]
  benefitAmount: number
  isActive: boolean
  districts: string[]
  viewsCount: number
  eligiblePopulation: number
  createdDate: string
  lastUpdated: string
}

// In-memory store for MVP (replace with Supabase later)
let schemes: Scheme[] = [
  {
    id: 's1',
    name: 'Pradhan Mantri Matru Vandana Yojana',
    nameHindi: 'प्रधानमंत्री मातृ वंदना योजना',
    description: 'Cash benefit for pregnant and lactating mothers for better nutrition and health care',
    eligibility: ['Pregnant women', 'First living child', 'Age 19+ years'],
    benefitAmount: 5000,
    isActive: true,
    districts: ['Raipur', 'Bilaspur', 'Durg'],
    viewsCount: 1247,
    eligiblePopulation: 2890,
    createdDate: '2023-01-15',
    lastUpdated: '2024-12-01'
  },
  {
    id: 's2',
    name: 'Janani Suraksha Yojana',
    nameHindi: 'जननी सुरक्षा योजना',
    description: 'Cash assistance for institutional delivery to reduce maternal and neonatal mortality',
    eligibility: ['Pregnant women', 'BPL family', 'Institutional delivery'],
    benefitAmount: 1400,
    isActive: true,
    districts: ['Raipur', 'Bilaspur'],
    viewsCount: 987,
    eligiblePopulation: 1567,
    createdDate: '2023-03-10',
    lastUpdated: '2024-11-15'
  },
  {
    id: 's3',
    name: 'Mukhyamantri Suposhan Yojana',
    nameHindi: 'मुख्यमंत्री सुपोषण योजना',
    description: 'State scheme for nutrition support to pregnant and lactating mothers',
    eligibility: ['Pregnant women', 'Lactating mothers', 'State resident'],
    benefitAmount: 3000,
    isActive: false,
    districts: ['Durg'],
    viewsCount: 456,
    eligiblePopulation: 890,
    createdDate: '2023-06-20',
    lastUpdated: '2024-10-05'
  }
]

// GET: Fetch all schemes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    let filteredSchemes = schemes
    if (activeOnly) {
      filteredSchemes = schemes.filter(s => s.isActive)
    }

    const summary = {
      totalSchemes: schemes.length,
      activeSchemes: schemes.filter(s => s.isActive).length,
      totalViews: schemes.reduce((sum, s) => sum + s.viewsCount, 0),
      totalEligible: schemes.reduce((sum, s) => sum + s.eligiblePopulation, 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        schemes: filteredSchemes,
        summary,
        lastUpdated: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Schemes fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schemes' },
      { status: 500 }
    )
  }
}

// POST: Create new scheme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newScheme: Scheme = {
      id: `s${Date.now()}`,
      name: body.name,
      nameHindi: body.nameHindi || '',
      description: body.description || '',
      eligibility: body.eligibility || [],
      benefitAmount: body.benefitAmount || 0,
      isActive: body.isActive ?? true,
      districts: body.districts || [],
      viewsCount: 0,
      eligiblePopulation: body.eligiblePopulation || 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    
    schemes.push(newScheme)

    return NextResponse.json({
      success: true,
      data: newScheme,
      message: 'Scheme created successfully'
    })
    
  } catch (error) {
    console.error('Scheme create error:', error)
    return NextResponse.json(
      { error: 'Failed to create scheme' },
      { status: 500 }
    )
  }
}

// PUT: Update scheme
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const schemeIndex = schemes.findIndex(s => s.id === id)
    if (schemeIndex === -1) {
      return NextResponse.json(
        { error: 'Scheme not found' },
        { status: 404 }
      )
    }
    
    schemes[schemeIndex] = {
      ...schemes[schemeIndex],
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      data: schemes[schemeIndex],
      message: 'Scheme updated successfully'
    })
    
  } catch (error) {
    console.error('Scheme update error:', error)
    return NextResponse.json(
      { error: 'Failed to update scheme' },
      { status: 500 }
    )
  }
}

// PATCH: Toggle scheme status
export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    const schemeIndex = schemes.findIndex(s => s.id === id)
    if (schemeIndex === -1) {
      return NextResponse.json(
        { error: 'Scheme not found' },
        { status: 404 }
      )
    }
    
    schemes[schemeIndex].isActive = !schemes[schemeIndex].isActive
    schemes[schemeIndex].lastUpdated = new Date().toISOString().split('T')[0]

    return NextResponse.json({
      success: true,
      data: schemes[schemeIndex],
      message: `Scheme ${schemes[schemeIndex].isActive ? 'activated' : 'deactivated'}`
    })
    
  } catch (error) {
    console.error('Scheme toggle error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle scheme status' },
      { status: 500 }
    )
  }
}
