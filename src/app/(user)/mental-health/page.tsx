'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Smile, 
  Frown, 
  Meh,
  Volume2,
  Mic,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder'

type MoodType = 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad' | 'anxious' | 'stressed'

const moodOptions: { value: MoodType; emoji: string; label: string; labelHindi: string }[] = [
  { value: 'very_happy', emoji: '😊', label: 'Very Happy', labelHindi: 'बहुत खुश' },
  { value: 'happy', emoji: '🙂', label: 'Happy', labelHindi: 'खुश' },
  { value: 'neutral', emoji: '😐', label: 'Okay', labelHindi: 'ठीक है' },
  { value: 'sad', emoji: '😢', label: 'Sad', labelHindi: 'उदास' },
  { value: 'very_sad', emoji: '😔', label: 'Very Sad', labelHindi: 'बहुत उदास' },
  { value: 'anxious', emoji: '😰', label: 'Anxious', labelHindi: 'चिंतित' },
  { value: 'stressed', emoji: '😓', label: 'Stressed', labelHindi: 'तनावग्रस्त' }
]

export default function MentalHealthPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedMood, setSelectedMood] = React.useState<MoodType | null>(null)
  const [stressLevel, setStressLevel] = React.useState(5)
  const [feelingOverwhelmed, setFeelingOverwhelmed] = React.useState(false)
  const [feelingSupported, setFeelingSupported] = React.useState(true)
  const [sleepQuality, setSleepQuality] = React.useState(5)
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  
  const { 
    state: voiceState, 
    startRecording, 
    stopRecording,
  } = useVoiceRecorder()

  const handleSubmit = async () => {
    if (!selectedMood || !user) return

    setLoading(true)
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

      // Get user profile id
      const { data: profile } = await supabase
        .from('asha_user_profiles')
        .select('id')
        .eq('user_id', ashaUser.id)
        .single()

      if (profile) {
        await supabase
          .from('mental_health_checkins')
          .insert({
            user_id: profile.id,
            mood: selectedMood,
            stress_level: stressLevel,
            feeling_overwhelmed: feelingOverwhelmed,
            feeling_supported: feelingSupported,
            sleep_quality: sleepQuality,
            voice_transcription: null,
            user_response: null,
            requires_attention: selectedMood === 'very_sad' || selectedMood === 'stressed' || stressLevel >= 8,
            suggested_action: selectedMood === 'very_sad' || stressLevel >= 8
              ? 'Talk to ASHA Didi or listen to calming audio'
              : null,
            is_private: true,
            shared_with_asha: false
          })

        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error saving check-in:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-8">
              <div className="w-20 h-20 rounded-full bg-purple-500 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-purple-600 font-hindi mb-4">धन्यवाद!</p>
              <p className="text-gray-600 mb-6">
                Your feelings matter. Take care of yourself.
              </p>
              <p className="text-gray-600 font-hindi">
                आपकी भावनाएं महत्वपूर्ण हैं। अपना ख्याल रखें।
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="mt-6 bg-purple-500 hover:bg-purple-600"
              >
                Check In Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">How Are You Feeling?</h1>
          <p className="text-purple-600 font-hindi">आज आपका मन कैसा है?</p>
          <p className="text-gray-600 text-sm mt-2">
            This is a safe space. Your responses are private.
          </p>
        </div>
      </div>

      {/* Mood Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="text-lg">Select Your Mood</CardTitle>
            <p className="text-sm text-gray-500 font-hindi">अपना मूड चुनें</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`
                    p-6 rounded-xl border-2 transition-all
                    ${selectedMood === mood.value
                      ? 'border-purple-500 bg-purple-50 scale-105'
                      : 'border-purple-200 hover:border-purple-300'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium text-gray-700">{mood.label}</div>
                  <div className="text-xs text-gray-500 font-hindi">{mood.labelHindi}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Optional Voice Recording */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Want to Share More? (Optional)</CardTitle>
              <p className="text-sm text-gray-500 font-hindi">कुछ और बताना चाहेंगी? (वैकल्पिक)</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {transcript && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-700">{transcript}</p>
                </div>
              )}
              
              <Button
                onClick={voiceState.isListening ? stopListening : startListening}
                className={`w-full ${
                  voiceState.isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
                size="lg"
              >
                {voiceState.isListening ? (
                  <>
                    <Mic className="w-5 h-5 mr-2 animate-pulse" />
                    Recording... Tap to stop
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Record Your Feelings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stress Level */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Stress Level (1-10)</CardTitle>
              <p className="text-sm text-gray-500 font-hindi">तनाव का स्तर (1-10)</p>
            </CardHeader>
            <CardContent>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Low (1)</span>
                <span className="font-bold text-purple-600">{stressLevel}</span>
                <span>High (10)</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sleep Quality */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Sleep Quality (1-10)</CardTitle>
              <p className="text-sm text-gray-500 font-hindi">नींद की गुणवत्ता (1-10)</p>
            </CardHeader>
            <CardContent>
              <input
                type="range"
                min="1"
                max="10"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Poor (1)</span>
                <span className="font-bold text-purple-600">{sleepQuality}</span>
                <span>Excellent (10)</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Submit Button */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-600 text-lg py-6"
            size="lg"
          >
            {loading ? 'Saving...' : 'Save Check-In'}
          </Button>
        </motion.div>
      )}

      {/* Support Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900 mb-1">Remember</p>
                <p className="text-sm text-purple-700">
                  This is not a diagnosis. If you're feeling very overwhelmed, please talk to your ASHA worker or a healthcare provider.
                </p>
                <p className="text-sm text-purple-700 font-hindi mt-1">
                  यह निदान नहीं है। यदि आप बहुत अधिक परेशान महसूस कर रही हैं, तो कृपया अपनी ASHA दीदी या स्वास्थ्य सेवा प्रदाता से बात करें।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

