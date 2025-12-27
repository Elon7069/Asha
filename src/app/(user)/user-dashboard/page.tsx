'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Mic, 
  Calendar, 
  Heart, 
  Apple, 
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Droplets,
  Baby,
  Pill,
  Smile,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VoiceOrb2D } from '@/components/3d/VoiceOrb'

const quickActions = [
  {
    href: '/asha-didi',
    icon: Mic,
    title: 'Talk to Asha Didi',
    titleHindi: 'आशा दीदी से बात करें',
    color: 'bg-pink-500',
    description: 'Voice assistant',
  },
  {
    href: '/period-tracker/log',
    icon: Droplets,
    title: 'Log Period',
    titleHindi: 'पीरियड लॉग करें',
    color: 'bg-rose-500',
    description: 'Track your cycle',
  },
  {
    href: '/pregnancy/symptoms',
    icon: Baby,
    title: 'Log Symptoms',
    titleHindi: 'लक्षण बताएं',
    color: 'bg-purple-500',
    description: 'How are you feeling?',
  },
  {
    href: '/nutrition/ifa-tracker',
    icon: Pill,
    title: 'IFA Tablet',
    titleHindi: 'IFA गोली',
    color: 'bg-orange-500',
    description: 'Daily reminder',
  },
]

const healthTips = [
  {
    title: 'Iron-rich foods',
    titleHindi: 'आयरन युक्त भोजन',
    tip: 'Eat spinach (palak), jaggery (gur), and chickpeas (chana) daily.',
    tipHindi: 'रोज़ पालक, गुड़, और चना खाएं।',
    icon: Apple,
  },
  {
    title: 'Stay hydrated',
    titleHindi: 'पानी पिएं',
    tip: 'Drink 8-10 glasses of water every day.',
    tipHindi: 'रोज़ 8-10 गिलास पानी पिएं।',
    icon: Droplets,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [greeting, setGreeting] = React.useState('')
  const [greetingHindi, setGreetingHindi] = React.useState('')

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Good Morning')
      setGreetingHindi('सुप्रभात')
    } else if (hour < 17) {
      setGreeting('Good Afternoon')
      setGreetingHindi('नमस्कार')
    } else {
      setGreeting('Good Evening')
      setGreetingHindi('शुभ संध्या')
    }
  }, [])

  return (
    <div className="space-y-6">
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

      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-2"
      >
        <h1 className="text-2xl font-bold text-gray-900">{greeting}! 🌸</h1>
        <p className="text-lg text-pink-600 font-hindi">{greetingHindi}</p>
        <p className="text-gray-500 mt-1">How can I help you today?</p>
      </motion.div>

      {/* Voice Assistant Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link href="/asha-didi">
          <Card className="bg-gradient-to-br from-pink-500 to-rose-500 border-0 text-white overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <VoiceOrb2D size="sm" isActive />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">Talk to Asha Didi</h2>
                  <p className="text-pink-100 font-hindi">आशा दीदी से बात करें</p>
                  <p className="text-sm text-pink-100 mt-2">
                    Ask any health question - just speak!
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full hover:shadow-md transition-shadow border-pink-100">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                    {action.title}
                  </h3>
                  <p className="text-xs text-pink-600 font-hindi">
                    {action.titleHindi}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Health Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Health</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-pink-100 mx-auto mb-2 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-pink-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Period</p>
                <p className="text-xs text-gray-500">In 5 days</p>
              </div>
              
              <div>
                <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-2 flex items-center justify-center">
                  <Pill className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">IFA</p>
                <p className="text-xs text-gray-500">Taken today</p>
              </div>
              
              <div>
                <div className="w-12 h-12 rounded-full bg-purple-100 mx-auto mb-2 flex items-center justify-center">
                  <Smile className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Mood</p>
                <p className="text-xs text-gray-500">Good</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Health Tips</h2>
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="text-pink-600">
              More
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="space-y-3">
          {healthTips.map((tip, index) => (
            <Card key={index} className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <tip.icon className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{tip.title}</h3>
                    <p className="text-sm text-pink-600 font-hindi mb-1">{tip.titleHindi}</p>
                    <p className="text-sm text-gray-600">{tip.tip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Emergency Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card 
          className="bg-red-50 border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
          onClick={() => router.push('/red-zone/activate')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              router.push('/red-zone/activate')
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-700">Emergency? Press here</h3>
                <p className="text-sm text-red-600 font-hindi">इमरजेंसी? यहां दबाएं</p>
              </div>
              <Badge variant="destructive">SOS</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

