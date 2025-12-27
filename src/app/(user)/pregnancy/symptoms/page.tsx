'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Baby, 
  ArrowLeft,
  Check,
  Calendar,
  AlertTriangle,
  Heart,
  Stethoscope
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const commonSymptoms = [
  { id: 'nausea', label: 'Nausea', labelHindi: 'मतली', icon: '🤢', severity: 'mild' },
  { id: 'fatigue', label: 'Fatigue', labelHindi: 'थकान', icon: '😴', severity: 'mild' },
  { id: 'morning_sickness', label: 'Morning Sickness', labelHindi: 'सुबह की बीमारी', icon: '🌅', severity: 'mild' },
  { id: 'back_pain', label: 'Back Pain', labelHindi: 'कमर दर्द', icon: '🦴', severity: 'moderate' },
  { id: 'headache', label: 'Headache', labelHindi: 'सिरदर्द', icon: '🤕', severity: 'moderate' },
  { id: 'swelling', label: 'Swelling', labelHindi: 'सूजन', icon: '🦶', severity: 'moderate' },
  { id: 'shortness_breath', label: 'Shortness of Breath', labelHindi: 'सांस लेने में परेशानी', icon: '😮‍💨', severity: 'moderate' },
  { id: 'heartburn', label: 'Heartburn', labelHindi: 'सीने में जलन', icon: '🔥', severity: 'mild' },
  { id: 'constipation', label: 'Constipation', labelHindi: 'कब्ज', icon: '🚽', severity: 'mild' },
  { id: 'frequent_urination', label: 'Frequent Urination', labelHindi: 'बार-बार पेशाब', icon: '💧', severity: 'mild' },
]

const dangerSymptoms = [
  { id: 'bleeding', label: 'Bleeding', labelHindi: 'रक्तस्राव', icon: '🩸', urgent: true },
  { id: 'severe_pain', label: 'Severe Pain', labelHindi: 'तेज़ दर्द', icon: '😣', urgent: true },
  { id: 'high_fever', label: 'High Fever', labelHindi: 'तेज़ बुखार', icon: '🤒', urgent: true },
  { id: 'no_movement', label: 'Baby Not Moving', labelHindi: 'बच्चा नहीं हिल रहा', icon: '👶', urgent: true },
  { id: 'vision_problems', label: 'Vision Problems', labelHindi: 'दृष्टि की समस्या', icon: '👁️', urgent: true },
  { id: 'severe_swelling', label: 'Severe Swelling', labelHindi: 'गंभीर सूजन', icon: '🦶', urgent: true },
]

export default function LogSymptomsPage() {
  const router = useRouter()
  const [selectedSymptoms, setSelectedSymptoms] = React.useState<string[]>([])
  const [selectedDangerSymptoms, setSelectedDangerSymptoms] = React.useState<string[]>([])
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

  const toggleDangerSymptom = (symptomId: string) => {
    setSelectedDangerSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    )
  }

  const handleSubmit = async () => {
    if (selectedDangerSymptoms.length > 0) {
      // Redirect to emergency if danger symptoms selected
      router.push('/red-zone/activate')
      return
    }

    setIsSubmitting(true)
    try {
      // Here you would save to database
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show saved confirmation
      setIsSaved(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/pregnancy')
      }, 2000)
    } catch (error) {
      console.error('Error logging symptoms:', error)
      alert('Error logging symptoms. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasDangerSymptoms = selectedDangerSymptoms.length > 0

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
                  <p className="text-sm text-green-600 font-hindi">सफलतापूर्वक सेव हो गया!</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Log Symptoms</h1>
          <p className="text-pink-600 font-hindi">लक्षण बताएं</p>
        </div>
      </div>

      {/* Warning for Danger Symptoms */}
      {hasDangerSymptoms && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-red-50 border-red-200 border-2">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-700 mb-1">
                    Emergency Alert!
                  </h3>
                  <p className="text-sm text-red-600 mb-2">
                    You have selected danger symptoms. Please seek immediate medical attention.
                  </p>
                  <p className="text-sm text-red-600 font-hindi mb-3">
                    आपने खतरे के लक्षण चुने हैं। कृपया तुरंत चिकित्सा सहायता लें।
                  </p>
                  <Link href="/red-zone/activate">
                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Emergency SOS
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Danger Symptoms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Danger Signs - Seek Immediate Help
            </CardTitle>
            <p className="text-sm text-red-600 font-hindi">
              खतरे के संकेत - तुरंत मदद लें
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {dangerSymptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => toggleDangerSymptom(symptom.id)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all',
                    selectedDangerSymptoms.includes(symptom.id)
                      ? 'border-red-500 bg-red-100'
                      : 'border-red-200 hover:border-red-300 bg-white'
                  )}
                >
                  <span className="text-2xl mb-1 block">{symptom.icon}</span>
                  <p className="text-sm font-medium text-gray-900">{symptom.label}</p>
                  <p className="text-xs text-red-600 font-hindi">{symptom.labelHindi}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Common Symptoms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-pink-500" />
              Common Symptoms
            </CardTitle>
            <p className="text-sm text-pink-600 font-hindi">
              सामान्य लक्षण
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all',
                    selectedSymptoms.includes(symptom.id)
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-pink-100 hover:border-pink-200'
                  )}
                >
                  <span className="text-2xl mb-1 block">{symptom.icon}</span>
                  <p className="text-sm font-medium text-gray-900">{symptom.label}</p>
                  <p className="text-xs text-pink-600 font-hindi">{symptom.labelHindi}</p>
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
        transition={{ delay: 0.2 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
            <p className="text-sm text-pink-600 font-hindi">
              अतिरिक्त नोट्स
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your symptoms in detail..."
              className="min-h-[100px] border-pink-200 focus:border-pink-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Any other symptoms or concerns you'd like to mention?
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pb-6"
      >
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (selectedSymptoms.length === 0 && selectedDangerSymptoms.length === 0)}
          className={cn(
            "w-full py-6 text-lg rounded-2xl",
            hasDangerSymptoms
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-pink-500 hover:bg-pink-600 text-white"
          )}
        >
          {isSubmitting ? (
            'Saving...'
          ) : hasDangerSymptoms ? (
            <>
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency - Get Help Now
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Save Symptoms
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}

