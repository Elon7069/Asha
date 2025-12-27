'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Users, 
  AlertTriangle, 
  Mic,
  MapPin,
  Phone,
  CheckCircle,
  Circle,
  ArrowRight,
  Clock,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock data - replace with Supabase queries
const mockTodayStats = {
  todayVisits: 8,
  highRiskWomen: 3,
  activeAlerts: 2,
}

const mockTodayVisits = [
  {
    id: '1',
    name: 'Sunita Devi',
    nickname: 'सुनीता दीदी',
    village: 'रामपुर',
    riskLevel: 'high',
    status: 'pending',
    type: 'pregnancy_checkup',
    time: '10:00 AM'
  },
  {
    id: '2',
    name: 'Priya Kumari',
    nickname: 'प्रिया',
    village: 'सीतापुर',
    riskLevel: 'medium',
    status: 'pending',
    type: 'anc_visit',
    time: '11:30 AM'
  },
  {
    id: '3',
    name: 'Meena Yadav',
    nickname: 'मीना',
    village: 'गोकुलपुर',
    riskLevel: 'high',
    status: 'pending',
    type: 'follow_up',
    time: '2:00 PM'
  },
  {
    id: '4',
    name: 'Kavita Singh',
    nickname: 'कविता',
    village: 'रामपुर',
    riskLevel: 'low',
    status: 'completed',
    type: 'routine_checkup',
    time: '9:00 AM'
  },
]

const mockActiveAlerts = [
  {
    id: '1',
    name: 'Asha Devi',
    village: 'भरतपुर',
    alertType: 'emergency_sos',
    timeAgo: '5 मिनट पहले',
    severity: 'critical'
  },
  {
    id: '2',
    name: 'Radha Kumari',
    village: 'गोकुलपुर',
    alertType: 'high_bp',
    timeAgo: '45 मिनट पहले',
    severity: 'high'
  },
]

export default function AshaWorkerDashboardPage() {
  const [greeting, setGreeting] = React.useState('')
  const [currentTime, setCurrentTime] = React.useState('')

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hour = now.getHours()
      
      if (hour < 12) setGreeting('शुभ प्रभात')
      else if (hour < 17) setGreeting('नमस्कार')
      else setGreeting('शुभ संध्या')
      
      setCurrentTime(now.toLocaleTimeString('hi-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      
      {/* Header with Time */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <div className="text-3xl font-bold text-emerald-600 mb-1">{currentTime}</div>
        <h1 className="text-xl font-semibold text-gray-800">{greeting} आशा दीदी! 🙏</h1>
      </motion.div>

      {/* Emergency Alerts - TOP PRIORITY */}
      {mockActiveAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
              🚨 तुरंत ध्यान दें
            </h2>
            <Badge className="bg-red-500 text-white text-lg px-3 py-1">
              {mockActiveAlerts.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {mockActiveAlerts.map((alert) => (
              <Card key={alert.id} className="border-red-200 bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{alert.name}</div>
                      <div className="text-sm text-gray-600">{alert.village} • {alert.timeAgo}</div>
                    </div>
                    <Link href={`/alerts/${alert.id}`}>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                        देखें
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Today's Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <Card className="text-center bg-emerald-50 border-emerald-200">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-emerald-600">{mockTodayStats.todayVisits}</div>
            <div className="text-sm text-emerald-700">आज की विजिट</div>
          </CardContent>
        </Card>
        
        <Card className="text-center bg-orange-50 border-orange-200">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-orange-600">{mockTodayStats.highRiskWomen}</div>
            <div className="text-sm text-orange-700">हाई रिस्क</div>
          </CardContent>
        </Card>
        
        <Card className="text-center bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-600">{mockTodayStats.activeAlerts}</div>
            <div className="text-sm text-blue-700">अलर्ट</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Voice Log Button - PRIMARY ACTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/voice-log">
          <Button className="w-full py-6 text-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg">
            <Mic className="w-8 h-8 mr-3" />
            विजिट रिकॉर्ड करें 🎤
          </Button>
        </Link>
      </motion.div>

      {/* Today's Visit List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          📋 आज की विजिट सूची
        </h2>
        
        {mockTodayVisits.map((visit, index) => (
          <Card key={visit.id} className={`border-l-4 ${
            visit.status === 'completed' ? 'border-l-green-400 bg-green-50' : 
            visit.riskLevel === 'high' ? 'border-l-red-400 bg-red-50' :
            visit.riskLevel === 'medium' ? 'border-l-yellow-400 bg-yellow-50' :
            'border-l-emerald-400 bg-emerald-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">{visit.nickname}</span>
                    <Badge className={getRiskColor(visit.riskLevel)} variant="outline">
                      {getRiskIcon(visit.riskLevel)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    📍 {visit.village} • 🕐 {visit.time}
                  </div>
                  {visit.status === 'completed' && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      ✅ पूर्ण
                    </Badge>
                  )}
                </div>
                
                {visit.status === 'pending' && (
                  <Link href={`/beneficiaries/${visit.id}`}>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      विजिट शुरू करें
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3 pt-4"
      >
        <Link href="/alerts">
          <Button variant="outline" className="w-full py-4 border-red-200 text-red-600 hover:bg-red-50">
            🚨 सभी अलर्ट
          </Button>
        </Link>
        
        <Link href="/beneficiaries">
          <Button variant="outline" className="w-full py-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
            👥 सभी महिलाएं
          </Button>
        </Link>
      </motion.div>
      
    </div>
  )
}

