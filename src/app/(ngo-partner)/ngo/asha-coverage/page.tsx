'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Activity,
  ArrowLeft,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

interface AshaData {
  id: string
  name: string
  block: string
  beneficiaries: number
  recommendedLimit: number
  lastVisitDays: number
  coverageStatus: 'optimal' | 'needs-support' | 'overloaded'
  villages: string[]
}

interface BlockSummary {
  block: string
  ashaCount: number
  totalBeneficiaries: number
  avgBeneficiariesPerAsha: number
  underCoveredVillages: number
  status: string
}

interface UnderCoveredArea {
  village: string
  block: string
  population: number
  lastVisit: string
  nearestAsha: string
  priority: string
}

interface CapacityMetrics {
  totalAshas: number
  avgBeneficiariesPerAsha: number
  needSupport: number
  underCoveredVillages: number
}

interface CoverageData {
  ashas: AshaData[]
  blocks: BlockSummary[]
  underCoveredAreas: UnderCoveredArea[]
  capacityMetrics: CapacityMetrics
}

export default function AshaWforcePage() {
  const router = useRouter()
  const [selectedBlock, setSelectedBlock] = useState<string>('all')
  const [data, setData] = useState<CoverageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoverageData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/ngo/asha-coverage')
      if (!response.ok) throw new Error('Failed to fetch coverage data')
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoverageData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-700 border-green-200'
      case 'needs-support': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'overloaded': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'needs-attention': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'needs-support': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'overloaded': return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'needs-attention': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredAshaData = !data ? [] : selectedBlock === 'all' 
    ? data.ashas 
    : data.ashas.filter(asha => asha.block === selectedBlock)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-600">Loading coverage data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-red-200 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCoverageData} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const { ashas, blocks, underCoveredAreas, capacityMetrics } = data

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              ASHA Workload & Coverage
            </h1>
            <p className="text-slate-600 mt-1">Support gap identification and capacity planning</p>
          </div>
        </div>

        {/* Block Filter */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchCoverageData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <div className="flex gap-2">
            {['all', 'Block A', 'Block B', 'Block C'].map((block) => (
              <Button
                key={block}
                variant={selectedBlock === block ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBlock(block)}
                className={selectedBlock === block ? 'bg-slate-700' : 'border-slate-300'}
              >
                {block === 'all' ? 'All Blocks' : block}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Block Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blocks.map((block) => (
          <Card key={block.block} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{block.block}</h3>
                  <Badge className={`${getStatusColor(block.status)} mt-1`}>
                    {getStatusIcon(block.status)}
                    <span className="ml-1">
                      {block.status === 'needs-attention' ? 'Needs Attention' :
                       block.status === 'needs-support' ? 'Needs Support' : 'Optimal'}
                    </span>
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">ASHAs</span>
                  <span className="font-semibold text-slate-900">{block.ashaCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Beneficiaries</span>
                  <span className="font-semibold text-slate-900">{block.totalBeneficiaries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg per ASHA</span>
                  <span className={`font-semibold ${
                    block.avgBeneficiariesPerAsha > 150 ? 'text-orange-600' : 'text-slate-900'
                  }`}>
                    {block.avgBeneficiariesPerAsha}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Under-covered Villages</span>
                  <span className={`font-semibold ${
                    block.underCoveredVillages > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {block.underCoveredVillages}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ASHA Workload Details */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">ASHA Workload Overview</CardTitle>
          <p className="text-sm text-slate-600">Non-punitive assessment for support allocation</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAshaData.map((asha) => (
              <motion.div
                key={asha.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{asha.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{asha.block}</span>
                      <span>•</span>
                      <span>Villages: {asha.villages.join(', ')}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(asha.coverageStatus)}>
                    {getStatusIcon(asha.coverageStatus)}
                    <span className="ml-1">
                      {asha.coverageStatus === 'needs-support' ? 'Needs Support' :
                       asha.coverageStatus === 'overloaded' ? 'Overloaded' : 'Optimal'}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-bold text-slate-900">{asha.beneficiaries}</div>
                    <div className="text-xs text-slate-600">Beneficiaries</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Limit: {asha.recommendedLimit}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded border">
                    <div className={`text-lg font-bold ${
                      asha.beneficiaries > asha.recommendedLimit ? 'text-orange-600' : 'text-slate-900'
                    }`}>
                      {Math.round((asha.beneficiaries / asha.recommendedLimit) * 100)}%
                    </div>
                    <div className="text-xs text-slate-600">Capacity</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-bold text-slate-900">{asha.lastVisitDays}</div>
                    <div className="text-xs text-slate-600">Days since last visit</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-bold text-slate-900">{asha.villages.length}</div>
                    <div className="text-xs text-slate-600">Villages covered</div>
                  </div>
                </div>

                {/* Support Recommendations */}
                {asha.coverageStatus !== 'optimal' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-semibold text-blue-800 mb-1">Support Recommendations</div>
                    <div className="text-sm text-blue-700">
                      {asha.coverageStatus === 'overloaded' && 
                        'Consider additional ASHA deployment or redistribution of beneficiaries.'}
                      {asha.coverageStatus === 'needs-support' && 
                        'Provide additional resources or temporary assistance during peak periods.'}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Under-covered Areas */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Areas Needing Coverage Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {underCoveredAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-orange-900">{area.village}</h3>
                    <div className="text-sm text-orange-700 mt-1">
                      {area.block} • Population: {area.population}
                    </div>
                  </div>
                  <Badge className={`
                    ${area.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                  `}>
                    {area.priority} priority
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-orange-700 font-medium">Last Visit:</span>
                    <div className="text-orange-800">{area.lastVisit}</div>
                  </div>
                  <div>
                    <span className="text-orange-700 font-medium">Nearest ASHA:</span>
                    <div className="text-orange-800">{area.nearestAsha}</div>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-white border border-orange-300 rounded">
                  <div className="text-sm text-orange-800">
                    <strong>Recommendation:</strong> Consider mobile outreach or temporary coverage arrangement
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">{capacityMetrics.totalAshas}</div>
            <div className="text-sm text-slate-600">Total ASHAs</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">{capacityMetrics.avgBeneficiariesPerAsha}</div>
            <div className="text-sm text-slate-600">Avg Beneficiaries/ASHA</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{capacityMetrics.needSupport}</div>
            <div className="text-sm text-slate-600">Need Support</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{capacityMetrics.underCoveredVillages}</div>
            <div className="text-sm text-slate-600">Under-covered Villages</div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}