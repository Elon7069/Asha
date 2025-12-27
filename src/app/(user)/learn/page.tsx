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
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'

type LessonCategory = 'menstrual_health' | 'pregnancy' | 'nutrition' | 'mental_health' | 'puberty' | 'hygiene' | 'danger_signs'

interface AudioLesson {
  id: string
  title: string
  title_hindi: string
  category: LessonCategory
  description_hindi: string
  audio_url_hindi: string
  duration_seconds: number
  difficulty_level: string
  is_medically_verified: boolean
}

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

export default function LearnPage() {
  const { user } = useAuth()
  const [lessons, setLessons] = React.useState<AudioLesson[]>([])
  const [selectedCategory, setSelectedCategory] = React.useState<LessonCategory | 'all'>('all')
  const [playingLesson, setPlayingLesson] = React.useState<string | null>(null)
  const [audioElement, setAudioElement] = React.useState<HTMLAudioElement | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchLessons() {
      try {
        const supabase = getSupabaseClient()
        const { data } = await supabase
          .from('audio_lessons')
          .select('*')
          .eq('is_active', true)
          .order('published_date', { ascending: false })

        if (data) {
          setLessons(data as AudioLesson[])
        }
      } catch (error) {
        console.error('Error fetching lessons:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const handlePlay = (lessonId: string, audioUrl: string) => {
    if (playingLesson === lessonId && audioElement) {
      // Pause if already playing
      audioElement.pause()
      setPlayingLesson(null)
      setAudioElement(null)
    } else {
      // Stop current audio if any
      if (audioElement) {
        audioElement.pause()
      }

      // Play new audio
      const audio = new Audio(audioUrl)
      audio.play()
      setAudioElement(audio)
      setPlayingLesson(lessonId)

      audio.onended = () => {
        setPlayingLesson(null)
        setAudioElement(null)
        // Track completion
        trackLessonProgress(lessonId, true)
      }
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
        await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: userRecord.id,
            lesson_id: lessonId,
            listened: completed,
            listen_count: 1,
            last_listened_at: new Date().toISOString(),
            completion_percentage: completed ? 100 : 0
          })
      }
    } catch (error) {
      console.error('Error tracking lesson progress:', error)
    }
  }

  const filteredLessons = selectedCategory === 'all'
    ? lessons
    : lessons.filter(l => l.category === selectedCategory)

  const formatDuration = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learn with Audio</h1>
        <p className="text-pink-600 font-hindi">ऑडियो से सीखें</p>
        <p className="text-gray-600 text-sm mt-2">
          Short 30-45 second lessons you can listen to anytime
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as LessonCategory | 'all')}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              <span className="hidden md:inline">{label.en}</span>
              <span className="md:hidden">{label.hi}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Lessons Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading lessons...</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No lessons available in this category yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson) => {
            const Icon = categoryIcons[lesson.category]
            const isPlaying = playingLesson === lesson.id

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-pink-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{lesson.title_hindi}</CardTitle>
                          <p className="text-sm text-gray-500">{lesson.title}</p>
                        </div>
                      </div>
                      {lesson.is_medically_verified && (
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{lesson.description_hindi}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDuration(lesson.duration_seconds)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {lesson.difficulty_level}
                      </Badge>
                    </div>

                    <Button
                      onClick={() => handlePlay(lesson.id, lesson.audio_url_hindi)}
                      className={`w-full ${
                        isPlaying 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-pink-500 hover:bg-pink-600'
                      }`}
                      size="lg"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Play Audio
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
    </div>
  )
}

