'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, Phone, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface EmergencyBannerProps {
  show: boolean
  onClose?: () => void
  className?: string
}

export function EmergencyBanner({ show, onClose, className }: EmergencyBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={cn(
            'bg-gradient-to-r from-red-500 to-red-600 text-white',
            'px-4 py-3 shadow-lg',
            className
          )}
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-sm">
                  Emergency? Press Red Zone button
                </p>
                <p className="text-xs opacity-90 font-hindi">
                  इमरजेंसी? Red Zone बटन दबाएं
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="tel:108"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>108</span>
              </a>

              <Link
                href="/red-zone/activate"
                className="bg-white text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
              >
                Red Zone
              </Link>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close banner"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Floating emergency button for all pages
interface FloatingEmergencyButtonProps {
  className?: string
}

export function FloatingEmergencyButton({ className }: FloatingEmergencyButtonProps) {
  return (
    <Link
      href="/red-zone/activate"
      className={cn(
        'fixed bottom-24 right-4 z-40',
        'w-14 h-14 rounded-full',
        'bg-red-500 hover:bg-red-600 shadow-lg',
        'flex items-center justify-center',
        'text-white font-bold text-xs',
        'transition-all duration-200',
        'emergency-pulse',
        className
      )}
      aria-label="Emergency Red Zone"
    >
      <div className="text-center">
        <AlertTriangle className="w-6 h-6 mx-auto" />
        <span className="text-[10px]">SOS</span>
      </div>
    </Link>
  )
}

