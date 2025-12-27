'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { WifiOff, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OfflineIndicatorProps {
  className?: string
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = React.useState(true)
  const [showIndicator, setShowIndicator] = React.useState(false)

  React.useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      // Hide after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Always show when offline
  React.useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true)
    }
  }, [isOnline])

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'fixed top-4 left-1/2 -translate-x-1/2 z-50',
            'px-4 py-2 rounded-full shadow-lg',
            'flex items-center gap-2 text-sm font-medium',
            isOnline 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200',
            className
          )}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Back online</span>
              <span className="font-hindi">ऑनलाइन</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>No internet</span>
              <span className="font-hindi">इंटरनेट नहीं</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to check online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

