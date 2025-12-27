'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Pill, 
  ArrowLeft,
  Check,
  Calendar,
  AlertCircle,
  Flame,
  TrendingUp,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// Mock data - in production, fetch from database
const mockIfaData = {
  takenToday: false,
  currentStreak: 5,
  longestStreak: 12,
  thisMonth: 18,
  lastTaken: '2024-01-15',
  reminderTime: '14:00' // 2 PM
}

const benefits = [
  {
    icon: '🩸',
    title: 'Prevents Anemia',
    titleHindi: 'एनीमिया रोकता है',
    description: 'Iron helps maintain healthy blood levels'
  },
  {
    icon: '👶',
    title: 'Baby Development',
    titleHindi: 'बच्चे का विकास',
    description: 'Essential for baby\'s growth and brain development'
  },
  {
    icon: '💪',
    title: 'Energy Boost',
    titleHindi: 'ऊर्जा बढ़ाता है',
    description: 'Helps fight fatigue and weakness'
  },
  {
    icon: '🛡️',
    title: 'Immune System',
    titleHindi: 'रोग प्रतिरोधक क्षमता',
    description: 'Strengthens your immune system'
  },
]

export default function IfaTrackerPage() {
  const router = useRouter()
  const [ifaTaken, setIfaTaken] = React.useState(mockIfaData.takenToday)
  const [streak, setStreak] = React.useState(mockIfaData.currentStreak)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)

  const handleMarkTaken = async () => {
    setIsSubmitting(true)
    try {
      // Here you would save to database
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Update local state
      setIfaTaken(true)
      setStreak(prev => prev + 1)
      
      // Show saved confirmation
      setIsSaved(true)
      
      // Hide confirmation after 3 seconds
      setTimeout(() => {
        setIsSaved(false)
      }, 3000)
    } catch (error) {
      console.error('Error marking IFA as taken:', error)
      alert('Error saving. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercent = (mockIfaData.thisMonth / 30) * 100

  return (
    <div className="space-y-6">
      {/* Saved Confirmation */}
      {isSaved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Card className="bg-green-50 border-green-200 border-2 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-700 text-lg">Saved!</h3>
                  <p className="text-sm text-green-600 font-hindi">IFA गोली सफलतापूर्वक सेव हो गई!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IFA Tablet Tracker</h1>
          <p className="text-pink-600 font-hindi">IFA गोली ट्रैकर</p>
        </div>
      </div>

      {/* Today's Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(
          'border-0 overflow-hidden',
          ifaTaken 
            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
            : 'bg-gradient-to-br from-orange-500 to-amber-500'
        )}>
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Today's IFA Tablet</p>
                <p className="text-3xl font-bold">
                  {ifaTaken ? 'Taken! ✓' : 'Not taken yet'}
                </p>
                <p className="text-white/80 font-hindi text-lg mt-1">
                  {ifaTaken ? 'ले लिया! ✓' : 'अभी नहीं लिया'}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Pill className="w-10 h-10" />
              </div>
            </div>
            
            {!ifaTaken && (
              <Button 
                onClick={handleMarkTaken}
                disabled={isSubmitting}
                className="w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold py-6 text-lg"
              >
                {isSubmitting ? (
                  'Saving...'
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Mark as Taken
                  </>
                )}
              </Button>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Current streak</span>
                <span className="font-bold text-xl">{streak} days 🔥</span>
              </div>
              <Progress value={(streak / 30) * 100} className="h-2 bg-white/20" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-pink-100">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 mx-auto mb-2 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{mockIfaData.longestStreak}</p>
              <p className="text-xs text-gray-500">Longest Streak</p>
              <p className="text-xs text-pink-600 font-hindi">सबसे लंबा स्ट्रीक</p>
            </CardContent>
          </Card>
          
          <Card className="border-pink-100">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-2 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{mockIfaData.thisMonth}</p>
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-xs text-pink-600 font-hindi">इस महीने</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Monthly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Progress</CardTitle>
            <p className="text-sm text-pink-600 font-hindi">मासिक प्रगति</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{mockIfaData.thisMonth} / 30 days</span>
                <span className="font-semibold text-gray-900">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs text-gray-500">
                Last taken: {new Date(mockIfaData.lastTaken).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reminder Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-700 mb-1">
                  Best Time to Take
                </h3>
                <p className="text-sm text-orange-600 mb-1">
                  Take IFA tablet after lunch (around 2 PM) for better absorption.
                </p>
                <p className="text-sm text-orange-600 font-hindi">
                  बेहतर अवशोषण के लिए दोपहर के खाने के बाद (लगभग 2 बजे) IFA गोली लें।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg">Why IFA is Important</CardTitle>
            <p className="text-sm text-pink-600 font-hindi">
              IFA क्यों महत्वपूर्ण है
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="p-3 bg-pink-50 rounded-xl">
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <p className="text-sm font-medium text-gray-900">{benefit.title}</p>
                  <p className="text-xs text-pink-600 font-hindi">{benefit.titleHindi}</p>
                  <p className="text-xs text-gray-600 mt-1">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Important Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">• Take with water or juice, not tea/coffee</p>
              <p className="text-blue-600 font-hindi">• पानी या जूस के साथ लें, चाय/कॉफी नहीं</p>
            </div>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">• Take after meals to avoid stomach upset</p>
              <p className="text-blue-600 font-hindi">• पेट खराब होने से बचने के लिए खाने के बाद लें</p>
            </div>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">• Don't skip - consistency is key!</p>
              <p className="text-blue-600 font-hindi">• न छोड़ें - नियमितता जरूरी है!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pb-6"
      >
        <Link href="/nutrition">
          <Button variant="outline" className="w-full py-6 text-lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Nutrition
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

