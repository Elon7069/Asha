'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  Send, 
  Volume2, 
  VolumeX,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { VoiceButton, VoiceWaveform, RecordingTimer } from '@/components/ui/voice-button'
import { VoiceOrb2D } from '@/components/3d/VoiceOrb'
import { LanguageToggle } from '@/components/shared/LanguageSelector'
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition'
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isEmergency?: boolean
}

export default function AshaDidiPage() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [language, setLanguage] = React.useState<'hi' | 'en'>('hi')
  const [sessionId] = React.useState(() => crypto.randomUUID())
  const [autoSpeak, setAutoSpeak] = React.useState(true)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Speech recognition hook
  const speechLang = language === 'hi' ? 'hi-IN' : 'en-US'
  const { 
    state: speechState, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition(speechLang)

  // Text-to-speech hook
  const { 
    state: ttsState, 
    speak, 
    stop: stopSpeaking 
  } = useTextToSpeech(speechLang)

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle speech recognition result
  React.useEffect(() => {
    if (speechState.transcript && !speechState.isListening) {
      handleSendMessage(speechState.transcript)
      resetTranscript()
    }
  }, [speechState.isListening, speechState.transcript])

  // Initial greeting
  React.useEffect(() => {
    const greeting = language === 'hi' 
      ? 'नमस्ते! मैं आशा दीदी हूं। आप मुझसे कुछ भी पूछ सकती हैं - पीरियड्स, गर्भावस्था, खान-पान, या कोई भी स्वास्थ्य सवाल। बस बोलें!'
      : 'Hello! I am Asha Didi. You can ask me anything - periods, pregnancy, nutrition, or any health question. Just speak!'
    
    setMessages([{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }])

    if (autoSpeak) {
      speak(greeting)
    }
  }, [language])

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          language,
          sessionId,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        isEmergency: data.isEmergency,
      }
      setMessages(prev => [...prev, assistantMessage])

      // Speak the response
      if (autoSpeak) {
        speak(data.message)
      }

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = language === 'hi'
        ? 'माफ़ करें, कुछ गड़बड़ हो गई। कृपया फिर से कोशिश करें।'
        : 'Sorry, something went wrong. Please try again.'
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoicePress = () => {
    if (speechState.isListening) {
      stopListening()
    } else {
      stopSpeaking()
      startListening()
    }
  }

  const clearChat = () => {
    const greeting = language === 'hi' 
      ? 'नमस्ते! मैं आशा दीदी हूं। आप मुझसे कुछ भी पूछ सकती हैं।'
      : 'Hello! I am Asha Didi. You can ask me anything.'
    
    setMessages([{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <VoiceOrb2D 
            size="sm" 
            isListening={speechState.isListening}
            isSpeaking={ttsState.isSpeaking}
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Asha Didi</h1>
            <p className="text-sm text-pink-600 font-hindi">आशा दीदी</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={cn(autoSpeak ? 'text-pink-600' : 'text-gray-400')}
          >
            {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="text-gray-400"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="flex justify-center mb-4">
        <LanguageToggle value={language} onChange={setLanguage} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <Card className={cn(
                'max-w-[85%]',
                message.role === 'user' 
                  ? 'bg-pink-500 text-white border-0' 
                  : message.isEmergency
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-pink-100'
              )}>
                <CardContent className="p-3">
                  {message.isEmergency && (
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-semibold">Emergency Detected</span>
                    </div>
                  )}
                  <p className={cn(
                    'text-base leading-relaxed',
                    message.role === 'assistant' && 'font-hindi'
                  )}>
                    {message.content}
                  </p>
                  <p className={cn(
                    'text-xs mt-1',
                    message.role === 'user' ? 'text-pink-200' : 'text-gray-400'
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Processing indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <Card className="bg-white border-pink-100">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-500">
                    {language === 'hi' ? 'सोच रही हूं...' : 'Thinking...'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Input Area */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-4 border border-pink-100 shadow-lg">
        {/* Transcript preview */}
        {(speechState.transcript || speechState.interimTranscript) && (
          <div className="mb-4 p-3 bg-pink-50 rounded-xl">
            <p className="text-gray-700">
              {speechState.transcript}
              <span className="text-gray-400">{speechState.interimTranscript}</span>
            </p>
          </div>
        )}

        {/* Recording indicator */}
        {speechState.isListening && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <VoiceWaveform isActive={speechState.isListening} />
            <span className="text-pink-600 font-medium">
              {language === 'hi' ? 'सुन रही हूं...' : 'Listening...'}
            </span>
          </div>
        )}

        {/* Voice Button */}
        <div className="flex justify-center">
          <VoiceButton
            isRecording={speechState.isListening}
            isProcessing={isProcessing}
            disabled={!speechState.isSupported}
            onPress={handleVoicePress}
            onRelease={() => {}}
            size="xl"
            label={speechState.isListening ? 'Tap to stop' : 'Tap to speak'}
            labelHindi={speechState.isListening ? 'रोकने के लिए दबाएं' : 'बोलने के लिए दबाएं'}
          />
        </div>

        {/* Hint */}
        {!speechState.isSupported && (
          <p className="text-center text-sm text-red-500 mt-3">
            Voice input not supported in this browser
          </p>
        )}
      </div>
    </div>
  )
}

