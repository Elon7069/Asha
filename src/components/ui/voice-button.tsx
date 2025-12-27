'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Loader2, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceButtonProps {
  isRecording: boolean
  isProcessing?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'emergency'
  onPress: () => void
  onRelease?: () => void
  className?: string
  label?: string
  labelHindi?: string
}

const sizeClasses = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

const iconSizes = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
}

export function VoiceButton({
  isRecording,
  isProcessing = false,
  disabled = false,
  size = 'lg',
  variant = 'default',
  onPress,
  onRelease,
  className,
  label = 'Tap to speak',
  labelHindi = 'बोलने के लिए दबाएं',
}: VoiceButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const [isPressed, setIsPressed] = React.useState(false)

  const handlePointerDown = () => {
    if (disabled || isProcessing) return
    setIsPressed(true)
    onPress()
  }

  const handlePointerUp = () => {
    if (disabled || isProcessing) return
    setIsPressed(false)
    onRelease?.()
  }

  const handlePointerLeave = () => {
    if (isPressed) {
      setIsPressed(false)
      onRelease?.()
    }
  }

  const baseColor = variant === 'emergency' ? 'bg-red-500' : 'bg-pink-500'
  const hoverColor = variant === 'emergency' ? 'hover:bg-red-600' : 'hover:bg-pink-600'
  const ringColor = variant === 'emergency' ? 'ring-red-300' : 'ring-pink-300'

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        ref={buttonRef}
        type="button"
        disabled={disabled || isProcessing}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
        className={cn(
          'relative rounded-full flex items-center justify-center transition-all duration-200',
          'shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-4',
          sizeClasses[size],
          baseColor,
          hoverColor,
          ringColor,
          isRecording && 'voice-pulse',
          className
        )}
        whileTap={{ scale: 0.95 }}
        animate={isRecording ? { 
          boxShadow: [
            '0 0 0 0 rgba(255, 105, 180, 0.4)',
            '0 0 0 20px rgba(255, 105, 180, 0)',
          ]
        } : {}}
        transition={isRecording ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut'
        } : {}}
      >
        {/* Ripple effect when recording */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full bg-pink-400 opacity-30"
                initial={{ scale: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.span
                className="absolute inset-0 rounded-full bg-pink-400 opacity-20"
                initial={{ scale: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Icon */}
        <span className="relative z-10 text-white">
          {isProcessing ? (
            <Loader2 size={iconSizes[size]} className="animate-spin" />
          ) : isRecording ? (
            <Square size={iconSizes[size]} className="fill-current" />
          ) : disabled ? (
            <MicOff size={iconSizes[size]} />
          ) : (
            <Mic size={iconSizes[size]} />
          )}
        </span>
      </motion.button>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {isProcessing ? 'Processing...' : isRecording ? 'Recording...' : label}
        </p>
        <p className="text-xs text-gray-500 font-hindi">
          {isProcessing ? 'प्रोसेसिंग...' : isRecording ? 'रिकॉर्डिंग...' : labelHindi}
        </p>
      </div>
    </div>
  )
}

// Waveform visualization component
interface VoiceWaveformProps {
  isActive: boolean
  className?: string
  barCount?: number
}

export function VoiceWaveform({ 
  isActive, 
  className,
  barCount = 5 
}: VoiceWaveformProps) {
  return (
    <div className={cn('flex items-center justify-center gap-1 h-8', className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-pink-500 rounded-full"
          animate={isActive ? {
            height: [8, 24, 8],
          } : {
            height: 8
          }}
          transition={isActive ? {
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          } : {}}
        />
      ))}
    </div>
  )
}

// Recording timer display
interface RecordingTimerProps {
  duration: number
  className?: string
}

export function RecordingTimer({ duration, className }: RecordingTimerProps) {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <span className="font-mono text-lg font-medium text-gray-700">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

