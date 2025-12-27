'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { LANGUAGES, type LanguageCode } from '@/types'
import { Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LanguageSelectorProps {
  value: LanguageCode
  onChange: (value: LanguageCode) => void
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-9 text-sm',
  md: 'h-11 text-base',
  lg: 'h-14 text-lg',
}

export function LanguageSelector({
  value,
  onChange,
  className,
  showIcon = true,
  size = 'md',
}: LanguageSelectorProps) {
  const selectedLanguage = LANGUAGES.find(l => l.code === value)

  return (
    <Select value={value} onValueChange={(v) => onChange(v as LanguageCode)}>
      <SelectTrigger 
        className={cn(
          'w-auto min-w-[140px] gap-2 bg-white border-pink-200',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <Globe className="w-4 h-4 text-pink-500" />}
        <SelectValue>
          {selectedLanguage?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
            className="text-base py-3"
          >
            <span className="font-hindi">{lang.name}</span>
            <span className="text-gray-500 ml-2 text-sm">({lang.nameEn})</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Simple toggle for Hindi/English only
interface LanguageToggleProps {
  value: 'hi' | 'en'
  onChange: (value: 'hi' | 'en') => void
  className?: string
}

export function LanguageToggle({ value, onChange, className }: LanguageToggleProps) {
  return (
    <div className={cn('flex rounded-full bg-pink-100 p-1', className)}>
      <button
        type="button"
        onClick={() => onChange('hi')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-all',
          value === 'hi' 
            ? 'bg-pink-500 text-white shadow-sm' 
            : 'text-gray-600 hover:text-pink-600'
        )}
      >
        हिंदी
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-all',
          value === 'en' 
            ? 'bg-pink-500 text-white shadow-sm' 
            : 'text-gray-600 hover:text-pink-600'
        )}
      >
        English
      </button>
    </div>
  )
}

