'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Heart, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  MapPin,
  Calendar,
  Activity,
  ArrowLeft
} from 'lucide-react'

interface DashboardStats {
  totalActiveWomen: number
  pregnantWomen: number
  highRiskCases: number
  redZoneAlerts: number
  vaccinationCoverage: number
  trend: 'up' | 'down' | 'stable'
}

// Mock aggregated data (district/block level only)
const mockStats: DashboardStats = {
  totalActiveWomen: 2847,
  pregnantWomen: 342,
  highRiskCases: 89,
  redZoneAlerts: 23,
  vaccinationCoverage: 87.5,
  trend: 'up'
}

const districtData = [
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

export default function NGODashboardPage() {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState('december-2025')

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Back Button */}
      <div className="flex items-center justify-start pt-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/profile-setup')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">NGO Dashboard</h1>
          <p className="text-slate-600 mt-1">Population-level decision support interface</p>
        </div>
        
        {/* Month Selector */}
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="december-2025">December 2025</SelectItem>
            <SelectItem value="november-2025">November 2025</SelectItem>
            <SelectItem value="october-2025">October 2025</SelectItem>
            <SelectItem value="september-2025">September 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Active Women */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {mockStats.totalActiveWomen.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Total Active Women</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pregnant Women */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {mockStats.pregnantWomen}
                </div>
                <div className="text-sm text-slate-600">Pregnant Women</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Risk Cases */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {mockStats.highRiskCases}
                </div>
                <div className="text-sm text-slate-600">High-Risk Cases</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Red Zone Alerts */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {mockStats.redZoneAlerts}
                </div>
                <div className="text-sm text-slate-600">Red-Zone Alerts (30d)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vaccination Coverage */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {mockStats.vaccinationCoverage}%
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-1">
                  Vaccination Coverage
                  {getTrendIcon(mockStats.trend)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* District-wise Breakdown */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-600" />
            District-wise Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {districtData.map((district) => (
              <motion.div
                key={district.district}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <div className="font-semibold text-slate-900">{district.district}</div>
                  <div className="text-sm text-slate-600">District</div>
                </div>
                
                <div className="text-center">
                  <div className="font-bold text-slate-900">{district.activeWomen.toLocaleString()}</div>
                  <div className="text-xs text-slate-600">Active Women</div>
                </div>
                
                <div className="text-center">
                  <div className="font-bold text-slate-900">{district.pregnantWomen}</div>
                  <div className="text-xs text-slate-600">Pregnant</div>
                </div>
                
                <div className="text-center">
                  <div className="font-bold text-orange-600">{district.highRiskCases}</div>
                  <div className="text-xs text-slate-600">High Risk</div>
                </div>
                
                <div className="text-center">
                  <div className="font-bold text-red-600">{district.alerts}</div>
                  <div className="text-xs text-slate-600">Alerts</div>
                </div>
                
                <div className="text-center">
                  <div className="font-bold text-green-600">{district.vaccination}%</div>
                  <div className="text-xs text-slate-600">Vaccination</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* System Health */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">ASHA Response Time</span>
                <Badge className="bg-green-100 text-green-700">Good</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Coverage Gaps</span>
                <Badge className="bg-yellow-100 text-yellow-700">Needs Attention</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Emergency Response</span>
                <Badge className="bg-green-100 text-green-700">Optimal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intervention Priorities */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Intervention Priorities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-semibold text-orange-800">Nutrition Camp Needed</div>
                <div className="text-sm text-orange-600">Block A showing high anemia cases</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-semibold text-blue-800">Staff Support</div>
                <div className="text-sm text-blue-600">3 villages under-covered</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-800">Scheme Awareness</div>
                <div className="text-sm text-green-600">Good uptake in rural areas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}