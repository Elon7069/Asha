'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Clock,
  TrendingUp,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
  Heart,
  Target,
  Calendar,
  Phone,
  Award,
  Briefcase,
  Filter,
  Download,
  Info,
  BarChart3,
  UserCheck,
  Timer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RoleBasedLayout from '@/components/layout/RoleBasedLayout'

interface AshaWorkerMetrics {
  id: string
  name: string
  nameHindi: string
  employeeId: string
  village: string
  district: string
  beneficiariesAssigned: number
  visitsCompleted: number
  avgResponseTime: number
  highRiskCases: number
  referralsMade: number
  loadPercentage: number
  lastActiveDate: string
  performanceScore: number
  certificationStatus: 'active' | 'due' | 'expired'
}

interface CapacityGap {
  type: 'overload' | 'underserved' | 'no_coverage'
  severity: 'high' | 'medium' | 'low'
  description: string
  location: string
  affectedPopulation: number
  recommendation: string
}

export default function AshaWorkforcePerformance() {
  const [selectedDistrict, setSelectedDistrict] = React.useState('all')
  const [selectedBlock, setSelectedBlock] = React.useState('all')
  const [sortBy, setSortBy] = React.useState('load')

  const [ashaWorkers] = React.useState<AshaWorkerMetrics[]>([
    {
      id: 'asha1',
      name: 'Sunita Devi',
      nameHindi: 'सुनीता देवी',
      employeeId: 'ASHA001',
      village: 'Karchhana',
      district: 'Allahabad',
      beneficiariesAssigned: 145,
      visitsCompleted: 89,
      avgResponseTime: 45,
      highRiskCases: 12,
      referralsMade: 8,
      loadPercentage: 96,
      lastActiveDate: '2024-12-26',
      performanceScore: 87,
      certificationStatus: 'active'
    },
    {
      id: 'asha2',
      name: 'Meera Singh',
      nameHindi: 'मीरा सिंह',
      employeeId: 'ASHA002',
      village: 'Soraon',
      district: 'Allahabad',
      beneficiariesAssigned: 89,
      visitsCompleted: 78,
      avgResponseTime: 32,
      highRiskCases: 6,
      referralsMade: 4,
      loadPercentage: 65,
      lastActiveDate: '2024-12-27',
      performanceScore: 92,
      certificationStatus: 'active'
    },
    {
      id: 'asha3',
      name: 'Kamla Devi',
      nameHindi: 'कमला देवी',
      employeeId: 'ASHA003',
      village: 'Phulpur',
      district: 'Allahabad',
      beneficiariesAssigned: 67,
      visitsCompleted: 45,
      avgResponseTime: 28,
      highRiskCases: 3,
      referralsMade: 2,
      loadPercentage: 48,
      lastActiveDate: '2024-12-25',
      performanceScore: 78,
      certificationStatus: 'due'
    },
    {
      id: 'asha4',
      name: 'Priya Sharma',
      nameHindi: 'प्रिया शर्मा',
      employeeId: 'ASHA004',
      village: 'Handia',
      district: 'Allahabad',
      beneficiariesAssigned: 198,
      visitsCompleted: 134,
      avgResponseTime: 67,
      highRiskCases: 18,
      referralsMade: 15,
      loadPercentage: 132,
      lastActiveDate: '2024-12-27',
      performanceScore: 85,
      certificationStatus: 'active'
    }
  ])

  const [capacityGaps] = React.useState<CapacityGap[]>([
    {
      type: 'overload',
      severity: 'high',
      description: '3 ASHA workers in Block X are handling double the recommended load',
      location: 'Handia Block, Allahabad',
      affectedPopulation: 420,
      recommendation: 'Deploy 2 additional ASHA workers or redistribute beneficiaries'
    },
    {
      type: 'underserved',
      severity: 'medium',
      description: 'Villages without recent visits in the last 15 days',
      location: 'Remote villages in Soraon Block',
      affectedPopulation: 89,
      recommendation: 'Establish mobile clinic schedule or transportation support'
    },
    {
      type: 'no_coverage',
      severity: 'high',
      description: 'Newly formed village cluster without assigned ASHA worker',
      location: 'Kunda Block Extension',
      affectedPopulation: 156,
      recommendation: 'Immediate ASHA worker recruitment and training required'
    }
  ])

  const workforceStats = {
    totalWorkers: 24,
    activeWorkers: 22,
    overloadedWorkers: 3,
    avgLoadPercentage: 78,
    avgResponseTime: 41,
    totalBeneficiaries: 2847,
    monthlyVisits: 1623,
    certificationsDue: 5
  }

  const getLoadColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600 bg-red-50'
    if (percentage > 80) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCertificationBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>
      case 'due':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Due Soon</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getCapacityGapIcon = (type: string) => {
    switch (type) {
      case 'overload': return AlertCircle
      case 'underserved': return Clock
      case 'no_coverage': return MapPin
      default: return AlertCircle
    }
  }

  const getGapSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  return (
    <RoleBasedLayout role="ngo_partner">
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ASHA Workforce Performance
            </h1>
            <p className="text-gray-600 mt-1">
              Non-punitive performance insights for workforce support • आशा कार्यकर्ता प्रदर्शन समर्थन
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="allahabad">Allahabad</SelectItem>
                <SelectItem value="varanasi">Varanasi</SelectItem>
              </SelectContent>
            </Select>
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4" />
              Support Report
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{workforceStats.totalWorkers}</div>
                  <div className="text-sm text-gray-600">Total ASHA Workers</div>
                  <div className="text-xs text-green-600">{workforceStats.activeWorkers} active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Target className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{workforceStats.avgLoadPercentage}%</div>
                  <div className="text-sm text-gray-600">Avg Workload</div>
                  <div className="text-xs text-yellow-600">{workforceStats.overloadedWorkers} overloaded</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{workforceStats.avgResponseTime}m</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                  <div className="text-xs text-blue-600">Target: &lt;30m</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{workforceStats.monthlyVisits}</div>
                  <div className="text-sm text-gray-600">Monthly Visits</div>
                  <div className="text-xs text-green-600">{workforceStats.totalBeneficiaries} beneficiaries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance Overview</TabsTrigger>
            <TabsTrigger value="capacity">Capacity Gaps</TabsTrigger>
            <TabsTrigger value="support">Support Needs</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            {/* Individual ASHA Worker Performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    Individual Performance Metrics
                  </CardTitle>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="load">Workload</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="response">Response Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ashaWorkers.map((worker, index) => (
                    <motion.div
                      key={worker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                        <div className="lg:col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {worker.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium">{worker.name}</h3>
                              <p className="text-sm text-gray-600">{worker.nameHindi}</p>
                              <p className="text-xs text-gray-500">ID: {worker.employeeId}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{worker.village}, {worker.district}</span>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold">{worker.beneficiariesAssigned}</div>
                          <div className="text-sm text-gray-600">Beneficiaries</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${getLoadColor(worker.loadPercentage)}`}>
                            {worker.loadPercentage}% load
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold">{worker.avgResponseTime}m</div>
                          <div className="text-sm text-gray-600">Response Time</div>
                          <div className="text-xs text-gray-500">
                            {worker.visitsCompleted} visits
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold">{worker.highRiskCases}</div>
                          <div className="text-sm text-gray-600">High Risk</div>
                          <div className="text-xs text-gray-500">
                            {worker.referralsMade} referrals
                          </div>
                        </div>

                        <div className="text-center">
                          <div className={`text-lg font-bold ${getPerformanceColor(worker.performanceScore)}`}>
                            {worker.performanceScore}
                          </div>
                          <div className="text-sm text-gray-600">Score</div>
                          {getCertificationBadge(worker.certificationStatus)}
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-2">
                            Last active: {new Date(worker.lastActiveDate).toLocaleDateString()}
                          </div>
                          <Button size="sm" variant="outline" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-semibold">Capacity Gap Analysis</h2>
              </div>

              {capacityGaps.map((gap, index) => {
                const IconComponent = getCapacityGapIcon(gap.type)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-l-4 ${getGapSeverityColor(gap.severity)}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            {gap.type === 'overload' ? 'Workforce Overload' :
                             gap.type === 'underserved' ? 'Underserved Area' : 'No Coverage'}
                          </CardTitle>
                          <Badge 
                            variant="outline"
                            className={`${
                              gap.severity === 'high' ? 'text-red-700 border-red-300' :
                              gap.severity === 'medium' ? 'text-yellow-700 border-yellow-300' :
                              'text-green-700 border-green-300'
                            }`}
                          >
                            {gap.severity} priority
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Situation:</h4>
                            <p className="text-gray-700">{gap.description}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Location:</h4>
                              <p className="text-gray-700">{gap.location}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Affected Population:</h4>
                              <p className="text-gray-700">{gap.affectedPopulation} beneficiaries</p>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-1">Actionable Recommendation:</h4>
                            <p className="text-blue-800">{gap.recommendation}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    Training & Certification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium">Certifications Due</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-700">{workforceStats.certificationsDue}</div>
                      <div className="text-sm text-yellow-600">Workers need refresher training</div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Upcoming Training Schedule</h4>
                      <div className="text-sm space-y-1">
                        <div>• Emergency Response - Jan 15, 2025</div>
                        <div>• Digital Health Tools - Feb 1, 2025</div>
                        <div>• Mental Health Support - Mar 1, 2025</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    Resource & Equipment Needs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Smartphones</span>
                        <span className="text-sm text-green-600">18/24 equipped</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">BP Monitors</span>
                        <span className="text-sm text-yellow-600">12/24 equipped</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Medical Kits</span>
                        <span className="text-sm text-red-600">8/24 need refill</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Non-Punitive Notice */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-900">Support-Focused Approach</h3>
                <p className="text-sm text-green-700 mt-1">
                  This dashboard is designed to identify support needs, not for performance ranking or punitive measures. All metrics are intended to improve capacity, training, and resource allocation for better community health outcomes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}