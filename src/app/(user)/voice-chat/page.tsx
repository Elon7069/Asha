'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  Send, 
  Volume2,
  VolumeX,
  Heart,
  Phone,
  AlertTriangle,
  Loader2,
  StopCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder'
import { useWhisperSTT } from '@/lib/hooks/useWhisperSTT'
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isEmergency?: boolean
}

export default function VoiceChatPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'नमस्ते! मैं आशा दीदी हूँ। आपकी स्वास्थ्य संबंधी मदद के लिए यहाँ हूँ। आप मुझसे कुछ भी पूछ सकती हैं। / Hello! I am ASHA Didi. I am here to help with your health concerns. You can ask me anything.',
      timestamp: new Date(),
    }
  ])
  const [inputMessage, setInputMessage] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSpeaking, setIsSpeaking] = React.useState(false)

  // Voice hooks
  const { isRecording, startRecording, stopRecording, audioBlob, error: recordingError } = useVoiceRecorder()
  const { isProcessing, transcript, error: sttError, processAudio } = useWhisperSTT()
  const { speak, stop: stopSpeaking, isSupported: ttsSupported } = useTextToSpeech()

  // Process recorded audio
  React.useEffect(() => {
    if (audioBlob) {
      processAudio(audioBlob)
    }
  }, [audioBlob, processAudio])

  // Handle transcript
  React.useEffect(() => {
    if (transcript) {
      setInputMessage(transcript)
    }
  }, [transcript])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: 'voice_chat',
          messages: messages.slice(-5) // Send last 5 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const result = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.message,
        timestamp: new Date(),
        isEmergency: result.isEmergency,
      }

      setMessages(prev => [...prev, assistantMessage])

      // Auto-speak the response if TTS is supported
      if (ttsSupported && result.message) {
        setIsSpeaking(true)
        speak(result.message, {
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'माफ़ करें, कुछ तकनीकी समस्या है। कृपया दोबारा कोशिश करें। / Sorry, there was a technical issue. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleSpeakToggle = (message: string) => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      speak(message, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      })
    }
  }

  const handleEmergency = () => {
    // This would trigger the emergency flow
    window.location.href = '/red-zone/activate'
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-pink-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">ASHA Didi</h1>
              <p className="text-sm text-gray-500">आपकी स्वास्थ्य साथी</p>
            </div>
          </div>
          <Button 
            onClick={handleEmergency}
            className="bg-red-500 hover:bg-red-600 text-white"
            size="sm"
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Emergency
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.isEmergency && (
                    <Alert className="mb-2 border-red-200 bg-red-50">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <AlertDescription className="text-red-700">
                        Emergency detected! Please seek immediate medical attention.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Card className={`${
                    message.role === 'user' 
                      ? 'bg-pink-500 text-white border-pink-500' 
                      : 'bg-white border-pink-100'
                  }`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <p className="text-sm flex-1">{message.content}</p>
                        {message.role === 'assistant' && ttsSupported && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeakToggle(message.content)}
                            className="h-6 w-6 p-0 hover:bg-pink-100"
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3 h-3" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="bg-gray-100 border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm text-gray-600">ASHA Didi is typing...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t border-pink-100 p-4">
        <div className="max-w-3xl mx-auto">
          {(recordingError || sttError) && (
            <Alert className="mb-3 border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {recordingError || sttError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <div className="relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your health question here... / यहाँ अपना सवाल लिखें..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputMessage)}
                  className="border-pink-200 focus:border-pink-400 pr-20"
                  disabled={isLoading || isRecording}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    onClick={handleVoiceToggle}
                    disabled={isLoading || isProcessing}
                    variant="ghost"
                    size="sm"
                    className={`p-2 ${
                      isRecording 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'hover:bg-pink-100 text-pink-600'
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isRecording ? (
                      <StopCircle className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => sendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isLoading}
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-pink-100 text-pink-600 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            {isRecording ? (
              <p className="text-red-500 animate-pulse font-medium text-center">● Recording... Tap mic to stop</p>
            ) : isProcessing ? (
              <p className="text-blue-500 text-center">Processing your voice...</p>
            ) : (
              <div className="text-center">
                <p>💬 Type your question or 🎤 use voice input</p>
                <p className="font-hindi">प्रश्न टाइप करें या आवाज़ का उपयोग करें</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}