'use client'

import { useState, useRef, useCallback } from 'react'

interface UseWhisperSTTReturn {
  isProcessing: boolean
  transcript: string
  error: string | null
  processAudio: (audioBlob: Blob) => Promise<void>
  isSupported: boolean
}

export function useWhisperSTT(): UseWhisperSTTReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported] = useState(true) // Transformers.js works in all modern browsers

  const processAudio = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Convert blob to audio buffer for processing
      const arrayBuffer = await audioBlob.arrayBuffer()
      
      // Create FormData for API request
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      
      // Send to our API endpoint that uses Whisper
      const response = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      setTranscript(result.transcript || '')
    } catch (err) {
      console.error('Whisper STT error:', err)
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio')
      setTranscript('')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    isProcessing,
    transcript,
    error,
    processAudio,
    isSupported,
  }
}