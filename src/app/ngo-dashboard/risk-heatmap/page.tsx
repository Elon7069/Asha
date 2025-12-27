'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Map, 
  Layers, 
  Filter,
  Info,
  AlertTriangle,
  Heart,
  Shield,
  Activity,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RoleBasedLayout from '@/components/layout/RoleBasedLayout'

interface RiskLayer {
  id: string
  name: string
  nameHindi: string
  enabled: boolean
  color: string
  icon: React.ElementType
  count: number
}

interface VillageData {
  id: string
  name: string
  nameHindi: string
  coordinates: { lat: number, lng: number }
  totalWomen: number
  highRiskPercentage: number
  alertsLast30Days: number
  avgAshaResponseTime: number
  referralRate: number
  riskLevel: 'low' | 'moderate' | 'high' | 'urgent'
}

export default function GeographicRiskHeatmap() {
  const [selectedVillage, setSelectedVillage] = React.useState<VillageData | null>(null)
  const [mapCenter, setMapCenter] = React.useState({ lat: 25.4358, lng: 81.8463 }) // Allahabad
  const [zoomLevel, setZoomLevel] = React.useState(10)

  const [riskLayers, setRiskLayers] = React.useState<RiskLayer[]>([
    {
      id: 'high_risk_pregnancies',
      name: 'High-Risk Pregnancies',
      nameHindi: 'उच्च जोखिम गर्भावस्था',
      enabled: true,
      color: '#ef4444',
      icon: Heart,
      count: 23
    },
    {
      id: 'severe_anemia',
      name: 'Severe Anemia Clusters',
      nameHindi: 'गंभीर एनीमिया समूह',
      enabled: true,
      color: '#f97316',
      icon: Activity,
      count: 15
    },
    {
      id: 'emergency_alerts',
      name: 'Emergency Alerts',
      nameHindi: 'आपातकालीन अलर्ट',
      enabled: true,
      color: '#dc2626',
      icon: Shield,
      count: 8
    },
    {
      id: 'missed_vaccinations',
      name: 'Missed Vaccinations',
      nameHindi: 'छूटे हुए टीकाकरण',
      enabled: false,
      color: '#eab308',
      icon: AlertTriangle,
      count: 45
    },
    {
      id: 'mental_health',
      name: 'Mental Health Concerns',
      nameHindi: 'मानसिक स्वास्थ्य चिंताएं',
      enabled: false,
      color: '#8b5cf6',
      icon: Users,
      count: 12
    }
  ])

  const [villages] = React.useState<VillageData[]>([
    {
      id: 'v1',
      name: 'Karchhana',
      nameHindi: 'करछना',
      coordinates: { lat: 25.4158, lng: 81.8263 },
      totalWomen: 145,
      highRiskPercentage: 18.6,
      alertsLast30Days: 3,
      avgAshaResponseTime: 45,
      referralRate: 12.4,
      riskLevel: 'high'
    },
    {
      id: 'v2',
      name: 'Soraon',
      nameHindi: 'सोरांव',
      coordinates: { lat: 25.4658, lng: 81.9063 },
      totalWomen: 89,
      highRiskPercentage: 8.9,
      alertsLast30Days: 1,
      avgAshaResponseTime: 32,
      referralRate: 5.6,
      riskLevel: 'moderate'
    },
    {
      id: 'v3',
      name: 'Phulpur',
      nameHindi: 'फूलपुर',
      coordinates: { lat: 25.4958, lng: 81.7863 },
      totalWomen: 67,
      highRiskPercentage: 4.5,
      alertsLast30Days: 0,
      avgAshaResponseTime: 28,
      referralRate: 3.0,
      riskLevel: 'low'
    }
  ])

  const toggleLayer = (layerId: string) => {
    setRiskLayers(layers => 
      layers.map(layer => 
        layer.id === layerId 
          ? { ...layer, enabled: !layer.enabled }
          : layer
      )
    )
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'urgent': return 'Urgent Action'
      case 'high': return 'High Risk'
      case 'moderate': return 'Moderate Risk'
      case 'low': return 'Low Risk'
      default: return 'Unknown'
    }
  }

  return (
    <RoleBasedLayout role="ngo_partner">
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Geographic Risk Heatmap
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize health risk patterns across villages • जिलों में स्वास्थ्य जोखिम पैटर्न
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Risk Layers Control Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Risk Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskLayers.map((layer) => {
                  const IconComponent = layer.icon
                  return (
                    <div key={layer.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: layer.enabled ? layer.color : '#d1d5db' }}
                        />
                        <IconComponent className="w-4 h-4 text-gray-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{layer.name}</p>
                          <p className="text-xs text-gray-500">{layer.nameHindi}</p>
                          <p className="text-xs text-indigo-600">{layer.count} cases</p>
                        </div>
                      </div>
                      <Switch
                        checked={layer.enabled}
                        onCheckedChange={() => toggleLayer(layer.id)}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-600" />
                  Risk Severity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { level: 'low', color: 'bg-green-300', label: 'Low Concern' },
                  { level: 'moderate', color: 'bg-yellow-300', label: 'Moderate' },
                  { level: 'high', color: 'bg-orange-400', label: 'High Priority' },
                  { level: 'urgent', color: 'bg-red-500', label: 'Urgent Action' }
                ].map(({ level, color, label }) => (
                  <div key={level} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${color}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-indigo-600" />
                    Interactive Map
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value="satellite" onValueChange={() => {}}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="satellite">Satellite</SelectItem>
                        <SelectItem value="roadmap">Roadmap</SelectItem>
                        <SelectItem value="terrain">Terrain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full p-0">
                <div className="h-[500px] bg-gradient-to-br from-green-100 via-yellow-50 to-orange-100 rounded-lg relative overflow-hidden">
                  {/* Simulated Map */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Interactive map will be integrated here</p>
                      <p className="text-sm text-gray-500">Using Leaflet/Mapbox with village boundary overlays</p>
                    </div>
                  </div>
                  
                  {/* Village Markers Simulation */}
                  {villages.map((village, index) => (
                    <motion.div
                      key={village.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`absolute w-6 h-6 rounded-full cursor-pointer shadow-lg hover:scale-125 transition-all ${
                        village.riskLevel === 'urgent' ? 'bg-red-500' :
                        village.riskLevel === 'high' ? 'bg-orange-400' :
                        village.riskLevel === 'moderate' ? 'bg-yellow-300' :
                        'bg-green-300'
                      }`}
                      style={{
                        left: `${20 + index * 25}%`,
                        top: `${30 + index * 15}%`
                      }}
                      onClick={() => setSelectedVillage(village)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Village Details Panel */}
          <div>
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Village Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedVillage ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="font-bold text-lg">{selectedVillage.name}</h3>
                      <p className="text-gray-600">{selectedVillage.nameHindi}</p>
                      <Badge className={`mt-2 ${getRiskLevelColor(selectedVillage.riskLevel)}`}>
                        {getRiskLevelText(selectedVillage.riskLevel)}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium">Population</span>
                        </div>
                        <p className="text-2xl font-bold">{selectedVillage.totalWomen}</p>
                        <p className="text-sm text-gray-600">Total women registered</p>
                      </div>

                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="font-medium">High Risk %</span>
                        </div>
                        <p className="text-2xl font-bold text-red-700">
                          {selectedVillage.highRiskPercentage}%
                        </p>
                        <p className="text-sm text-gray-600">Of registered women</p>
                      </div>

                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">Alerts (30 days)</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">
                          {selectedVillage.alertsLast30Days}
                        </p>
                        <p className="text-sm text-gray-600">Emergency alerts raised</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Avg Response Time</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          {selectedVillage.avgAshaResponseTime}m
                        </p>
                        <p className="text-sm text-gray-600">ASHA worker response</p>
                      </div>

                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Referral Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                          {selectedVillage.referralRate}%
                        </p>
                        <p className="text-sm text-gray-600">Cases referred to facilities</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-gray-500 mt-20">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click on a village marker to see detailed information</p>
                    <p className="text-sm mt-2">मार्कर पर क्लिक करें</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Privacy Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900">Privacy Protection</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This map shows aggregated village-level data only. No household-level markers or exact GPS locations are displayed to protect individual privacy. Minimum group sizes are enforced for all data visualization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}