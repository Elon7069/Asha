'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, AlertTriangle, Clock, MapPin, Phone, CheckCircle, User } from 'lucide-react'

interface Alert {
  id: string
  name: string
  nickname: string
  village: string
  alertType: 'emergency_sos' | 'high_bp' | 'bleeding' | 'fever' | 'delivery' | 'baby_health'
  severity: 'critical' | 'high' | 'medium'
  description: string
  timeAgo: string
  phone: string
  status: 'open' | 'acknowledged' | 'resolved'
  distance?: string
}

// Mock alerts data with Hindi translations
const mockAlerts: Alert[] = [
  {
    id: '1',
    name: 'Sunita Kumari',
    nickname: 'सुनीता दीदी',
    village: 'रामपुर',
    alertType: 'emergency_sos',
    severity: 'critical',
    description: 'रेड जोन बटन दबाया - तुरंत मदद चाहिए',
    timeAgo: '5 मिनट पहले',
    phone: '9876543210',
    status: 'open',
    distance: '2.1 किमी'
  },
  {
    id: '2',
    name: 'Meena Devi',
    nickname: 'मीना दीदी',
    village: 'गोकुलपुर',
    alertType: 'high_bp',
    severity: 'high',
    description: 'तेज सिरदर्द और चक्कर आना, BP बढ़ा हुआ',
    timeAgo: '15 मिनट पहले',
    phone: '9876543211',
    status: 'open',
    distance: '1.5 किमी'
  },
  {
    id: '3',
    name: 'Radha Singh',
    nickname: 'राधा दीदी',
    village: 'शांति नगर',
    alertType: 'bleeding',
    severity: 'critical',
    description: 'प्रसव के बाद ज्यादा ब्लीडिंग हो रही है',
    timeAgo: '30 मिनट पहले',
    phone: '9876543212',
    status: 'acknowledged',
    distance: '3.2 किमी'
  },
  {
    id: '4',
    name: 'Priya Yadav',
    nickname: 'प्रिया दीदी',
    village: 'नया गांव',
    alertType: 'fever',
    severity: 'medium',
    description: '3 दिन से बुखार और बच्चा दूध नहीं पी रहा',
    timeAgo: '1 घंटा पहले',
    phone: '9876543213',
    status: 'open',
    distance: '4.0 किमी'
  },
  {
    id: '5',
    name: 'Sita Devi',
    nickname: 'सीता दीदी',
    village: 'पुराना गांव',
    alertType: 'delivery',
    severity: 'high',
    description: 'प्रसव पीड़ा शुरू हुई है, अस्पताल जाना है',
    timeAgo: '2 घंटा पहले',
    phone: '9876543214',
    status: 'resolved',
    distance: '5.5 किमी'
  }
]

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('open')
  
  const filteredAlerts = filter === 'all' 
    ? mockAlerts 
    : mockAlerts.filter(alert => alert.status === filter)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '💛'
      default: return '📝'
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency_sos': return '🆘'
      case 'high_bp': return '🩺'
      case 'bleeding': return '🩸'
      case 'fever': return '🤒'
      case 'delivery': return '👶'
      case 'baby_health': return '🍼'
      default: return '📋'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700 border-red-200'
      case 'acknowledged': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return '🔴 खुला'
      case 'acknowledged': return '🟡 स्वीकार किया'
      case 'resolved': return '✅ हल हुआ'
      default: return status
    }
  }

  const handleAcknowledge = (alertId: string) => {
    // Here you would update the alert status in the database
    alert(`अलर्ट ${alertId} को स्वीकार किया गया`)
  }

  const handleResolve = (alertId: string) => {
    // Here you would resolve the alert
    alert(`अलर्ट ${alertId} को हल किया गया`)
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            वापस
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-800">🚨 सभी अलर्ट</h1>
        <div></div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'open', label: 'खुले', count: mockAlerts.filter(a => a.status === 'open').length },
          { key: 'acknowledged', label: 'स्वीकार', count: mockAlerts.filter(a => a.status === 'acknowledged').length },
          { key: 'resolved', label: 'हल', count: mockAlerts.filter(a => a.status === 'resolved').length },
          { key: 'all', label: 'सभी', count: mockAlerts.length }
        ].map((tab) => (
          <Button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            variant={filter === tab.key ? 'default' : 'ghost'}
            size="sm"
            className={`text-xs ${filter === tab.key ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}
          >
            {tab.label}
            <Badge className="ml-1 text-xs" variant="secondary">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Critical Alerts Counter */}
      {filteredAlerts.filter(a => a.severity === 'critical').length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <span className="text-lg font-bold text-red-700">
                {filteredAlerts.filter(a => a.severity === 'critical').length} गंभीर अलर्ट - तुरंत कार्रवाई करें!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                कोई अलर्ट नहीं मिला
              </h3>
              <p className="text-gray-500">
                {filter === 'open' ? 'सभी अलर्ट हल हो गए हैं!' : 'इस फ़िल्टर में कोई अलर्ट नहीं है।'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                alert.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
                'border-l-yellow-500 bg-yellow-50'
              } ${alert.status === 'resolved' ? 'opacity-75' : ''}`}>
                <CardContent className="p-4">
                  
                  {/* Alert Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{alert.nickname}</div>
                        <div className="text-sm text-gray-600">{alert.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.village}
                          {alert.distance && (
                            <>
                              • 📍 {alert.distance}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {getSeverityIcon(alert.severity)} {alert.severity === 'critical' ? 'गंभीर' : 
                         alert.severity === 'high' ? 'हाई' : 'मध्यम'}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {alert.timeAgo}
                      </div>
                    </div>
                  </div>

                  {/* Alert Description */}
                  <div className="mb-3">
                    <div className="text-sm bg-white p-3 rounded border flex items-start gap-2">
                      <span className="text-lg">{getAlertTypeIcon(alert.alertType)}</span>
                      <span className="text-gray-700 flex-1">{alert.description}</span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(alert.status)} variant="outline">
                      {getStatusText(alert.status)}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      {/* Call Button */}
                      <a href={`tel:${alert.phone}`}>
                        <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </a>
                      
                      {/* Action Buttons based on status */}
                      {alert.status === 'open' && (
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          स्वीकार करें
                        </Button>
                      )}
                      
                      {alert.status === 'acknowledged' && (
                        <Button
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          हल करें
                        </Button>
                      )}
                      
                      {/* View Details */}
                      <Link href={`/alerts/${alert.id}`}>
                        <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300">
                          देखें
                        </Button>
                      </Link>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredAlerts.filter(a => a.severity === 'critical').length}
              </div>
              <div className="text-sm text-red-700">गंभीर</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredAlerts.filter(a => a.severity === 'high').length}
              </div>
              <div className="text-sm text-orange-700">हाई</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredAlerts.filter(a => a.status === 'resolved').length}
              </div>
              <div className="text-sm text-green-700">हल</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

