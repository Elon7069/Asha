'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock,
  AlertTriangle,
  Baby,
  Heart,
  FileText,
  CheckCircle,
  XCircle,
  Mic
} from 'lucide-react'

interface Beneficiary {
  id: string
  name: string
  nickname: string
  age: number
  village: string
  phone: string
  address?: string
  isPregnant: boolean
  pregnancyWeek?: number
  isHighRisk: boolean
  riskFactors: string[]
  lastVisit: string
  nextVisit?: string
  healthMetrics?: {
    weight?: string
    bloodPressure?: string
    hemoglobin?: string
    temperature?: string
  }
  notes?: string[]
}

// Mock beneficiaries data - in production, fetch from Supabase
const mockBeneficiaries: Record<string, Beneficiary> = {
  '1': {
    id: '1',
    name: 'Sunita Devi',
    nickname: 'सुनीता दीदी',
    age: 28,
    village: 'रामपुर',
    phone: '9876543210',
    address: 'रामपुर गांव, घर नंबर 23',
    isPregnant: true,
    pregnancyWeek: 32,
    isHighRisk: true,
    riskFactors: ['anemia', 'previous_complications'],
    lastVisit: '2 days ago',
    nextVisit: 'Next Tuesday',
    healthMetrics: {
      weight: '52 किग्रा',
      bloodPressure: '130/85',
      hemoglobin: '10.2 g/dL',
      temperature: '98.6°F'
    },
    notes: ['आयरन की कमी', 'नियमित जांच जरूरी']
  },
  '2': {
    id: '2',
    name: 'Priya Kumari',
    nickname: 'प्रिया',
    age: 24,
    village: 'सीतापुर',
    phone: '9876543211',
    address: 'सीतापुर गांव, घर नंबर 15',
    isPregnant: true,
    pregnancyWeek: 20,
    isHighRisk: false,
    riskFactors: [],
    lastVisit: '1 week ago',
    nextVisit: 'Next Friday',
    healthMetrics: {
      weight: '55 किग्रा',
      bloodPressure: '120/80',
      hemoglobin: '11.5 g/dL',
      temperature: '98.4°F'
    }
  },
  '3': {
    id: '3',
    name: 'Meena Yadav',
    nickname: 'मीना',
    age: 30,
    village: 'गोकुलपुर',
    phone: '9876543212',
    address: 'गोकुलपुर गांव, घर नंबर 8',
    isPregnant: true,
    pregnancyWeek: 38,
    isHighRisk: true,
    riskFactors: ['high_bp', 'gestational_diabetes'],
    lastVisit: '1 day ago',
    nextVisit: 'Tomorrow',
    healthMetrics: {
      weight: '58 किग्रा',
      bloodPressure: '140/90',
      hemoglobin: '9.8 g/dL',
      temperature: '99.0°F'
    },
    notes: ['BP नियंत्रण में रखना है', 'नियमित दवा लेनी है']
  },
  '4': {
    id: '4',
    name: 'Kavita Singh',
    nickname: 'कविता',
    age: 26,
    village: 'रामपुर',
    phone: '9876543213',
    isPregnant: false,
    isHighRisk: false,
    riskFactors: [],
    lastVisit: '3 days ago',
    healthMetrics: {
      weight: '50 किग्रा',
      bloodPressure: '115/75',
      hemoglobin: '12.0 g/dL'
    }
  }
}

export default function BeneficiaryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const beneficiaryId = params.id as string
  const beneficiary = mockBeneficiaries[beneficiaryId]

  if (!beneficiary) {
    return (
      <div className="max-w-md mx-auto space-y-4 p-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/beneficiaries">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              वापस
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">लाभार्थी नहीं मिला</h1>
          <div></div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              लाभार्थी नहीं मिला
            </h3>
            <p className="text-gray-500 mb-4">
              यह लाभार्थी मौजूद नहीं है।
            </p>
            <Link href="/beneficiaries">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                सभी लाभार्थी देखें
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getRiskFactorText = (factor: string) => {
    const factorMap: Record<string, string> = {
      'anemia': 'एनीमिया',
      'previous_complications': 'पिछली जटिलताएं',
      'high_bp': 'उच्च रक्तचाप',
      'gestational_diabetes': 'गर्भकालीन मधुमेह'
    }
    return factorMap[factor] || factor
  }

  const handleStartVisit = () => {
    // Navigate to voice log with beneficiary pre-filled
    router.push(`/voice-log?beneficiary=${beneficiaryId}`)
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Link href="/beneficiaries">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            वापस
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-800">लाभार्थी विवरण</h1>
        <div></div>
      </div>

      {/* Beneficiary Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`border-l-4 ${
          beneficiary.isHighRisk ? 'border-l-red-500 bg-red-50' : 'border-l-emerald-500 bg-emerald-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold text-xl text-gray-800">{beneficiary.nickname}</div>
                  <div className="text-sm text-gray-600">{beneficiary.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{beneficiary.age} वर्ष</div>
                </div>
              </div>
              {beneficiary.isHighRisk && (
                <Badge className="bg-red-500 text-white">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  हाई रिस्क
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {beneficiary.village}
              </div>
              {beneficiary.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {beneficiary.address}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {beneficiary.phone}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pregnancy Status */}
      {beneficiary.isPregnant && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Baby className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">गर्भावस्था</div>
                    <div className="text-sm text-gray-600">सप्ताह {beneficiary.pregnancyWeek}</div>
                  </div>
                </div>
                <Badge className="bg-pink-100 text-pink-700">
                  <Heart className="w-4 h-4 mr-1" />
                  गर्भवती
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Health Metrics */}
      {beneficiary.healthMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>स्वास्थ्य जांच</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {beneficiary.healthMetrics.weight && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">वजन</div>
                    <div className="font-semibold text-gray-800">{beneficiary.healthMetrics.weight}</div>
                  </div>
                )}
                {beneficiary.healthMetrics.bloodPressure && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">रक्तचाप</div>
                    <div className="font-semibold text-gray-800">{beneficiary.healthMetrics.bloodPressure}</div>
                  </div>
                )}
                {beneficiary.healthMetrics.hemoglobin && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">हीमोग्लोबिन</div>
                    <div className="font-semibold text-gray-800">{beneficiary.healthMetrics.hemoglobin}</div>
                  </div>
                )}
                {beneficiary.healthMetrics.temperature && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">तापमान</div>
                    <div className="font-semibold text-gray-800">{beneficiary.healthMetrics.temperature}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Risk Factors */}
      {beneficiary.riskFactors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                जोखिम कारक
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {beneficiary.riskFactors.map((factor, idx) => (
                  <Badge key={idx} variant="destructive" className="mr-2 mb-2">
                    {getRiskFactorText(factor)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Visit Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              विजिट जानकारी
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">अंतिम विजिट</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{beneficiary.lastVisit}</span>
            </div>
            {beneficiary.nextVisit && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">अगली विजिट</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{beneficiary.nextVisit}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes */}
      {beneficiary.notes && beneficiary.notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                नोट्स
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {beneficiary.notes.map((note, idx) => (
                  <div key={idx} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">• {note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <Button
          onClick={handleStartVisit}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg"
        >
          <Mic className="w-5 h-5 mr-2" />
          विजिट शुरू करें
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <a href={`tel:${beneficiary.phone}`}>
            <Button variant="outline" className="w-full py-4">
              <Phone className="w-4 h-4 mr-2" />
              कॉल करें
            </Button>
          </a>
          <Link href="/beneficiaries">
            <Button variant="outline" className="w-full py-4">
              वापस
            </Button>
          </Link>
        </div>
      </motion.div>

    </div>
  )
}

