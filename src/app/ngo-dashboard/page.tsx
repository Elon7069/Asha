'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart,
  AlertTriangle,
  Shield,
  Activity,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Info,
  ChevronDown,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RoleBasedLayout from '@/components/layout/RoleBasedLayout'

interface MetricCard {
  title: string
  titleHindi: string
  value: number
  unit?: string
  trend: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    period: string
  }
  status: 'good' | 'warning' | 'urgent'
  icon: React.ElementType
}

interface DashboardFilters {
  state: string
  district: string
  block: string
  timeRange: string
}

export default function NGODashboard() {
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [filters, setFilters] = React.useState<DashboardFilters>({
    state: 'all',
    district: 'all',
    block: 'all',
    timeRange: '30'
  })

  const [metrics, setMetrics] = React.useState<MetricCard[]>([
    {
      title: 'Total Active Women',
      titleHindi: 'कुल सक्रिय महिलाएं',
      value: 1247,
      trend: { direction: 'up', percentage: 8.2, period: 'vs last month' },
      status: 'good',
      icon: Users
    },
    {
      title: 'Pregnant Women',
      titleHindi: 'गर्भवती महिलाएं',
      value: 189,
      trend: { direction: 'up', percentage: 3.1, period: 'vs last month' },
      status: 'good',
      icon: Heart
    },
    {
      title: 'High-Risk Cases',
      titleHindi: 'उच्च जोखिम मामले',
      value: 23,
      trend: { direction: 'down', percentage: 12.5, period: 'vs last month' },
      status: 'warning',
      icon: AlertTriangle
    },
    {
      title: 'Red Zone Alerts',
      titleHindi: 'रेड जोन अलर्ट',
      value: 8,
      unit: 'this month',
      trend: { direction: 'down', percentage: 33.3, period: 'vs last month' },
      status: 'urgent',
      icon: Shield
    },
    {
      title: 'Vaccination Coverage',
      titleHindi: 'टीकाकरण कवरेज',
      value: 87.4,
      unit: '%',
      trend: { direction: 'up', percentage: 2.1, period: 'vs last quarter' },
      status: 'good',
      icon: Activity
    },
    {
      title: 'IFA Adherence',
      titleHindi: 'IFA अनुपालन',
      value: 73.8,
      unit: '%',
      trend: { direction: 'up', percentage: 5.3, period: 'vs last month' },
      status: 'warning',
      icon: BarChart3
    }
  ])

  React.useEffect(() => {
    // Simulate loading dashboard data
    const loadData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setLoading(false)
    }
    
    loadData()
  }, [filters])

  const refreshData = async () => {
    setRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (direction: string) => {
    return direction === 'up' ? TrendingUp : TrendingDown
  }

  const getTrendColor = (direction: string, status: string) => {
    if (status === 'urgent' || status === 'warning') {
      return direction === 'down' ? 'text-green-500' : 'text-red-500'
    }
    return direction === 'up' ? 'text-green-500' : 'text-red-500'
  }

  if (loading) {
    return (
      <RoleBasedLayout role="ngo_partner">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout role="ngo_partner">
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Health System Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Population-level maternal health insights and decision support
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={refreshData}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50 to-white">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-gray-700">Filters:</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={filters.state} onValueChange={(value) => setFilters({...filters, state: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="uttar_pradesh">Uttar Pradesh</SelectItem>
                    <SelectItem value="bihar">Bihar</SelectItem>
                    <SelectItem value="jharkhand">Jharkhand</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.district} onValueChange={(value) => setFilters({...filters, district: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="allahabad">Allahabad</SelectItem>
                    <SelectItem value="varanasi">Varanasi</SelectItem>
                    <SelectItem value="kanpur">Kanpur</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.block} onValueChange={(value) => setFilters({...filters, block: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    <SelectItem value="block1">Block 1</SelectItem>
                    <SelectItem value="block2">Block 2</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.timeRange} onValueChange={(value) => setFilters({...filters, timeRange: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon
            const TrendIcon = getTrendIcon(metric.trend.direction)
            
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${getStatusColor(metric.status)} border-2 hover:shadow-lg transition-all duration-200`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/80">
                          <IconComponent className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium text-gray-700">
                            {metric.title}
                          </CardTitle>
                          <p className="text-xs text-gray-500">
                            {metric.titleHindi}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${metric.status === 'urgent' ? 'border-red-300 text-red-700' : 
                          metric.status === 'warning' ? 'border-amber-300 text-amber-700' : 
                          'border-green-300 text-green-700'}`}
                      >
                        {metric.status === 'urgent' ? 'Action Needed' : 
                         metric.status === 'warning' ? 'Monitor' : 'Good'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {metric.value.toLocaleString()}
                        </span>
                        {metric.unit && (
                          <span className="text-sm text-gray-600">
                            {metric.unit}
                          </span>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-1 text-sm ${getTrendColor(metric.trend.direction, metric.status)}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="font-medium">
                          {metric.trend.percentage}%
                        </span>
                        <span className="text-gray-500">
                          {metric.trend.period}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 border-2 hover:border-indigo-300 hover:bg-indigo-50"
            onClick={() => window.location.href = '/ngo-dashboard/risk-heatmap'}
          >
            <MapPin className="w-5 h-5 text-indigo-600" />
            <span className="text-sm">Risk Heatmap</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 border-2 hover:border-indigo-300 hover:bg-indigo-50"
            onClick={() => window.location.href = '/ngo-dashboard/emergency-analytics'}
          >
            <AlertTriangle className="w-5 h-5 text-indigo-600" />
            <span className="text-sm">Emergency Analytics</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 border-2 hover:border-indigo-300 hover:bg-indigo-50"
            onClick={() => window.location.href = '/ngo-dashboard/workforce-performance'}
          >
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="text-sm">ASHA Performance</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 border-2 hover:border-indigo-300 hover:bg-indigo-50"
            onClick={() => window.location.href = '/ngo-dashboard/scheme-management'}
          >
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span className="text-sm">Scheme Management</span>
          </Button>
        </div>

        {/* Privacy Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900">Privacy & Data Protection</h3>
                <p className="text-sm text-blue-700 mt-1">
                  All data shown is aggregated and anonymized. Individual names, voice recordings, and personal health details are not accessible through this interface. This dashboard is designed for population-level health insights only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}