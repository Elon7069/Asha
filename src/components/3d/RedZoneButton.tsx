'use client'

import * as React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float, Text } from '@react-three/drei'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as THREE from 'three'

interface PulsingSphereProps {
  isPressed: boolean
  pressProgress: number
}

function PulsingSphere({ isPressed, pressProgress }: PulsingSphereProps) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  const materialRef = React.useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
      
      // Scale based on press progress
      const scale = 1 + (pressProgress / 100) * 0.3
      meshRef.current.scale.setScalar(scale)
    }
  })

  // Color transition from red to darker red as pressed
  const baseColor = isPressed ? '#DC2626' : '#EF4444'
  const emissiveIntensity = isPressed ? 0.5 + (pressProgress / 100) * 0.5 : 0.3

  return (
    <Float speed={isPressed ? 8 : 2} rotationIntensity={isPressed ? 0.5 : 0.2} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          ref={materialRef}
          color={baseColor}
          attach="material"
          distort={isPressed ? 0.4 : 0.2}
          speed={isPressed ? 5 : 2}
          roughness={0.2}
          metalness={0.1}
          emissive={baseColor}
          emissiveIntensity={emissiveIntensity}
        />
      </Sphere>
      
      {/* SOS Text */}
      <Text
        position={[0, 0, 1.1]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        SOS
      </Text>
    </Float>
  )
}

interface RedZoneButton3DProps {
  onActivate: () => void
  className?: string
  disabled?: boolean
}

export function RedZoneButton3D({ 
  onActivate, 
  className,
  disabled = false 
}: RedZoneButton3DProps) {
  const [isPressed, setIsPressed] = React.useState(false)
  const [pressProgress, setPressProgress] = React.useState(0)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const progressRef = React.useRef<NodeJS.Timeout | null>(null)

  const handlePressStart = () => {
    if (disabled) return
    setIsPressed(true)
    
    // Progress timer - fills over 2 seconds
    let progress = 0
    progressRef.current = setInterval(() => {
      progress += 5
      setPressProgress(progress)
      
      if (progress >= 100) {
        if (progressRef.current) clearInterval(progressRef.current)
        triggerEmergency()
      }
    }, 100)
  }

  const handlePressEnd = () => {
    setIsPressed(false)
    setPressProgress(0)
    
    if (progressRef.current) {
      clearInterval(progressRef.current)
      progressRef.current = null
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const triggerEmergency = () => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }
    
    onActivate()
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className={cn('relative', className)}>
      {/* 3D Canvas */}
      <div 
        className="w-48 h-48 cursor-pointer select-none"
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onPointerCancel={handlePressEnd}
      >
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6b6b" />
          <PulsingSphere isPressed={isPressed} pressProgress={pressProgress} />
        </Canvas>
      </div>

      {/* Progress ring */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#FEE2E2"
          strokeWidth="4"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#EF4444"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - pressProgress / 100)}`}
          transform="rotate(-90 50 50)"
          className="transition-all duration-100"
        />
      </svg>

      {/* Instructions */}
      <div className="text-center mt-4">
        <p className="text-red-600 font-semibold">
          {isPressed ? 'Keep holding...' : 'Long press for emergency'}
        </p>
        <p className="text-red-500 text-sm font-hindi">
          {isPressed ? 'दबाए रखें...' : 'इमरजेंसी के लिए दबाए रखें'}
        </p>
      </div>
    </div>
  )
}

// Simpler 2D fallback for low-end devices
interface RedZoneButton2DProps {
  onActivate: () => void
  className?: string
  disabled?: boolean
}

export function RedZoneButton2D({ 
  onActivate, 
  className,
  disabled = false 
}: RedZoneButton2DProps) {
  const [isPressed, setIsPressed] = React.useState(false)
  const [pressProgress, setPressProgress] = React.useState(0)
  const progressRef = React.useRef<NodeJS.Timeout | null>(null)

  const handlePressStart = () => {
    if (disabled) return
    setIsPressed(true)
    
    let progress = 0
    progressRef.current = setInterval(() => {
      progress += 5
      setPressProgress(progress)
      
      if (progress >= 100) {
        if (progressRef.current) clearInterval(progressRef.current)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200])
        }
        onActivate()
      }
    }, 100)
  }

  const handlePressEnd = () => {
    setIsPressed(false)
    setPressProgress(0)
    if (progressRef.current) {
      clearInterval(progressRef.current)
      progressRef.current = null
    }
  }

  React.useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <motion.button
        type="button"
        disabled={disabled}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onPointerCancel={handlePressEnd}
        className={cn(
          'relative w-40 h-40 rounded-full',
          'bg-gradient-to-br from-red-400 to-red-600',
          'shadow-xl shadow-red-300/50',
          'flex items-center justify-center',
          'transition-transform duration-200',
          isPressed && 'scale-95',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        whileTap={{ scale: 0.95 }}
      >
        {/* Progress overlay */}
        <div 
          className="absolute inset-2 rounded-full bg-red-700/50"
          style={{
            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(2 * Math.PI * pressProgress / 100)}% ${50 - 50 * Math.cos(2 * Math.PI * pressProgress / 100)}%, 50% 50%)`
          }}
        />
        
        {/* SOS text */}
        <span className="relative z-10 text-white text-3xl font-bold">
          SOS
        </span>
        
        {/* Pulse rings */}
        {isPressed && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25" />
            <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-20" />
          </>
        )}
      </motion.button>

      <div className="text-center mt-4">
        <p className="text-red-600 font-semibold">
          {isPressed ? `${Math.round(pressProgress)}%` : 'Long press for emergency'}
        </p>
        <p className="text-red-500 text-sm font-hindi">
          {isPressed ? 'दबाए रखें...' : 'इमरजेंसी के लिए दबाए रखें'}
        </p>
      </div>
    </div>
  )
}

