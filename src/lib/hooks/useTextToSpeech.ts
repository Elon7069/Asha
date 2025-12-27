'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface TextToSpeechState {
  isSpeaking: boolean
  isPaused: boolean
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  currentVoice: SpeechSynthesisVoice | null
}

interface UseTextToSpeechReturn {
  state: TextToSpeechState
  speak: (text: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
  setVoice: (voice: SpeechSynthesisVoice) => void
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
}

export function useTextToSpeech(language: string = 'hi-IN'): UseTextToSpeechReturn {
  const [state, setState] = useState<TextToSpeechState>({
    isSpeaking: false,
    isPaused: false,
    isSupported: false,
    voices: [],
    currentVoice: null,
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const rateRef = useRef<number>(1.0)
  const pitchRef = useRef<number>(1.0)

  // Load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setState(prev => ({ ...prev, isSupported: true }))

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        
        // Find Hindi voices first, then fall back to English
        const hindiVoices = availableVoices.filter(v => 
          v.lang.startsWith('hi') || v.lang.includes('Hindi')
        )
        const englishVoices = availableVoices.filter(v => 
          v.lang.startsWith('en')
        )
        
        // Prefer female voices for Asha Didi
        const preferredVoice = hindiVoices.find(v => 
          v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('lekha')
        ) || hindiVoices[0] || englishVoices.find(v => 
          v.name.toLowerCase().includes('female')
        ) || englishVoices[0] || availableVoices[0]

        setState(prev => ({
          ...prev,
          voices: availableVoices,
          currentVoice: preferredVoice || null,
        }))
      }

      // Load voices (may be async in some browsers)
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Update voice when language changes
  useEffect(() => {
    if (state.voices.length > 0) {
      const langPrefix = language.split('-')[0]
      const matchingVoice = state.voices.find(v => 
        v.lang.startsWith(langPrefix)
      )
      if (matchingVoice) {
        setState(prev => ({ ...prev, currentVoice: matchingVoice }))
      }
    }
  }, [language, state.voices])

  const speak = useCallback((text: string) => {
    if (!state.isSupported || !text) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rateRef.current
    utterance.pitch = pitchRef.current
    
    if (state.currentVoice) {
      utterance.voice = state.currentVoice
    }

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true, isPaused: false }))
    }

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }))
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }))
    }

    utterance.onpause = () => {
      setState(prev => ({ ...prev, isPaused: true }))
    }

    utterance.onresume = () => {
      setState(prev => ({ ...prev, isPaused: false }))
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [state.isSupported, state.currentVoice])

  const pause = useCallback(() => {
    if (state.isSupported && state.isSpeaking) {
      window.speechSynthesis.pause()
    }
  }, [state.isSupported, state.isSpeaking])

  const resume = useCallback(() => {
    if (state.isSupported && state.isPaused) {
      window.speechSynthesis.resume()
    }
  }, [state.isSupported, state.isPaused])

  const stop = useCallback(() => {
    if (state.isSupported) {
      window.speechSynthesis.cancel()
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }))
    }
  }, [state.isSupported])

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setState(prev => ({ ...prev, currentVoice: voice }))
  }, [])

  const setRate = useCallback((rate: number) => {
    rateRef.current = Math.max(0.5, Math.min(2, rate))
  }, [])

  const setPitch = useCallback((pitch: number) => {
    pitchRef.current = Math.max(0.5, Math.min(2, pitch))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return {
    state,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setPitch,
  }
}

