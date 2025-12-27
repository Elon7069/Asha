'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  BookOpen,
  Heart,
  Apple,
  Brain,
  Calendar,
  Droplets,
  Shield,
  Search,
  CheckCircle2,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { AudioLesson, AudioLessonCategory } from '@/types'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { useRouter } from 'next/navigation'

type LessonCategory = AudioLessonCategory

const categoryIcons: Record<LessonCategory, typeof Play> = {
  menstrual_health: Calendar,
  pregnancy: Heart,
  nutrition: Apple,
  mental_health: Brain,
  puberty: BookOpen,
  hygiene: Droplets,
  danger_signs: Shield
}

const categoryLabels: Record<LessonCategory, { en: string; hi: string }> = {
  menstrual_health: { en: 'Menstrual Health', hi: 'माहवारी स्वास्थ्य' },
  pregnancy: { en: 'Pregnancy', hi: 'गर्भावस्था' },
  nutrition: { en: 'Nutrition', hi: 'पोषण' },
  mental_health: { en: 'Mental Health', hi: 'मानसिक स्वास्थ्य' },
  puberty: { en: 'Puberty', hi: 'यौवन' },
  hygiene: { en: 'Hygiene', hi: 'स्वच्छता' },
  danger_signs: { en: 'Danger Signs', hi: 'खतरे के संकेत' }
}

interface LessonProgress {
  lesson_id: string
  listened: boolean
  listen_count: number
  completion_percentage: number
  last_listened_at: string | null
}

function LearnPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [lessons, setLessons] = React.useState<AudioLesson[]>([])
  const [progress, setProgress] = React.useState<Record<string, LessonProgress>>({})
  const [selectedCategory, setSelectedCategory] = React.useState<LessonCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [playingLesson, setPlayingLesson] = React.useState<string | null>(null)
  const [audioElement, setAudioElement] = React.useState<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch lessons
  React.useEffect(() => {
    async function fetchLessons() {
      try {
        setLoading(true)
        setError(null)
        const supabase = getSupabaseClient()
        const { data, error: fetchError } = await supabase
          .from('audio_lessons')
          .select('*')
          .eq('is_active', true)
          .order('published_date', { ascending: false })

        if (fetchError) throw fetchError

        if (data) {
          setLessons(data as AudioLesson[])
        }
      } catch (err) {
        console.error('Error fetching lessons:', err)
        setError('Failed to load lessons. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  // Fetch user progress
  React.useEffect(() => {
    async function fetchProgress() {
      if (!user) return

      try {
        const supabase = getSupabaseClient()
        
        // Get user's internal id
        const { data: userRecord } = await supabase
          .from('asha_users')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle()

        if (userRecord) {
          const { data: progressData } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, listened, listen_count, completion_percentage, last_listened_at')
            .eq('user_id', userRecord.id)

          if (progressData) {
            const progressMap: Record<string, LessonProgress> = {}
            progressData.forEach((p) => {
              progressMap[p.lesson_id] = {
                lesson_id: p.lesson_id,
                listened: p.listened,
                listen_count: p.listen_count,
                completion_percentage: p.completion_percentage,
                last_listened_at: p.last_listened_at
              }
            })
            setProgress(progressMap)
          }
        }
      } catch (err) {
        console.error('Error fetching progress:', err)
      }
    }

    fetchProgress()
  }, [user])

  // Audio playback handling
  React.useEffect(() => {
    if (!audioElement) return

    const updateTime = () => setCurrentTime(audioElement.currentTime)
    const updateDuration = () => setDuration(audioElement.duration)

    audioElement.addEventListener('timeupdate', updateTime)
    audioElement.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime)
      audioElement.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [audioElement])

  const handlePlay = async (lessonId: string, audioUrl: string) => {
    try {
      if (playingLesson === lessonId && audioElement) {
        // Pause if already playing
        audioElement.pause()
        setPlayingLesson(null)
        setAudioElement(null)
        setCurrentTime(0)
        setDuration(0)
      } else {
        // Stop current audio if any
        if (audioElement) {
          audioElement.pause()
          audioElement.currentTime = 0
        }

        // Play new audio
        const audio = new Audio(audioUrl)
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration)
        })
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime)
        })
        
        await audio.play()
        setAudioElement(audio)
        setPlayingLesson(lessonId)

        audio.addEventListener('ended', () => {
          setPlayingLesson(null)
          setAudioElement(null)
          setCurrentTime(0)
          setDuration(0)
          trackLessonProgress(lessonId, true)
        })

        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e)
          setError('Failed to play audio. Please check your connection.')
          setPlayingLesson(null)
          setAudioElement(null)
        })
      }
    } catch (err) {
      console.error('Error playing audio:', err)
      setError('Failed to play audio. Please try again.')
    }
  }

  const trackLessonProgress = async (lessonId: string, completed: boolean) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Get user's internal id
      const { data: userRecord } = await supabase
        .from('asha_users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (userRecord) {
        const existingProgress = progress[lessonId]
        const newListenCount = (existingProgress?.listen_count || 0) + 1

        const { data: updatedProgress } = await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: userRecord.id,
            lesson_id: lessonId,
            listened: completed,
            listen_count: newListenCount,
            last_listened_at: new Date().toISOString(),
            completion_percentage: completed ? 100 : 0
          })
          .select()
          .single()

        if (updatedProgress) {
          setProgress((prev) => ({
            ...prev,
            [lessonId]: {
              lesson_id: lessonId,
              listened: updatedProgress.listened,
              listen_count: updatedProgress.listen_count,
              completion_percentage: updatedProgress.completion_percentage,
              last_listened_at: updatedProgress.last_listened_at
            }
          }))
        }
      }
    } catch (error) {
      console.error('Error tracking lesson progress:', error)
    }
  }

  // Filter lessons by category and search
  const filteredLessons = React.useMemo(() => {
    let filtered = lessons

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(l => l.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(query) ||
        l.title_hindi.includes(query) ||
        (l.description_hindi && l.description_hindi.toLowerCase().includes(query)) ||
        (l.description && l.description.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [lessons, selectedCategory, searchQuery])

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (!duration) return 0
    return (currentTime / duration) * 100
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learn with Audio</h1>
          <p className="text-pink-600 font-hindi text-lg mb-1">ऑडियो से सीखें</p>
          <p className="text-gray-600 text-sm">
            Short 30-45 second lessons you can listen to anytime
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search lessons... / पाठ खोजें..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Category Tabs - Improved responsive design */}
      <div className="overflow-x-auto -mx-4 px-4">
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as LessonCategory | 'all')}>
          <TabsList className="w-full grid grid-cols-4 md:grid-cols-8 h-auto">
            <TabsTrigger value="all" className="text-xs md:text-sm whitespace-nowrap">
              All
            </TabsTrigger>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs md:text-sm whitespace-nowrap">
                <span className="hidden lg:inline">{label.en}</span>
                <span className="lg:hidden">{label.hi}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Lessons Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading lessons...</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchQuery ? 'No lessons found matching your search.' : 'No lessons available in this category yet.'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => {
            const Icon = categoryIcons[lesson.category]
            const isPlaying = playingLesson === lesson.id
            const lessonProgress = progress[lesson.id]
            const isCompleted = lessonProgress?.listened || false

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`border-pink-100 hover:shadow-lg transition-all duration-200 h-full flex flex-col ${
                  isCompleted ? 'bg-green-50/50' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-1 line-clamp-2">{lesson.title_hindi}</CardTitle>
                          <p className="text-sm text-gray-500 line-clamp-1">{lesson.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {lesson.is_medically_verified && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                        )}
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                      {lesson.description_hindi || lesson.description || 'No description available.'}
                    </p>
                    
                    {/* Progress indicator for playing audio */}
                    {isPlaying && duration > 0 && (
                      <div className="space-y-1">
                        <Progress value={getProgressPercentage()} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatDuration(currentTime)}</span>
                          <span>{formatDuration(duration)}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{formatDuration(lesson.duration_seconds)}</span>
                        {lessonProgress && lessonProgress.listen_count > 0 && (
                          <span>• {lessonProgress.listen_count}x</span>
                        )}
                      </div>
                      {lesson.difficulty_level && (
                        <Badge variant="outline" className="text-xs">
                          {lesson.difficulty_level}
                        </Badge>
                      )}
                    </div>

                    <Button
                      onClick={() => handlePlay(lesson.id, lesson.audio_url_hindi)}
                      className={`w-full ${
                        isPlaying 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-pink-500 hover:bg-pink-600'
                      } text-white`}
                      size="lg"
                      disabled={!lesson.audio_url_hindi}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          {isCompleted ? 'Play Again' : 'Play Audio'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Stats Summary */}
      {!loading && user && Object.keys(progress).length > 0 && (
        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lessons Completed</p>
                <p className="text-2xl font-bold text-pink-600">
                  {Object.values(progress).filter(p => p.listened).length} / {lessons.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Listen Time</p>
                <p className="text-2xl font-bold text-pink-600">
                  {Object.values(progress).reduce((sum, p) => sum + p.listen_count, 0)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function LearnPage() {
  return (
    <AuthenticatedLayout>
      <LearnPageContent />
    </AuthenticatedLayout>
  )
}

