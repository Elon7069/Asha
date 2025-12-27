'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  Droplets, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  addDays,
  parseISO
} from 'date-fns'
import { predictNextPeriod, calculateFertileWindow } from '@/lib/utils/menstrual'

interface CycleData {
  lastPeriodStart: Date | null
  lastPeriodEnd: Date | null
  averageCycleLength: number
  predictedNextPeriod: Date | null
  fertileWindowStart: Date | null
  fertileWindowEnd: Date | null
}

export default function PeriodTrackerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [cycleData, setCycleData] = React.useState<CycleData>({
    lastPeriodStart: null,
    lastPeriodEnd: null,
    averageCycleLength: 28,
    predictedNextPeriod: null,
    fertileWindowStart: null,
    fertileWindowEnd: null
  })
  const [loading, setLoading] = React.useState(true)
  const today = new Date()

  // Fetch cycle data from database
  React.useEffect(() => {
    async function fetchCycleData() {
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
          .select('id, last_period_date, average_cycle_length')
          .eq('user_id', ashaUser.id)
          .maybeSingle()

        if (!profile) {
          setLoading(false)
          return
        }

        if (profile?.last_period_date) {
          const lastPeriod = parseISO(profile.last_period_date)
          const avgCycle = profile.average_cycle_length || 28
          
          // Get recent cycles for better prediction
          const { data: cycles } = await supabase
            .from('menstrual_cycles')
            .select('period_start_date, period_end_date, cycle_length')
            .eq('user_id', profile.id)
            .order('period_start_date', { ascending: false })
            .limit(6)

          // Calculate average from recent cycles
          let calculatedAvg = avgCycle
          if (cycles && cycles.length > 1) {
            const cycleLengths = cycles
              .map(c => c.cycle_length)
              .filter((len): len is number => len !== null && len >= 21 && len <= 35)
            
            if (cycleLengths.length > 0) {
              calculatedAvg = Math.round(
                cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
              )
            }
          }

          // Predict next period
          const prediction = predictNextPeriod(lastPeriod, calculatedAvg)
          const fertileWindow = calculateFertileWindow(prediction.nextPeriod)

          setCycleData({
            lastPeriodStart: lastPeriod,
            lastPeriodEnd: cycles?.[0]?.period_end_date ? parseISO(cycles[0].period_end_date) : addDays(lastPeriod, 5),
            averageCycleLength: calculatedAvg,
            predictedNextPeriod: prediction.nextPeriod,
            fertileWindowStart: fertileWindow.start,
            fertileWindowEnd: fertileWindow.end
          })
        }
      } catch (error) {
        console.error('Error fetching cycle data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCycleData()
  }, [user])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate days until next period
  const daysUntilPeriod = cycleData.predictedNextPeriod
    ? Math.ceil(
        (cycleData.predictedNextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0

  // Check if a day is a period day
  const isPeriodDay = (date: Date) => {
    if (!cycleData.lastPeriodStart || !cycleData.lastPeriodEnd) return false
    return isWithinInterval(date, {
      start: cycleData.lastPeriodStart,
      end: cycleData.lastPeriodEnd,
    })
  }

  // Check if a day is a predicted period day
  const isPredictedPeriodDay = (date: Date) => {
    if (!cycleData.predictedNextPeriod) return false
    const predictedEnd = addDays(cycleData.predictedNextPeriod, 5)
    return isWithinInterval(date, {
      start: cycleData.predictedNextPeriod,
      end: predictedEnd,
    })
  }

  // Check if a day is in fertile window
  const isFertileDay = (date: Date) => {
    if (!cycleData.fertileWindowStart || !cycleData.fertileWindowEnd) return false
    return isWithinInterval(date, {
      start: cycleData.fertileWindowStart,
      end: cycleData.fertileWindowEnd,
    })
  }

  const getDayStyle = (date: Date) => {
    if (isPeriodDay(date)) return 'bg-pink-500 text-white'
    if (isPredictedPeriodDay(date)) return 'bg-pink-200 text-pink-700'
    if (isFertileDay(date)) return 'bg-green-200 text-green-700'
    if (isSameDay(date, today)) return 'ring-2 ring-pink-500'
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Period Tracker</h1>
            <p className="text-pink-600 font-hindi">पीरियड ट्रैकर</p>
          </div>
        </div>
        <Link href="/period-tracker/log">
          <Button className="bg-pink-500 hover:bg-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Log Period
          </Button>
        </Link>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-pink-500 to-rose-500 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Droplets className="w-8 h-8" />
              </div>
              <div>
                <p className="text-pink-100 text-sm">Next period in</p>
                {loading ? (
                  <p className="text-3xl font-bold">...</p>
                ) : cycleData.predictedNextPeriod ? (
                  <>
                    <p className="text-3xl font-bold">{daysUntilPeriod} days</p>
                    <p className="text-pink-100 font-hindi">{daysUntilPeriod} दिन बाद</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold">Not tracked yet</p>
                    <p className="text-pink-100 font-hindi">अभी ट्रैक नहीं किया गया</p>
                  </>
                )}
              </div>
            </div>
            {cycleData.predictedNextPeriod && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-pink-100">
                  Expected: {format(cycleData.predictedNextPeriod, 'MMM d, yyyy')}
                </p>
                {cycleData.fertileWindowStart && cycleData.fertileWindowEnd && (
                  <p className="text-sm text-pink-100 mt-1">
                    Fertile window: {format(cycleData.fertileWindowStart, 'MMM d')} - {format(cycleData.fertileWindowEnd, 'MMM d')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-pink-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-lg">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Actual days */}
              {days.map((day) => (
                <button
                  key={day.toISOString()}
                  className={cn(
                    'aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    !isSameMonth(day, currentMonth) && 'text-gray-300',
                    getDayStyle(day)
                  )}
                >
                  {format(day, 'd')}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-pink-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-pink-500" />
                <span className="text-xs text-gray-600">Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-pink-200" />
                <span className="text-xs text-gray-600">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-200" />
                <span className="text-xs text-gray-600">Fertile</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cycle Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-pink-100">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-pink-500" />
              Your Cycle
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Average Cycle</p>
                <p className="text-lg font-semibold text-gray-900">
                  {cycleData.averageCycleLength} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Period</p>
                <p className="text-lg font-semibold text-gray-900">
                  {cycleData.lastPeriodStart 
                    ? format(cycleData.lastPeriodStart, 'MMM d')
                    : 'Not logged'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-pink-50 border-pink-100">
          <CardContent className="p-4">
            <h3 className="font-semibold text-pink-700 mb-2">💡 Tip</h3>
            <p className="text-sm text-pink-600">
              Track your period regularly for better predictions. The more you log, the more accurate we become!
            </p>
            <p className="text-sm text-pink-600 font-hindi mt-1">
              बेहतर भविष्यवाणी के लिए नियमित रूप से अपना पीरियड ट्रैक करें।
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

