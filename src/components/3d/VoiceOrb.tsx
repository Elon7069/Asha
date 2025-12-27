'use client'

import * as React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

interface AnimatedOrbProps {
  isActive: boolean
  isListening: boolean
  color?: string
}

function AnimatedOrb({ isActive, isListening, color = '#FF69B4' }: AnimatedOrbProps) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  const materialRef = React.useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.05
      meshRef.current.scale.setScalar(1 + breathe)
      
      // Rotation
      meshRef.current.rotation.y += isListening ? 0.02 : 0.005
    }
  })

  const distortAmount = isListening ? 0.5 : isActive ? 0.3 : 0.15
  const speed = isListening ? 8 : isActive ? 4 : 2
  const emissiveIntensity = isListening ? 0.6 : isActive ? 0.4 : 0.2

  return (
    <Float 
      speed={isListening ? 6 : 2} 
      rotationIntensity={isListening ? 1 : 0.3} 
      floatIntensity={isListening ? 1 : 0.5}
    >
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          ref={materialRef}
          color={color}
          attach="material"
          distort={distortAmount}
          speed={speed}
          roughness={0.2}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.9}
        />
      </Sphere>
    </Float>
  )
}

interface VoiceOrbProps {
  isActive?: boolean
  isListening?: boolean
  isSpeaking?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
}

export function VoiceOrb({
  isActive = false,
  isListening = false,
  isSpeaking = false,
  size = 'md',
  className,
}: VoiceOrbProps) {
  // Determine color based on state
  const color = isListening ? '#FF69B4' : isSpeaking ? '#10B981' : '#FFB3D6'

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ff69b4" />
        <AnimatedOrb 
          isActive={isActive || isSpeaking} 
          isListening={isListening} 
          color={color}
        />
      </Canvas>

      {/* Status indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
        <div className={cn(
          'w-3 h-3 rounded-full',
          isListening && 'bg-pink-500 animate-pulse',
          isSpeaking && 'bg-green-500 animate-pulse',
          !isListening && !isSpeaking && 'bg-gray-300'
        )} />
      </div>
    </div>
  )
}

// Simple 2D fallback orb
interface VoiceOrb2DProps {
  isActive?: boolean
  isListening?: boolean
  isSpeaking?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const size2DClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export function VoiceOrb2D({
  isActive = false,
  isListening = false,
  isSpeaking = false,
  size = 'md',
  className,
}: VoiceOrb2DProps) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <div 
        className={cn(
          'rounded-full transition-all duration-300',
          size2DClasses[size],
          isListening && 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg shadow-pink-300/50 animate-pulse',
          isSpeaking && 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-300/50 animate-pulse',
          !isListening && !isSpeaking && 'bg-gradient-to-br from-pink-200 to-pink-300'
        )}
      >
        {/* Inner glow */}
        <div className={cn(
          'absolute inset-2 rounded-full opacity-50',
          isListening && 'bg-pink-300',
          isSpeaking && 'bg-green-300',
          !isListening && !isSpeaking && 'bg-pink-100'
        )} />
        
        {/* Pulse rings when active */}
        {(isListening || isSpeaking) && (
          <>
            <span className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-25',
              isListening ? 'bg-pink-400' : 'bg-green-400'
            )} />
          </>
        )}
      </div>
    </div>
  )
}

