'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Brain,
  Filter,
  Download,
  Info,
  Lightbulb
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RoleBasedLayout from '@/components/layout/RoleBasedLayout'

interface EmergencyCategory {
  id: string
  name: string
  nameHindi: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  icon: React.ElementType
  color: string
}

interface TimeSeriesData {
  month: string
  total: number
  categories: { [key: string]: number }
}

interface GeographicData {
  district: string
  districtHindi: string
  total: number
  increase: number
  primaryConcern: string
}

export default function EmergencyAnalytics() {
  const [timeRange, setTimeRange] = React.useState('6months')
  const [selectedDistrict, setSelectedDistrict] = React.useState('all')

  const [emergencyCategories] = React.useState<EmergencyCategory[]>([
    {
      id: 'severe_bleeding',
      name: 'Severe Bleeding',
      nameHindi: 'गंभीर रक्तस्राव',
      count: 15,
      percentage: 31.2,
      trend: 'down',
      trendValue: 8.3,
      icon: Droplets,
      color: '#dc2626'
    },
    {
      id: 'high_bp',
      name: 'High Blood Pressure',
      nameHindi: 'उच्च रक्तचाप',
      count: 12,
      percentage: 25.0,
      trend: 'up',
      trendValue: 12.5,
      icon: Activity,
      color: '#ea580c'
    },
    {
      id: 'no_fetal_movement',
      name: 'No Fetal Movement',
      nameHindi: 'भ्रूण की हलचल नहीं',
      count: 9,
      percentage: 18.8,
      trend: 'stable',
      trendValue: 0,
      icon: Heart,
      color: '#d97706'
    },
    {
      id: 'severe_anemia',
      name: 'Severe Anemia',
      nameHindi: 'गंभीर एनीमिया',
      count: 8,
      percentage: 16.7,
      trend: 'up',
      trendValue: 18.2,
      icon: Thermometer,
      color: '#059669'
    },
    {
      id: 'mental_distress',
      name: 'Mental Distress',
      nameHindi: 'मानसिक परेशानी',
      count: 4,
      percentage: 8.3,
      trend: 'up',
      trendValue: 25.0,
      icon: Brain,
      color: '#7c3aed'
    }
  ])

  const [timeSeriesData] = React.useState<TimeSeriesData[]>([
    { month: 'Jan', total: 32, categories: { severe_bleeding: 12, high_bp: 8, no_fetal_movement: 7, severe_anemia: 3, mental_distress: 2 } },
    { month: 'Feb', total: 28, categories: { severe_bleeding: 10, high_bp: 7, no_fetal_movement: 6, severe_anemia: 3, mental_distress: 2 } },
    { month: 'Mar', total: 35, categories: { severe_bleeding: 13, high_bp: 9, no_fetal_movement: 8, severe_anemia: 3, mental_distress: 2 } },
    { month: 'Apr', total: 41, categories: { severe_bleeding: 14, high_bp: 11, no_fetal_movement: 9, severe_anemia: 4, mental_distress: 3 } },
    { month: 'May', total: 38, categories: { severe_bleeding: 12, high_bp: 10, no_fetal_movement: 8, severe_anemia: 5, mental_distress: 3 } },
    { month: 'Jun', total: 45, categories: { severe_bleeding: 15, high_bp: 12, no_fetal_movement: 9, severe_anemia: 6, mental_distress: 3 } }
  ])

  const [geographicData] = React.useState<GeographicData[]>([
    { district: 'Allahabad', districtHindi: 'इलाहाबाद', total: 18, increase: 12.5, primaryConcern: 'Severe anemia-related alerts' },
    { district: 'Varanasi', districtHindi: 'वाराणसी', total: 12, increase: 8.3, primaryConcern: 'High blood pressure cases' },
    { district: 'Kanpur', districtHindi: 'कानपुर', total: 15, increase: -5.2, primaryConcern: 'Bleeding complications' }
  ])

  const aiInsights = [
    {
      id: 'anemia_trend',
      title: 'Severe Anemia Increase',
      insight: 'In Banda district, severe anemia-related alerts increased by 18% in the last 45 days, especially in villages without regular IFA distribution.',
      actionable: 'Consider targeted IFA supplementation drive in 3 most affected villages.',
      priority: 'high'
    },
    {
      id: 'seasonal_pattern',
      title: 'Seasonal Emergency Pattern',
      insight: 'Blood pressure emergencies show 23% increase during summer months (April-June) compared to winter baseline.',
      actionable: 'Pre-position additional BP monitoring equipment before summer season.',
      priority: 'medium'
    },
    {
      id: 'response_time',
      title: 'Response Time Correlation',
      insight: 'Villages with ASHA response time >60 minutes show 40% higher emergency escalation rates.',
      actionable: 'Prioritize additional ASHA worker deployment in 2 remote villages.',
      priority: 'high'
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return () => <div className="w-4 h-4" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-500'
      case 'down': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <RoleBasedLayout role="ngo_partner">
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Red Flag & Emergency Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Understanding emergency patterns for better intervention • आपातकालीन पैटर्न विश्लेषण
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="geography">Geographic</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Emergency Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyCategories.map((category, index) => {
                const IconComponent = category.icon
                const TrendIcon = getTrendIcon(category.trend)
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-2 hover:shadow-lg transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${category.color}15` }}
                            >
                              <IconComponent 
                                className="w-5 h-5" 
                                style={{ color: category.color }}
                              />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-medium">
                                {category.name}
                              </CardTitle>
                              <p className="text-xs text-gray-500">
                                {category.nameHindi}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold" style={{ color: category.color }}>
                              {category.count}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {category.percentage}% of total
                            </Badge>
                          </div>
                          
                          {category.trend !== 'stable' && (
                            <div className={`flex items-center gap-1 text-sm ${getTrendColor(category.trend)}`}>
                              <TrendIcon className="w-4 h-4" />
                              <span className="font-medium">
                                {category.trendValue}%
                              </span>
                              <span className="text-gray-500">vs last month</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-red-600">48</div>
                <div className="text-sm text-gray-600">Total Alerts (30 days)</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-orange-600">32m</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-green-600">89%</div>
                <div className="text-sm text-gray-600">Resolution Rate</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Hospital Referrals</div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Emergency Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Line chart showing trends will be rendered here</p>
                    <p className="text-sm text-gray-500">Using Chart.js or Recharts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  Emergency Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Pie chart showing distribution will be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    District-wise Emergency Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {geographicData.map((district, index) => (
                    <motion.div
                      key={district.district}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{district.district}</h3>
                          <p className="text-sm text-gray-600">{district.districtHindi}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{district.total}</div>
                          <div className={`text-sm flex items-center gap-1 ${
                            district.increase > 0 ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {district.increase > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(district.increase)}%
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{district.primaryConcern}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Heat Map Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-green-100 via-yellow-100 to-red-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Geographic heatmap integration</p>
                      <p className="text-sm text-gray-500">Emergency density by location</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-l-4 ${
                    insight.priority === 'high' ? 'border-l-red-500' :
                    insight.priority === 'medium' ? 'border-l-yellow-500' :
                    'border-l-green-500'
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-indigo-600" />
                          {insight.title}
                        </CardTitle>
                        <Badge 
                          variant="outline"
                          className={`${
                            insight.priority === 'high' ? 'text-red-700 border-red-300' :
                            insight.priority === 'medium' ? 'text-yellow-700 border-yellow-300' :
                            'text-green-700 border-green-300'
                          }`}
                        >
                          {insight.priority} priority
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Insight:</h4>
                          <p className="text-gray-700">{insight.insight}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Recommended Action:</h4>
                          <p className="text-blue-800">{insight.actionable}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900">AI Insights Disclaimer</h3>
                <p className="text-sm text-blue-700 mt-1">
                  AI-generated insights are recommendations only and should be validated by healthcare professionals. These suggestions are based on pattern analysis of anonymized, aggregated data and are marked as "Insight Suggestion" for clarity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}