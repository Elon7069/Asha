'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Activity,
  Brain,
  BarChart3,
  ArrowLeft
} from 'lucide-react'

interface RedFlagData {
  type: string
  count: number
  trend: 'up' | 'down' | 'stable'
  percentage: number
  description: string
}

// Mock red flag trends data
const redFlagData: RedFlagData[] = [
  {
    type: 'Severe Bleeding',
    count: 23,
    trend: 'down',
    percentage: -12,
    description: 'Post-delivery complications'
  },
  {
    type: 'High Blood Pressure',
    count: 45,
    trend: 'up',
    percentage: +18,
    description: 'Pregnancy-induced hypertension'
  },
  {
    type: 'Severe Anemia',
    count: 67,
    trend: 'up',
    percentage: +25,
    description: 'Low hemoglobin levels'
  },
  {
    type: 'Repeated Danger Symptoms',
    count: 12,
    trend: 'stable',
    percentage: 0,
    description: 'Multiple concerning symptoms'
  }
]

const monthlyTrends = [
  { month: 'Sep', bleeding: 28, highBP: 38, anemia: 54, repeated: 15 },
  { month: 'Oct', bleeding: 25, highBP: 41, anemia: 59, repeated: 13 },
  { month: 'Nov', bleeding: 21, highBP: 43, anemia: 62, repeated: 11 },
  { month: 'Dec', bleeding: 23, highBP: 45, anemia: 67, repeated: 12 },
]

const blockAnalysis = [
  {
    block: 'Block A',
    totalCases: 89,
    primaryConcern: 'Severe Anemia',
    trend: 'increasing',
    aiInsight: 'Low IFA adherence reported by ASHAs. Consider nutrition camps and iron supplementation drive.'
  },
  {
    block: 'Block B', 
    totalCases: 56,
    primaryConcern: 'High BP',
    trend: 'stable',
    aiInsight: 'Consistent monitoring by ASHAs showing good control. Continue current protocols.'
  },
  {
    block: 'Block C',
    totalCases: 34,
    primaryConcern: 'Bleeding',
    trend: 'decreasing',
    aiInsight: 'Improved emergency response times. Training interventions showing positive impact.'
  }
]

export default function RedFlagAnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('last-3-months')

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-600" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600'
      case 'down': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getMaxValue = () => {
    const allValues = monthlyTrends.flatMap(month => [
      month.bleeding, month.highBP, month.anemia, month.repeated
    ])
    return Math.max(...allValues) + 10
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
              <AlertTriangle className="w-8 h-8 text-red-600" />
              Red Flag & Emergency Trends
            </h1>
            <p className="text-slate-600 mt-1">Understanding emergency patterns and intervention needs</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            <SelectItem value="last-6-months">Last 6 Months</SelectItem>
            <SelectItem value="last-year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Red Flag Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {redFlagData.map((item) => (
          <Card key={item.type} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-lg font-bold text-slate-900">{item.count}</div>
                  <div className="text-sm text-slate-600">{item.type}</div>
                </div>
                <div className="text-right">
                  {getTrendIcon(item.trend)}
                  <div className={`text-sm font-semibold ${getTrendColor(item.trend)}`}>
                    {item.percentage > 0 ? '+' : ''}{item.percentage}%
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500">{item.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Chart */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Red Flag Cases Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Chart Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Severe Bleeding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>High Blood Pressure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Severe Anemia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Repeated Danger Symptoms</span>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="grid grid-cols-4 gap-4 h-48">
              {monthlyTrends.map((month) => (
                <div key={month.month} className="flex flex-col items-center">
                  <div className="flex-1 flex flex-col justify-end space-y-1 w-full">
                    <div 
                      className="bg-red-500 rounded-t"
                      style={{ height: `${(month.bleeding / getMaxValue()) * 100}%` }}
                      title={`Bleeding: ${month.bleeding}`}
                    ></div>
                    <div 
                      className="bg-orange-500"
                      style={{ height: `${(month.highBP / getMaxValue()) * 100}%` }}
                      title={`High BP: ${month.highBP}`}
                    ></div>
                    <div 
                      className="bg-yellow-500"
                      style={{ height: `${(month.anemia / getMaxValue()) * 100}%` }}
                      title={`Anemia: ${month.anemia}`}
                    ></div>
                    <div 
                      className="bg-purple-500 rounded-b"
                      style={{ height: `${(month.repeated / getMaxValue()) * 100}%` }}
                      title={`Repeated: ${month.repeated}`}
                    ></div>
                  </div>
                  <div className="text-sm text-slate-600 mt-2">{month.month}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights by Block */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blockAnalysis.map((block) => (
              <motion.div
                key={block.block}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{block.block}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-slate-600">{block.totalCases} total cases</span>
                      <Badge className={`
                        ${block.trend === 'increasing' ? 'bg-red-100 text-red-700' : 
                          block.trend === 'decreasing' ? 'bg-green-100 text-green-700' : 
                          'bg-gray-100 text-gray-700'}
                      `}>
                        {block.trend}
                      </Badge>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">
                    {block.primaryConcern}
                  </Badge>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-semibold text-blue-800 mb-1">AI Insight</div>
                  <div className="text-sm text-blue-700">{block.aiInsight}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Critical Patterns */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Critical Patterns Identified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-semibold text-red-800">Anemia Cases Rising</div>
                <div className="text-sm text-red-600">25% increase across rural blocks</div>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-semibold text-orange-800">BP Management Needed</div>
                <div className="text-sm text-orange-600">Higher cases in urban periphery</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-800">Emergency Response Improved</div>
                <div className="text-sm text-green-600">Bleeding cases down 12%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Recommended Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-slate-800">Nutrition Camps</div>
                  <div className="text-sm text-slate-600">Focus on iron-rich food awareness in Block A</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-slate-800">BP Monitoring Kits</div>
                  <div className="text-sm text-slate-600">Deploy additional equipment to high-case areas</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-slate-800">ASHA Training Refresh</div>
                  <div className="text-sm text-slate-600">Reinforce early detection protocols</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}