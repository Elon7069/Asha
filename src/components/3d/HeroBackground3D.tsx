'use client'

import { motion } from 'framer-motion'

// Minimalistic light pink background with smooth animations
export default function HeroBackground3D() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Light pink gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white" />
      
      {/* Animated gradient orbs for subtle movement */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30"
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-0 w-80 h-80 bg-primary-50 rounded-full blur-3xl opacity-35"
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
