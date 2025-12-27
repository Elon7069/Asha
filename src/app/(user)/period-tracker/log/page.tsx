'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  Droplets, 
  Check,
  ChevronLeft,
  Mic
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { format } from 'date-fns'

const flowOptions = [
  { value: 'light', label: 'Light', labelHindi: 'हल्का', icon: '💧' },
  { value: 'medium', label: 'Medium', labelHindi: 'मध्यम', icon: '💧💧' },
  { value: 'heavy', label: 'Heavy', labelHindi: 'भारी', icon: '💧💧💧' },
  { value: 'very_heavy', label: 'Very Heavy', labelHindi: 'बहुत भारी', icon: '💧💧💧💧' },
]

const painLevels = [
  { value: 0, label: 'No Pain', emoji: '😊' },
  { value: 3, label: 'Mild', emoji: '😐' },
  { value: 5, label: 'Moderate', emoji: '😣' },
  { value: 7, label: 'Severe', emoji: '😖' },
  { value: 10, label: 'Extreme', emoji: '😭' },
]

const symptoms = [
  { id: 'cramps', label: 'Cramps', labelHindi: 'ऐंठन' },
  { id: 'headache', label: 'Headache', labelHindi: 'सिरदर्द' },
  { id: 'backpain', label: 'Back Pain', labelHindi: 'कमर दर्द' },
  { id: 'bloating', label: 'Bloating', labelHindi: 'पेट फूलना' },
  { id: 'mood_swings', label: 'Mood Swings', labelHindi: 'मूड बदलना' },
  { id: 'fatigue', label: 'Fatigue', labelHindi: 'थकान' },
]

export default function LogPeriodPage() {
  const router = useRouter()
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date())
  const [flow, setFlow] = React.useState<string>('medium')
  const [painLevel, setPainLevel] = React.useState<number>(3)
  const [selectedSymptoms, setSelectedSymptoms] = React.useState<string[]>([])
  const [notes, setNotes] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    )
  }

  const handleSubmit = async () => {
    if (!startDate) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/period-tracker/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_start_date: format(startDate, 'yyyy-MM-dd'),
          flow_intensity: flow,
          pain_level: painLevel,
          symptoms: selectedSymptoms.reduce((acc, s) => ({ ...acc, [s]: true }), {}),
          notes,
        }),
      })

      if (response.ok) {
        // Show saved confirmation
        setIsSaved(true)
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/period-tracker')
        }, 2000)
      }
    } catch (error) {
      console.error('Error logging period:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Saved Confirmation */}
      {isSaved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
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
                  <p className="text-sm text-green-600 font-hindi">पीरियड सफलतापूर्वक लॉग हो गया!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/period-tracker">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Period</h1>
          <p className="text-pink-600 font-hindi">पीरियड लॉग करें</p>
        </div>
      </div>

      {/* Date Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-pink-500" />
              When did it start?
            </CardTitle>
            <p className="text-sm text-pink-600 font-hindi">कब शुरू हुआ?</p>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              className="rounded-md border border-pink-100"
              disabled={(date) => date > new Date()}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Flow Intensity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-pink-500" />
              Flow Intensity
            </CardTitle>
            <p className="text-sm text-pink-600 font-hindi">फ्लो कितना है?</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {flowOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFlow(option.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    flow === option.value
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-pink-100 hover:border-pink-200'
                  )}
                >
                  <span className="text-2xl mb-2 block">{option.icon}</span>
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-pink-600 font-hindi">{option.labelHindi}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pain Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg">Pain Level</CardTitle>
            <p className="text-sm text-pink-600 font-hindi">दर्द कितना है?</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between gap-2">
              {painLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setPainLevel(level.value)}
                  className={cn(
                    'flex-1 p-3 rounded-xl border-2 text-center transition-all',
                    painLevel === level.value
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-pink-100 hover:border-pink-200'
                  )}
                >
                  <span className="text-2xl block mb-1">{level.emoji}</span>
                  <p className="text-xs text-gray-600">{level.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Symptoms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg">Symptoms</CardTitle>
            <p className="text-sm text-pink-600 font-hindi">लक्षण चुनें</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={cn(
                    'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                    selectedSymptoms.includes(symptom.id)
                      ? 'border-pink-500 bg-pink-500 text-white'
                      : 'border-pink-200 text-gray-700 hover:border-pink-300'
                  )}
                >
                  {symptom.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg">Notes (Optional)</CardTitle>
            <p className="text-sm text-pink-600 font-hindi">नोट्स (वैकल्पिक)</p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other symptoms or notes..."
              className="min-h-[100px] border-pink-200 focus:border-pink-500"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pb-6"
      >
        <Button
          onClick={handleSubmit}
          disabled={!startDate || isSubmitting}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 text-lg rounded-2xl"
        >
          {isSubmitting ? (
            'Saving...'
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Save Period Log
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}

