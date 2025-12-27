'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Baby, 
  AlertTriangle, 
  Calendar,
  ChevronRight,
  Heart,
  Apple,
  Stethoscope,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { calculatePregnancyWeek, getPregnancyStage, daysUntilDelivery } from '@/lib/utils/pregnancy'
import { getWeekData } from '@/lib/constants/pregnancy-weeks'
import { getRedFlagsForStage } from '@/lib/constants/red-flags'
import { format, parseISO } from 'date-fns'

const dangerSigns = [
  { id: 'bleeding', label: 'Heavy bleeding', labelHindi: 'भारी रक्तस्राव', icon: '🩸' },
  { id: 'pain', label: 'Severe pain', labelHindi: 'तेज़ दर्द', icon: '😣' },
  { id: 'fever', label: 'High fever', labelHindi: 'तेज़ बुखार', icon: '🤒' },
  { id: 'no_movement', label: 'Baby not moving', labelHindi: 'बच्चा नहीं हिल रहा', icon: '👶' },
  { id: 'headache', label: 'Severe headache', labelHindi: 'तेज़ सिरदर्द', icon: '🤕' },
  { id: 'swelling', label: 'Sudden swelling', labelHindi: 'अचानक सूजन', icon: '🦶' },
]

const quickLinks = [
  { href: '/pregnancy/symptoms', icon: Stethoscope, label: 'Log Symptoms', labelHindi: 'लक्षण लॉग करें' },
  { href: '/nutrition', icon: Apple, label: 'Nutrition Tips', labelHindi: 'पोषण टिप्स' },
  { href: '/learn', icon: BookOpen, label: 'Learn More', labelHindi: 'और जानें' },
]

export default function PregnancyPage() {
  const { user } = useAuth()
  const [pregnancyData, setPregnancyData] = React.useState<{
    isPregnant: boolean
    currentWeek: number | null
    expectedDeliveryDate: Date | null
    trimester: string | null
  }>({
    isPregnant: false,
    currentWeek: null,
    expectedDeliveryDate: null,
    trimester: null
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchPregnancyData() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const supabase = getSupabaseClient()
        
        // First get asha_users record
        const { data: ashaUser } = await supabase
          .from('asha_users')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (!ashaUser) {
          setLoading(false)
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('asha_user_profiles')
          .select('is_currently_pregnant, expected_delivery_date, current_pregnancy_week, pregnancy_stage')
          .eq('user_id', ashaUser.id)
          .single()

        if (profile?.is_currently_pregnant && profile.expected_delivery_date) {
          const edd = parseISO(profile.expected_delivery_date)
          const week = profile.current_pregnancy_week || calculatePregnancyWeek(edd)
          const stage = profile.pregnancy_stage || getPregnancyStage(week)

          setPregnancyData({
            isPregnant: true,
            currentWeek: week,
            expectedDeliveryDate: edd,
            trimester: stage
          })
        }
      } catch (error) {
        console.error('Error fetching pregnancy data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPregnancyData()
  }, [user])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!pregnancyData.isPregnant || !pregnancyData.currentWeek || !pregnancyData.expectedDeliveryDate) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Baby className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pregnancy Care</h1>
          <p className="text-gray-600 mb-6">
            This section is for pregnant women. Update your profile if you're expecting.
          </p>
          <Link href="/profile">
            <Button className="bg-pink-500 hover:bg-pink-600">
              Update Profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pregnancy Care</h1>
        <p className="text-pink-600 font-hindi">गर्भावस्था देखभाल</p>
      </div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm">You are in</p>
                <p className="text-3xl font-bold">Week {pregnancyData.currentWeek}</p>
                <p className="text-purple-100 font-hindi">सप्ताह {pregnancyData.currentWeek}</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Baby className="w-10 h-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-white/20" />
              <p className="text-sm text-purple-100">
                {daysRemaining} days until due date
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* This Week Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-2">{weekInfo?.description || 'Continue regular checkups.'}</p>
            <p className="text-pink-600 font-hindi text-sm">{weekInfo?.descriptionHindi || 'नियमित जांच जारी रखें।'}</p>
            {weekInfo?.nutritionTip && (
              <div className="mt-4 p-3 bg-pink-50 rounded-xl">
                <p className="text-sm font-medium text-pink-700 mb-1">💡 Nutrition Tip:</p>
                <p className="text-sm text-pink-600">{weekInfo.nutritionTip}</p>
                <p className="text-sm text-pink-600 font-hindi">{weekInfo.nutritionTipHindi}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full hover:shadow-md transition-shadow border-pink-100">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 mx-auto mb-2 flex items-center justify-center">
                    <link.icon className="w-6 h-6 text-pink-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{link.label}</p>
                  <p className="text-xs text-pink-600 font-hindi">{link.labelHindi}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Danger Signs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Danger Signs - Call immediately if you have:
            </CardTitle>
            <p className="text-sm text-red-600 font-hindi">
              खतरे के संकेत - अगर ये हों तो तुरंत कॉल करें:
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {dangerSigns.map((sign) => (
                <div 
                  key={sign.id}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg"
                >
                  <span className="text-xl">{sign.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sign.name}</p>
                    <p className="text-xs text-red-600 font-hindi">{sign.nameHindi}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/red-zone/activate" className="block mt-4">
              <Button className="w-full bg-red-500 hover:bg-red-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency SOS
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Checkups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              Upcoming
            </CardTitle>
            <Link href="/vaccinations">
              <Button variant="ghost" size="sm" className="text-pink-600">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Antenatal Checkup</p>
                    <p className="text-sm text-gray-500">Week 26</p>
                  </div>
                </div>
                <Badge className="bg-pink-100 text-pink-700">In 2 weeks</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">TT Vaccination</p>
                    <p className="text-sm text-gray-500">Dose 2</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

