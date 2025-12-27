'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Check, 
  X, 
  ArrowLeft,
  Play,
  Square,
  Volume2,
  Edit3,
  Save,
  ChevronDown,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition'
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech'

// Visit recording states
type RecordingState = 
  | 'idle'           // Ready to record
  | 'recording'      // Currently recording
  | 'processing'     // Transcribing & extracting data
  | 'review'         // Showing extracted data for review
  | 'editing'        // Manual editing mode
  | 'saving'         // Saving to database
  | 'success'        // Successfully saved
  | 'error'          // Error occurred

interface ExtractedVitals {
  blood_pressure?: { systolic: number; diastolic: number } | null
  weight_kg?: number | null
  temperature_celsius?: number | null
}

interface ExtractedData {
  patient_name?: string | null
  visit_type?: string | null
  vitals?: ExtractedVitals
  symptoms?: string[]
  symptom_severity?: string | null
  services_provided?: string[]
  medicines_distributed?: string[]
  counseling_topics?: string[]
  observations?: string | null
  concerns_noted?: string | null
  follow_up_required?: boolean
  next_visit_date?: string | null
  referral_needed?: boolean
  referral_reason?: string | null
}

export default function VoiceLogPage() {
  const router = useRouter()
  const speechRecognition = useSpeechRecognition('hi-IN')
  const tts = useTextToSpeech('hi-IN')
  
  // State
  const [recordingState, setRecordingState] = React.useState<RecordingState>('idle')
  const [transcription, setTranscription] = React.useState('')
  const [extractedData, setExtractedData] = React.useState<ExtractedData>({})
  const [confidenceScore, setConfidenceScore] = React.useState(0)
  const [beneficiaryName, setBeneficiaryName] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [visitId, setVisitId] = React.useState<string | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [recordingDuration, setRecordingDuration] = React.useState(0)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  
  // Recording duration display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Start recording using Web Speech API
  const handleStartRecording = () => {
    setError(null)
    setTranscription('')
    speechRecognition.resetTranscript()
    setRecordingState('recording')
    setRecordingDuration(0)
    
    // Start speech recognition
    speechRecognition.startListening()
    
    // Start duration timer
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1)
    }, 1000)
    
    // Speak prompt in Hindi
    tts.speak('कृपया विज़िट की जानकारी बोलें। मरीज़ का नाम, BP, वज़न और लक्षण बताएं।')
  }

  // Stop recording and process with Mistral
  const handleStopRecording = async () => {
    // Stop speech recognition
    speechRecognition.stopListening()
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Get final transcript
    const finalTranscript = speechRecognition.state.transcript + speechRecognition.state.interimTranscript
    
    if (!finalTranscript || finalTranscript.trim() === '') {
      setError('कोई आवाज़ नहीं सुनाई दी। कृपया फिर से कोशिश करें।')
      setRecordingState('error')
      return
    }
    
    setTranscription(finalTranscript)
    setRecordingState('processing')
    
    try {
      // Send transcription to voice processing API (Option B - text only)
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: finalTranscript }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Processing failed')
      }
      
      const result = await response.json()
      
      setTranscription(result.transcription)
      setExtractedData(result.extractedData)
      setConfidenceScore(result.confidenceScore)
      
      // Set beneficiary name from extracted data
      if (result.extractedData?.patient_name) {
        setBeneficiaryName(result.extractedData.patient_name)
      }
      
      // Speak follow-up question if data incomplete
      if (result.followUpQuestion) {
        tts.speak(result.followUpQuestion)
      }
      
      setRecordingState('review')
    } catch (err) {
      console.error('Processing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process recording')
      setRecordingState('error')
    }
  }

  // Save visit to database
  const handleSaveVisit = async () => {
    setRecordingState('saving')
    setError(null)
    
    try {
      const response = await fetch('/api/visits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiary_name: beneficiaryName,
          visit_type: extractedData.visit_type,
          voice_transcription: transcription,
          ai_extracted_data: extractedData,
          ai_confidence_score: confidenceScore,
          vitals: extractedData.vitals,
          symptoms: extractedData.symptoms,
          symptom_severity: extractedData.symptom_severity,
          services_provided: extractedData.services_provided,
          medicines_distributed: extractedData.medicines_distributed,
          counseling_topics: extractedData.counseling_topics,
          observations: extractedData.observations,
          concerns_noted: extractedData.concerns_noted,
          follow_up_required: extractedData.follow_up_required,
          next_visit_date: extractedData.next_visit_date,
          referral_needed: extractedData.referral_needed,
          referral_reason: extractedData.referral_reason,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save visit')
      }
      
      const result = await response.json()
      setVisitId(result.visit_id)
      setRecordingState('success')
      
      // Speak confirmation
      tts.speak('विज़िट सफलतापूर्वक सेव हो गई।')
      
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save visit')
      setRecordingState('error')
    }
  }

  // Reset to start new recording
  const handleReset = () => {
    speechRecognition.resetTranscript()
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecordingState('idle')
    setRecordingDuration(0)
    setTranscription('')
    setExtractedData({})
    setConfidenceScore(0)
    setBeneficiaryName('')
    setError(null)
    setVisitId(null)
    setIsEditing(false)
  }

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Update extracted data field
  const updateField = (field: keyof ExtractedData, value: unknown) => {
    setExtractedData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-orange-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">
            वॉइस विज़िट लॉग
          </h1>
          <div className="w-6" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        
        {/* IDLE: Ready to Record */}
        <AnimatePresence mode="wait">
          {recordingState === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Optional: Pre-select beneficiary */}
              <Card>
                <CardContent className="pt-4">
                  <Label htmlFor="beneficiary" className="text-gray-700">
                    मरीज़ का नाम (वैकल्पिक)
                  </Label>
                  <Input
                    id="beneficiary"
                    placeholder="नाम टाइप करें या बोलते समय बताएं..."
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
              
              {/* Record Button */}
              <div className="flex flex-col items-center gap-4 py-8">
                <motion.button
                  onClick={handleStartRecording}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mic className="w-16 h-16" />
                </motion.button>
                <p className="text-gray-600 text-center">
                  विज़िट रिकॉर्ड करने के लिए<br />
                  <span className="font-semibold">माइक बटन दबाएं</span>
                </p>
              </div>
              
              {/* Instructions */}
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4">
                  <h3 className="font-medium text-orange-800 mb-2">क्या बोलें:</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• मरीज़ का नाम</li>
                    <li>• BP, वज़न, तापमान</li>
                    <li>• लक्षण और शिकायतें</li>
                    <li>• दी गई दवाइयां</li>
                    <li>• अगली विज़िट की तारीख</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* RECORDING: Show pulse animation and live transcript */}
          {recordingState === 'recording' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-8"
            >
              {/* Animated Recording Circle */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500 opacity-25"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500 opacity-15"
                  animate={{ scale: [1, 2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.button
                  onClick={handleStopRecording}
                  className="relative w-32 h-32 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg z-10"
                  whileTap={{ scale: 0.95 }}
                >
                  <Square className="w-12 h-12" />
                </motion.button>
              </div>
              
              {/* Duration */}
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {formatDuration(recordingDuration)}
                </p>
                <p className="text-gray-600 mt-2">रिकॉर्डिंग चल रही है...</p>
                <p className="text-sm text-gray-500 mt-1">बंद करने के लिए बटन दबाएं</p>
              </div>
              
              {/* Live Transcript Preview */}
              {(speechRecognition.state.transcript || speechRecognition.state.interimTranscript) && (
                <Card className="w-full">
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500 mb-1">आप बोल रहे हैं:</p>
                    <p className="text-gray-800">
                      {speechRecognition.state.transcript}
                      <span className="text-gray-400 italic">{speechRecognition.state.interimTranscript}</span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* PROCESSING: Show loader */}
          {recordingState === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-16"
            >
              <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
              <div className="text-center">
                <p className="text-lg font-medium text-gray-800">प्रोसेस हो रहा है...</p>
                <p className="text-gray-600 mt-1">ऑडियो से डेटा निकाल रहे हैं</p>
              </div>
            </motion.div>
          )}

          {/* REVIEW: Show extracted data */}
          {(recordingState === 'review' || recordingState === 'editing') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Confidence Badge */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant={confidenceScore > 0.7 ? 'default' : confidenceScore > 0.4 ? 'secondary' : 'destructive'}
                  className="text-sm"
                >
                  {Math.round(confidenceScore * 100)}% Confidence
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  {isEditing ? 'Done' : 'Edit'}
                </Button>
              </div>

              {/* Transcription */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    ट्रांसक्रिप्शन
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-800">{transcription || 'No transcription'}</p>
                  )}
                </CardContent>
              </Card>

              {/* Patient Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    मरीज़ की जानकारी
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">नाम</Label>
                    {isEditing ? (
                      <Input
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{beneficiaryName || extractedData.patient_name || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">विज़िट टाइप</Label>
                    {isEditing ? (
                      <Input
                        value={extractedData.visit_type || ''}
                        onChange={(e) => updateField('visit_type', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{extractedData.visit_type || '—'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vitals */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">BP</Label>
                      <p className="font-medium">
                        {extractedData.vitals?.blood_pressure 
                          ? `${extractedData.vitals.blood_pressure.systolic}/${extractedData.vitals.blood_pressure.diastolic}`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">वज़न (kg)</Label>
                      <p className="font-medium">{extractedData.vitals?.weight_kg || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">तापमान</Label>
                      <p className="font-medium">
                        {extractedData.vitals?.temperature_celsius 
                          ? `${extractedData.vitals.temperature_celsius}°C`
                          : '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Symptoms */}
              {extractedData.symptoms && extractedData.symptoms.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">लक्षण</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {extractedData.symptoms.map((symptom, i) => (
                        <Badge key={i} variant="outline">{symptom}</Badge>
                      ))}
                    </div>
                    {extractedData.symptom_severity && (
                      <Badge 
                        className="mt-2"
                        variant={extractedData.symptom_severity === 'severe' ? 'destructive' : 'secondary'}
                      >
                        {extractedData.symptom_severity}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Services & Medicines */}
              {(extractedData.services_provided?.length || extractedData.medicines_distributed?.length) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">सेवाएं और दवाइयां</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {extractedData.services_provided && extractedData.services_provided.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {extractedData.services_provided.map((service, i) => (
                          <Badge key={i} variant="outline" className="bg-green-50">{service}</Badge>
                        ))}
                      </div>
                    )}
                    {extractedData.medicines_distributed && extractedData.medicines_distributed.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {extractedData.medicines_distributed.map((med, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50">{med}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Observations */}
              {extractedData.observations && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">टिप्पणियां</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800">{extractedData.observations}</p>
                  </CardContent>
                </Card>
              )}

              {/* Follow-up & Referral */}
              <Card>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Follow-up ज़रूरी</span>
                    <Badge variant={extractedData.follow_up_required ? 'default' : 'secondary'}>
                      {extractedData.follow_up_required ? 'हाँ' : 'नहीं'}
                    </Badge>
                  </div>
                  {extractedData.next_visit_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">अगली विज़िट</span>
                      <span className="font-medium">{extractedData.next_visit_date}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">रेफरल</span>
                    <Badge variant={extractedData.referral_needed ? 'destructive' : 'secondary'}>
                      {extractedData.referral_needed ? 'हाँ' : 'नहीं'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReset}
                >
                  <X className="w-4 h-4 mr-2" />
                  रद्द करें
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSaveVisit}
                >
                  <Save className="w-4 h-4 mr-2" />
                  सेव करें
                </Button>
              </div>
            </motion.div>
          )}

          {/* SAVING: Show progress */}
          {recordingState === 'saving' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-16"
            >
              <Loader2 className="w-16 h-16 text-green-500 animate-spin" />
              <p className="text-lg font-medium text-gray-800">सेव हो रहा है...</p>
            </motion.div>
          )}

          {/* SUCCESS: Show confirmation */}
          {recordingState === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
              >
                <Check className="w-12 h-12 text-green-600" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800">विज़िट सेव हो गई!</h2>
                <p className="text-gray-600 mt-1">{beneficiaryName || 'Patient'} की विज़िट रिकॉर्ड हो गई</p>
              </div>
              <div className="flex gap-3 w-full max-w-xs">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReset}
                >
                  नई विज़िट
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => router.push('/dashboard')}
                >
                  डैशबोर्ड
                </Button>
              </div>
            </motion.div>
          )}

          {/* ERROR: Show error message */}
          {recordingState === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-12"
            >
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-12 h-12 text-red-600" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800">कुछ गड़बड़ हो गई</h2>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
              <Button onClick={handleReset} className="w-full max-w-xs">
                फिर से कोशिश करें
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
