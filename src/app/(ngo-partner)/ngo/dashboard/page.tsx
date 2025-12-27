'use client'

import React, { useState, useEffect } from 'react'
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
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface DashboardStats {
  totalActiveWomen: number
  pregnantWomen: number
  highRiskCases: number
  redZoneAlerts: number
  vaccinationCoverage: number
  trend: 'up' | 'down' | 'stable'
}

interface DistrictData {
  district: string
  activeWomen: number
  pregnantWomen: number
  highRiskCases: number
  alerts: number
  vaccination: number
}

interface SystemHealth {
  ashaResponseTime: string
  coverageGaps: string
  emergencyResponse: string
}

interface Intervention {
  title: string
  description: string
  type: 'warning' | 'info' | 'success'
}

interface DashboardData {
  stats: DashboardStats
  districts: DistrictData[]
  systemHealth: SystemHealth
  interventions: Intervention[]
}

export default function NGODashboardPage() {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState('december-2025')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/ngo/stats?month=${selectedMonth}`)
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [selectedMonth])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getInterventionStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      case 'success': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getInterventionTextStyle = (type: string) => {
    switch (type) {
      case 'warning': return { title: 'text-orange-800', desc: 'text-orange-600' }
      case 'info': return { title: 'text-blue-800', desc: 'text-blue-600' }
      case 'success': return { title: 'text-green-800', desc: 'text-green-600' }
      default: return { title: 'text-gray-800', desc: 'text-gray-600' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-600">Loading dashboard data...</p>
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
            <Button onClick={fetchDashboardData} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const { stats, districts, systemHealth, interventions } = data

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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
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
                  {stats.totalActiveWomen.toLocaleString()}
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
                  {stats.pregnantWomen}
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
                  {stats.highRiskCases}
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
                  {stats.redZoneAlerts}
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
                  {stats.vaccinationCoverage}%
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-1">
                  Vaccination Coverage
                  {getTrendIcon(stats.trend)}
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
            {districts.map((district) => (
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
                <Badge className={`${systemHealth.ashaResponseTime === 'Good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {systemHealth.ashaResponseTime}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Coverage Gaps</span>
                <Badge className={`${systemHealth.coverageGaps === 'Needs Attention' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {systemHealth.coverageGaps}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Emergency Response</span>
                <Badge className={`${systemHealth.emergencyResponse === 'Optimal' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {systemHealth.emergencyResponse}
                </Badge>
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
              {interventions.map((intervention, index) => {
                const textStyle = getInterventionTextStyle(intervention.type)
                return (
                  <div key={index} className={`p-3 border rounded-lg ${getInterventionStyle(intervention.type)}`}>
                    <div className={`font-semibold ${textStyle.title}`}>{intervention.title}</div>
                    <div className={`text-sm ${textStyle.desc}`}>{intervention.description}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}