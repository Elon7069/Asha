'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, AlertTriangle, Clock, MapPin, Phone, User, CheckCircle, XCircle } from 'lucide-react'

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
  timestamp: string
  address?: string
  notes?: string[]
}

// Mock alerts data - in production, fetch from Supabase
const mockAlerts: Record<string, Alert> = {
  '1': {
    id: '1',
    name: 'Asha Devi',
    nickname: 'आशा देवी',
    village: 'भरतपुर',
    alertType: 'emergency_sos',
    severity: 'critical',
    description: 'रेड जोन बटन दबाया - तुरंत मदद चाहिए',
    timeAgo: '5 मिनट पहले',
    phone: '9876543210',
    status: 'open',
    distance: '2.1 किमी',
    timestamp: new Date().toISOString(),
    address: 'भरतपुर गांव, घर नंबर 45',
    notes: ['महिला ने रेड जोन बटन दबाया', 'तुरंत मदद की जरूरत है']
  },
  '2': {
    id: '2',
    name: 'Radha Kumari',
    nickname: 'राधा कुमारी',
    village: 'गोकुलपुर',
    alertType: 'high_bp',
    severity: 'high',
    description: 'तेज सिरदर्द और चक्कर आना, BP बढ़ा हुआ',
    timeAgo: '45 मिनट पहले',
    phone: '9876543211',
    status: 'open',
    distance: '1.5 किमी',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    address: 'गोकुलपुर गांव, घर नंबर 12',
    notes: ['BP: 150/95', 'सिरदर्द की शिकायत', 'चक्कर आ रहे हैं']
  }
}

export default function AlertDetailPage() {
  const params = useParams()
  const router = useRouter()
  const alertId = params.id as string
  const alert = mockAlerts[alertId]

  if (!alert) {
    return (
      <div className="max-w-md mx-auto space-y-4 p-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/alerts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              वापस
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">अलर्ट नहीं मिला</h1>
          <div></div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              अलर्ट नहीं मिला
            </h3>
            <p className="text-gray-500 mb-4">
              यह अलर्ट मौजूद नहीं है या हटा दिया गया है।
            </p>
            <Link href="/alerts">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                सभी अलर्ट देखें
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'emergency_sos': return 'आपातकालीन SOS'
      case 'high_bp': return 'उच्च रक्तचाप'
      case 'bleeding': return 'रक्तस्राव'
      case 'fever': return 'बुखार'
      case 'delivery': return 'प्रसव'
      case 'baby_health': return 'बच्चे की सेहत'
      default: return type
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

  const handleAcknowledge = () => {
    // Here you would update the alert status in the database
    alert('अलर्ट को स्वीकार किया गया')
    router.push('/alerts')
  }

  const handleResolve = () => {
    // Here you would resolve the alert
    alert('अलर्ट को हल किया गया')
    router.push('/alerts')
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Link href="/alerts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            वापस
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-800">अलर्ट विवरण</h1>
        <div></div>
      </div>

      {/* Alert Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`border-l-4 ${
          alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
          alert.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
          'border-l-yellow-500 bg-yellow-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-800">{alert.nickname}</div>
                  <div className="text-sm text-gray-600">{alert.name}</div>
                </div>
              </div>
              <Badge className={getSeverityColor(alert.severity)}>
                {getSeverityIcon(alert.severity)} {alert.severity === 'critical' ? 'गंभीर' : 
                 alert.severity === 'high' ? 'हाई' : 'मध्यम'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {alert.village}
                {alert.distance && (
                  <>
                    • {alert.distance} दूर
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {alert.timeAgo}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alert Type and Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{getAlertTypeIcon(alert.alertType)}</span>
              {getAlertTypeText(alert.alertType)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-gray-700">{alert.description}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>संपर्क जानकारी</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">{alert.phone}</span>
              </div>
              <a href={`tel:${alert.phone}`}>
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Phone className="w-4 h-4 mr-2" />
                  कॉल करें
                </Button>
              </a>
            </div>
            {alert.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <span className="text-gray-700">{alert.address}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Notes */}
      {alert.notes && alert.notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>अतिरिक्त जानकारी</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alert.notes.map((note, idx) => (
                  <div key={idx} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">• {note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">वर्तमान स्थिति</div>
                <Badge className={getStatusColor(alert.status)} variant="outline">
                  {getStatusText(alert.status)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        {alert.status === 'open' && (
          <Button
            onClick={handleAcknowledge}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-6 text-lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            अलर्ट स्वीकार करें
          </Button>
        )}
        
        {alert.status === 'acknowledged' && (
          <Button
            onClick={handleResolve}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            अलर्ट हल करें
          </Button>
        )}

        <Link href="/alerts">
          <Button variant="outline" className="w-full py-6 text-lg">
            सभी अलर्ट देखें
          </Button>
        </Link>
      </motion.div>

    </div>
  )
}

