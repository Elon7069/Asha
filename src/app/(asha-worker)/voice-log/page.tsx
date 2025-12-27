'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mic, MicOff, PlayCircle, StopCircle, CheckCircle, AlertTriangle, Calendar, MapPin } from 'lucide-react'

interface VoiceLogState {
  isRecording: boolean
  hasRecording: boolean
  isProcessing: boolean
  hasResult: boolean
}

interface ProcessedVisit {
  beneficiaryName: string
  location: string
  date: string
  healthMetrics: {
    weight: string
    bloodPressure: string
    hemoglobin: string
    temperature: string
  }
  concerns: string[]
  medications: string[]
  nextVisitDate: string
  riskLevel: 'low' | 'medium' | 'high'
  aiConfidence: number
}

// Mock processed data
const mockProcessedVisit: ProcessedVisit = {
  beneficiaryName: 'श्रीमती सुनीता देवी',
  location: 'गोकुलपुर गांव',
  date: new Date().toLocaleDateString('hi-IN'),
  healthMetrics: {
    weight: '52 किग्रा',
    bloodPressure: '130/85',
    hemoglobin: '10.2 g/dL',
    temperature: '98.6°F'
  },
  concerns: [
    'पेट में हल्का दर्द',
    'कभी-कभी सांस लेने में परेशानी',
    'नींद नहीं आती'
  ],
  medications: [
    'आयरन की गोली - दिन में 2 बार',
    'कैल्शियम - रात में 1 गोली'
  ],
  nextVisitDate: 'अगले सप्ताह मंगलवार',
  riskLevel: 'medium',
  aiConfidence: 85
}

export default function VoiceLogPage() {
  const [voiceState, setVoiceState] = useState<VoiceLogState>({
    isRecording: false,
    hasRecording: false,
    isProcessing: false,
    hasResult: false
  })
  const [recordingDuration, setRecordingDuration] = useState(0)

  const startRecording = () => {
    setVoiceState(prev => ({ ...prev, isRecording: true }))
    // Simulate recording duration
    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1)
    }, 1000)
    
    // Stop after 3 seconds for demo
    setTimeout(() => {
      clearInterval(interval)
      stopRecording()
    }, 3000)
  }

  const stopRecording = () => {
    setVoiceState(prev => ({ 
      ...prev, 
      isRecording: false, 
      hasRecording: true,
      isProcessing: true 
    }))
    
    // Simulate AI processing
    setTimeout(() => {
      setVoiceState(prev => ({ 
        ...prev, 
        isProcessing: false,
        hasResult: true 
      }))
    }, 2000)
  }

  const saveVisit = () => {
    // Here you would save to database
    alert('विजिट सफलतापूर्वक सेव हो गई! 📝')
    // Reset state or navigate back
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            वापस
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-800">विजिट रिकॉर्ड करें</h1>
        <div></div>
      </div>

      {!voiceState.hasResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          
          {/* Instructions */}
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-emerald-700 mb-3">🎙️ वॉइस रिकॉर्डिंग गाइड</h2>
              <div className="text-sm text-emerald-600 space-y-2 text-left">
                <p>• महिला का नाम और गांव बताएं</p>
                <p>• स्वास्थ्य जांच की जानकारी दें</p>
                <p>• कोई परेशानी या शिकायत हो तो बताएं</p>
                <p>• दी गई दवाइयां बताएं</p>
                <p>• अगली विजिट कब करनी है बताएं</p>
              </div>
            </CardContent>
          </Card>

          {/* Recording Interface */}
          <div className="space-y-4">
            {voiceState.isRecording && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-3"
              >
                <div className="text-2xl font-bold text-red-600">
                  🔴 रिकॉर्डिंग चल रही है...
                </div>
                <div className="text-xl font-mono text-gray-700">
                  {formatTime(recordingDuration)}
                </div>
                <div className="flex justify-center space-x-4 animate-pulse">
                  <div className="w-2 h-6 bg-red-500 rounded"></div>
                  <div className="w-2 h-8 bg-red-500 rounded"></div>
                  <div className="w-2 h-4 bg-red-500 rounded"></div>
                  <div className="w-2 h-10 bg-red-500 rounded"></div>
                  <div className="w-2 h-6 bg-red-500 rounded"></div>
                </div>
              </motion.div>
            )}

            {voiceState.isProcessing && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-3"
              >
                <div className="text-xl font-semibold text-blue-600">
                  🤖 AI आपकी रिकॉर्डिंग समझ रहा है...
                </div>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </motion.div>
            )}

            {/* Record Button */}
            {!voiceState.isRecording && !voiceState.isProcessing && (
              <Button
                onClick={startRecording}
                disabled={voiceState.hasRecording}
                className={`w-40 h-40 rounded-full text-white text-xl font-bold shadow-xl ${
                  voiceState.hasRecording
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105 transition-transform'
                }`}
              >
                {voiceState.hasRecording ? (
                  <CheckCircle className="w-16 h-16" />
                ) : (
                  <Mic className="w-16 h-16" />
                )}
              </Button>
            )}

            {!voiceState.hasRecording && !voiceState.isRecording && (
              <p className="text-gray-600">
                बटन दबाकर अपनी विजिट रिकॉर्ड करें
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* AI Processing Result */}
      {voiceState.hasResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          
          {/* AI Confidence */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-700 font-semibold">AI विश्वसनीयता</div>
                  <div className="text-2xl font-bold text-blue-800">{mockProcessedVisit.aiConfidence}%</div>
                </div>
                <div className="text-blue-600">
                  🤖 AI ने आपकी रिकॉर्डिंग समझ ली
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visit Details */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                
                {/* Basic Info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{mockProcessedVisit.beneficiaryName}</h3>
                    <Badge className={getRiskColor(mockProcessedVisit.riskLevel)}>
                      {mockProcessedVisit.riskLevel === 'high' ? '🔴 हाई रिस्क' :
                       mockProcessedVisit.riskLevel === 'medium' ? '🟡 मीडियम रिस्क' : '🟢 कम रिस्क'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {mockProcessedVisit.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {mockProcessedVisit.date}
                    </div>
                  </div>
                </div>

                {/* Health Metrics */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">📊 स्वास्थ्य जांच</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">वजन</div>
                      <div className="font-semibold">{mockProcessedVisit.healthMetrics.weight}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">BP</div>
                      <div className="font-semibold">{mockProcessedVisit.healthMetrics.bloodPressure}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">हीमोग्लोबिन</div>
                      <div className="font-semibold">{mockProcessedVisit.healthMetrics.hemoglobin}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">तापमान</div>
                      <div className="font-semibold">{mockProcessedVisit.healthMetrics.temperature}</div>
                    </div>
                  </div>
                </div>

                {/* Concerns */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">⚠️ परेशानियां</h4>
                  <div className="space-y-1">
                    {mockProcessedVisit.concerns.map((concern, idx) => (
                      <div key={idx} className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                        • {concern}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">💊 दी गई दवाइयां</h4>
                  <div className="space-y-1">
                    {mockProcessedVisit.medications.map((med, idx) => (
                      <div key={idx} className="text-sm bg-green-50 p-2 rounded border border-green-200">
                        • {med}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Visit */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">📅 अगली विजिट</h4>
                  <div className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {mockProcessedVisit.nextVisitDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setVoiceState({
              isRecording: false,
              hasRecording: false,
              isProcessing: false,
              hasResult: false
            })}>
              🎤 फिर से रिकॉर्ड करें
            </Button>
            <Button onClick={saveVisit} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              ✅ सेव करें
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

