'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { 
  Map, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Clock,
  Filter,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface Village {
  id: string
  name: string
  totalWomen: number
  highRiskPercentage: number
  alertsRaised: number
  avgResponseTime: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  coordinates: { x: number; y: number }
}

export default function NGOHeatmapPage() {
  const router = useRouter()
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null)
  const [villages, setVillages] = useState<Village[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [layers, setLayers] = useState({
    pregnancyRisk: true,
    emergencyAlerts: true,
    vaccinations: false
  })

  const fetchHeatmapData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/ngo/heatmap')
      if (!response.ok) throw new Error('Failed to fetch heatmap data')
      const result = await response.json()
      setVillages(result.data.villages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHeatmapData()
  }, [])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-400'
    }
  }

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-700'
      case 'high': return 'text-orange-700'
      case 'medium': return 'text-yellow-700'
      case 'low': return 'text-green-700'
      default: return 'text-gray-700'
    }
  }

  const handleVillageClick = (village: Village) => {
    setSelectedVillage(village)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-600">Loading heatmap data...</p>
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
            <Button onClick={fetchHeatmapData} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              <Map className="w-8 h-8 text-slate-600" />
              Geographic Risk Heatmap
            </h1>
            <p className="text-slate-600 mt-1">Village-level risk patterns and response coverage</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchHeatmapData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          {/* Layer Controls */}
          <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Map Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="pregnancy-risk" className="text-sm">High-Risk Pregnancy</Label>
              <Switch
                id="pregnancy-risk"
                checked={layers.pregnancyRisk}
                onCheckedChange={(checked) => setLayers(prev => ({ ...prev, pregnancyRisk: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emergency-alerts" className="text-sm">Emergency Alerts</Label>
              <Switch
                id="emergency-alerts"
                checked={layers.emergencyAlerts}
                onCheckedChange={(checked) => setLayers(prev => ({ ...prev, emergencyAlerts: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vaccinations" className="text-sm">Vaccination Gaps</Label>
              <Switch
                id="vaccinations"
                checked={layers.vaccinations}
                onCheckedChange={(checked) => setLayers(prev => ({ ...prev, vaccinations: checked }))}
              />
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              District Risk Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-slate-100 rounded-lg p-8 h-96">
              
              {/* Simulated Map Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg"></div>
                {/* Add some geographical features */}
                <div className="absolute top-1/4 left-1/3 w-16 h-8 bg-blue-200 rounded-full opacity-60"></div>
                <div className="absolute bottom-1/3 right-1/4 w-20 h-4 bg-brown-200 rounded opacity-40"></div>
              </div>

              {/* Village Markers */}
              {villages.map((village) => (
                <button
                  key={village.id}
                  onClick={() => handleVillageClick(village)}
                  className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform ${getRiskColor(village.riskLevel)} ${
                    selectedVillage?.id === village.id ? 'ring-4 ring-slate-400' : ''
                  }`}
                  style={{
                    left: `${village.coordinates.x}%`,
                    top: `${village.coordinates.y}%`
                  }}
                  title={village.name}
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {village.alertsRaised}
                  </div>
                </button>
              ))}
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border">
                <div className="text-xs font-semibold text-slate-700 mb-2">Risk Level</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-xs text-slate-600">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Village Details Panel */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Village Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedVillage ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900">{selectedVillage.name}</h3>
                  <Badge className={`${getRiskColor(selectedVillage.riskLevel)} text-white mt-2`}>
                    {selectedVillage.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-slate-600">Total Women</div>
                      <div className="text-lg font-semibold text-slate-900">{selectedVillage.totalWomen}</div>
                    </div>
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-slate-600">High Risk %</div>
                      <div className={`text-lg font-semibold ${getRiskTextColor(selectedVillage.riskLevel)}`}>
                        {selectedVillage.highRiskPercentage}%
                      </div>
                    </div>
                    <AlertTriangle className="w-6 h-6 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-slate-600">Alerts Raised</div>
                      <div className="text-lg font-semibold text-slate-900">{selectedVillage.alertsRaised}</div>
                    </div>
                    <AlertTriangle className="w-6 h-6 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-slate-600">Avg Response Time</div>
                      <div className="text-lg font-semibold text-slate-900">{selectedVillage.avgResponseTime}</div>
                    </div>
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                </div>

                {/* Intervention Suggestions */}
                {selectedVillage.riskLevel === 'critical' || selectedVillage.riskLevel === 'high' ? (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-sm font-semibold text-orange-800 mb-2">Recommended Interventions</div>
                    <div className="text-sm text-orange-700 space-y-1">
                      {selectedVillage.riskLevel === 'critical' && (
                        <>
                          <div>• Immediate mobile health camp</div>
                          <div>• Additional ASHA support</div>
                        </>
                      )}
                      <div>• Nutrition awareness program</div>
                      <div>• Enhanced surveillance</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm font-semibold text-green-800 mb-2">Status: Good</div>
                    <div className="text-sm text-green-700">Continue current support level</div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Click on a village marker to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">5</div>
            <div className="text-sm text-slate-600">Villages Monitored</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">1</div>
            <div className="text-sm text-slate-600">Critical Risk</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">1</div>
            <div className="text-sm text-slate-600">High Risk</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">49 min</div>
            <div className="text-sm text-slate-600">Avg Response Time</div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}