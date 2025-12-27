'use client'

import { useState, useCallback } from 'react'

interface UseWhisperSTTReturn {
  isProcessing: boolean
  transcript: string
  error: string | null
  processAudio: (audioBlob: Blob, language?: string) => Promise<void>
  resetTranscript: () => void
  isSupported: boolean
}

export function useWhisperSTT(): UseWhisperSTTReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported] = useState(true) // Transformers.js works in all modern browsers

  const processAudio = useCallback(async (audioBlob: Blob, language?: string) => {
    setIsProcessing(true)
    setError(null)
    setTranscript('') // Clear previous transcript

    try {
      // Create FormData for API request
      const formData = new FormData()
      
      // Determine file extension based on blob type
      const mimeType = audioBlob.type || 'audio/webm'
      let extension = 'webm'
      if (mimeType.includes('mp4')) extension = 'mp4'
      else if (mimeType.includes('wav')) extension = 'wav'
      else if (mimeType.includes('ogg')) extension = 'ogg'
      
      formData.append('audio', audioBlob, `recording.${extension}`)
      
      // Add language if provided
      if (language) {
        formData.append('language', language)
      }
      
      console.log('Sending audio to Whisper API...', { size: audioBlob.size, type: mimeType, language })
      
      // Send to our API endpoint that uses Whisper
      const response = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
            if (errorData.details && process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.error('Error details:', errorData.details)
            }
          } else {
            // If not JSON, try to get text
            const text = await response.text()
            if (text) {
              errorMessage = text.substring(0, 200) // Limit length
            }
          }
        } catch (parseError) {
          // eslint-disable-next-line no-console
          console.error('Failed to parse error response:', parseError)
          // Use default error message
        }
        // eslint-disable-next-line no-throw-literal
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      console.log('Whisper transcription result:', result)
      setTranscript(result.transcript || '')
    } catch (err) {
      console.error('Whisper STT error:', err)
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio')
      setTranscript('')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isProcessing,
    transcript,
    error,
    processAudio,
    resetTranscript,
    isSupported,
  }
}