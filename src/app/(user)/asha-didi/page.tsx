'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  Send, 
  Volume2, 
  VolumeX,
  RefreshCw,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { VoiceButton, VoiceWaveform, RecordingTimer } from '@/components/ui/voice-button'
import { VoiceOrb2D } from '@/components/3d/VoiceOrb'
import { LanguageToggle } from '@/components/shared/LanguageSelector'
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition'
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder'
import { useWhisperSTT } from '@/lib/hooks/useWhisperSTT'
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isEmergency?: boolean
}

export default function AshaDidiPage() {
  const router = useRouter()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [language, setLanguage] = React.useState<'hi' | 'en'>('hi')
  const [sessionId] = React.useState(() => crypto.randomUUID())
  const [autoSpeak, setAutoSpeak] = React.useState(true)
  const [inputText, setInputText] = React.useState('')
  const [inputMode, setInputMode] = React.useState<'voice' | 'text'>('voice')
  const [sttMode, setSttMode] = React.useState<'web-speech' | 'whisper'>('web-speech')
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Language code mapping for speech recognition
  const speechLang = language === 'hi' ? 'hi-IN' : 'en-US'

  // PRIMARY: Web Speech API (browser-based, real-time)
  const { 
    state: speechState, 
    startListening, 
    stopListening,
    resetTranscript: resetSpeechTranscript
  } = useSpeechRecognition(speechLang)

  // FALLBACK: Voice recording + Whisper (for unsupported browsers)
  const { 
    state: recordingState, 
    startRecording, 
    stopRecording 
  } = useVoiceRecorder()

  const { 
    isProcessing: isTranscribing,
    transcript: whisperTranscript,
    error: whisperError,
    processAudio,
    resetTranscript: resetWhisperTranscript
  } = useWhisperSTT()

  // Text-to-speech (browser Web Speech API)
  const { 
    state: ttsState, 
    speak, 
    stop: stopSpeaking 
  } = useTextToSpeech(speechLang)

  // Determine which STT to use based on browser support
  React.useEffect(() => {
    if (!speechState.isSupported) {
      console.log('Web Speech API not supported, falling back to Whisper')
      setSttMode('whisper')
    } else {
      console.log('Using Web Speech API for real-time transcription')
      setSttMode('web-speech')
    }
  }, [speechState.isSupported])

  // Track if we're currently in voice input mode
  const isListening = sttMode === 'web-speech' ? speechState.isListening : recordingState.isRecording
  const currentTranscript = sttMode === 'web-speech' 
    ? (speechState.transcript || speechState.interimTranscript)
    : whisperTranscript

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle Web Speech API transcript (real-time, auto-submit when done speaking)
  React.useEffect(() => {
    if (sttMode === 'web-speech' && speechState.transcript && !speechState.isListening) {
      const finalText = speechState.transcript.trim()
      if (finalText) {
        console.log('Web Speech transcription received:', finalText)
        handleSendMessage(finalText)
        resetSpeechTranscript()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechState.transcript, speechState.isListening, sttMode])

  // Handle Whisper transcription result (fallback mode)
  React.useEffect(() => {
    if (sttMode === 'whisper' && whisperTranscript && !isTranscribing && whisperTranscript.trim()) {
      console.log('Whisper transcription received:', whisperTranscript)
      // Put in input field for user review before sending
      setInputText(whisperTranscript)
      resetWhisperTranscript()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whisperTranscript, isTranscribing, sttMode])

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
      // Small delay to ensure TTS voices are loaded
      setTimeout(() => {
        console.log('Speaking greeting:', greeting)
        speak(greeting)
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    // Get conversation history before adding the new message
    const conversationHistory = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }))
    
    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory,
          language,
          sessionId,
        }),
      })

      // Check response status before parsing JSON
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
          } else {
            const text = await response.text()
            if (text) {
              errorMessage = text.substring(0, 200)
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Validate response has required fields
      if (!data.message || typeof data.message !== 'string') {
        throw new Error('Invalid response from server')
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
        // Small delay to ensure TTS is ready
        setTimeout(() => {
          console.log('Speaking response:', data.message)
          speak(data.message)
        }, 100)
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

  const handleVoicePress = async () => {
    try {
      // Stop any ongoing speech
      stopSpeaking()

      if (sttMode === 'web-speech') {
        // PRIMARY: Web Speech API (real-time transcription)
        if (speechState.isListening) {
          console.log('Stopping Web Speech recognition...')
          stopListening()
        } else {
          console.log('Starting Web Speech recognition...')
          resetSpeechTranscript()
          setInputMode('voice')
          startListening()
        }
      } else {
        // FALLBACK: Whisper (record then transcribe)
        if (recordingState.isRecording) {
          console.log('Stopping recording for Whisper...')
          const audioBlob = await stopRecording()
          if (audioBlob && audioBlob.size > 0) {
            console.log('Audio recorded, processing with Whisper...', { size: audioBlob.size, type: audioBlob.type })
            await processAudio(audioBlob, speechLang)
          } else {
            console.warn('No audio data recorded')
          }
        } else {
          console.log('Starting recording for Whisper...')
          resetWhisperTranscript()
          setInputMode('voice')
          await startRecording()
        }
      }
    } catch (error) {
      console.error('Error in handleVoicePress:', error)
    }
  }

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (inputText.trim() && !isProcessing) {
      setInputMode('text')
      handleSendMessage(inputText.trim())
      setInputText('')
    }
  }

  const handleInputFocus = () => {
    setInputMode('text')
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Header - Compact */}
      <div className="flex items-center justify-between py-2 px-1 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/user-dashboard">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <VoiceOrb2D 
            size="sm" 
            isListening={isListening}
            isSpeaking={ttsState.isSpeaking}
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Asha Didi</h1>
            <p className="text-xs text-pink-600 font-hindi">आशा दीदी</p>
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

      {/* Language Toggle - Compact */}
      <div className="flex justify-center py-1 shrink-0">
        <LanguageToggle value={language} onChange={setLanguage} />
      </div>

      {/* Messages Area - Expanded */}
      <div className="flex-1 overflow-y-auto space-y-3 py-2 px-1 min-h-0">
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
                'max-w-[90%] shadow-sm',
                message.role === 'user' 
                  ? 'bg-pink-500 text-white border-0' 
                  : message.isEmergency
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-pink-100'
              )}>
                <CardContent className="px-3 py-2">
                  {message.isEmergency && (
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-semibold">Emergency Detected</span>
                    </div>
                  )}
                  <p className={cn(
                    'text-sm leading-relaxed',
                    message.role === 'assistant' && 'font-hindi'
                  )}>
                    {message.content}
                  </p>
                  <p className={cn(
                    'text-[10px] mt-0.5 opacity-70',
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

      {/* Input Area - Compact */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-3 border border-pink-100 shadow-lg shrink-0 mt-auto">
        {/* Text Input (always available, shown when typing or in text mode) */}
        {(inputMode === 'text' || inputText) && (
          <form onSubmit={handleTextSubmit} className="mb-2">
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={handleInputFocus}
                placeholder={language === 'hi' ? 'अपना सवाल लिखें...' : 'Type your question...'}
                className="w-full pr-20 border-pink-200 focus:border-pink-400"
                disabled={isProcessing || isListening || isTranscribing}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleVoicePress}
                  disabled={isProcessing || (!isListening && isTranscribing)}
                  className={cn(
                    'p-2 h-8 w-8',
                    isListening 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'hover:bg-pink-100 text-pink-600'
                  )}
                >
                  <Mic className={cn('w-4 h-4', isListening && 'animate-pulse')} />
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  disabled={!inputText.trim() || isProcessing}
                  className="p-2 h-8 w-8 hover:bg-pink-100 text-pink-600 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Transcript preview (voice mode) */}
        {inputMode === 'voice' && (currentTranscript || isTranscribing || speechState.interimTranscript) && (
          <div className="mb-4 p-3 bg-pink-50 rounded-xl">
            {isTranscribing ? (
              <p className="text-gray-500 italic">
                {language === 'hi' ? 'ट्रांसक्राइब कर रही हूं...' : 'Transcribing...'}
              </p>
            ) : speechState.interimTranscript ? (
              <p className="text-gray-500 italic">{speechState.interimTranscript}</p>
            ) : currentTranscript ? (
              <p className="text-gray-700">{currentTranscript}</p>
            ) : null}
            {(whisperError || speechState.error) && (
              <p className="text-red-500 text-sm mt-1">{whisperError || speechState.error}</p>
            )}
          </div>
        )}

        {/* Recording/Listening indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-3 mb-2">
            <VoiceWaveform isActive={isListening} />
            <span className="text-pink-600 font-medium text-sm">
              {sttMode === 'web-speech' 
                ? (language === 'hi' ? 'सुन रही हूं...' : 'Listening...')
                : (language === 'hi' ? 'रिकॉर्डिंग...' : 'Recording...')
              }
            </span>
            {sttMode === 'whisper' && recordingState.duration > 0 && (
              <span className="text-sm text-gray-500">
                {Math.floor(recordingState.duration / 60)}:{(recordingState.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        )}

        {/* Voice Button (primary input method - shown when not typing) */}
        {(!inputText || inputMode === 'voice') && (
          <div className="flex flex-col items-center py-1">
            <VoiceButton
              isRecording={isListening}
              isProcessing={isProcessing || isTranscribing}
              disabled={!isListening && isTranscribing}
              onPress={handleVoicePress}
              onRelease={() => {}}
              size="lg"
              label={
                isListening 
                  ? (sttMode === 'web-speech' ? 'Tap to stop' : 'Tap to stop') 
                  : isTranscribing 
                    ? 'Transcribing...' 
                    : (sttMode === 'web-speech' ? 'Tap to speak' : 'Tap to record')
              }
              labelHindi={
                isListening 
                  ? 'रोकने के लिए दबाएं' 
                  : isTranscribing 
                    ? 'ट्रांसक्राइब कर रही हूं...' 
                    : (sttMode === 'web-speech' ? 'बोलने के लिए दबाएं' : 'रिकॉर्ड करने के लिए दबाएं')
              }
            />
            {/* Text input toggle hint */}
            {!inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputMode('text')
                  inputRef.current?.focus()
                }}
                className="mt-1 text-xs text-pink-600 hover:text-pink-700 underline"
              >
                {language === 'hi' ? 'या टाइप करें' : 'or type'}
              </button>
            )}
          </div>
        )}

        {/* Hint */}
        <div className="text-center text-[10px] text-gray-400 mt-2">
          {recordingState.error || speechState.error ? (
            <p className="text-red-500">{recordingState.error || speechState.error}</p>
          ) : (
            <p>
              {language === 'hi' ? '🎤 बोलें या 💬 टाइप करें' : '🎤 Speak or 💬 type'}
              {sttMode === 'whisper' && (
                <span className="ml-2 text-pink-400">(Whisper mode)</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

