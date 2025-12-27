'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Mic, 
  Calendar, 
  Shield, 
  Users, 
  BookOpen,
  ArrowRight,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

const features = [
  {
    icon: Mic,
    title: 'Voice-First',
    titleHindi: 'आवाज़ से बात करें',
    description: 'No typing needed. Just speak.',
    descriptionHindi: 'टाइप करने की ज़रूरत नहीं। बस बोलें।',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Calendar,
    title: 'Period Tracker',
    titleHindi: 'पीरियड ट्रैकर',
    description: 'Track your cycle easily.',
    descriptionHindi: 'अपना साइकिल आसानी से ट्रैक करें।',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Heart,
    title: 'Pregnancy Care',
    titleHindi: 'गर्भावस्था देखभाल',
    description: 'Week-by-week guidance.',
    descriptionHindi: 'हफ्ते-दर-हफ्ते मार्गदर्शन।',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: Shield,
    title: 'Emergency Help',
    titleHindi: 'इमरजेंसी मदद',
    description: 'One tap SOS button.',
    descriptionHindi: 'एक टैप SOS बटन।',
    color: 'bg-orange-100 text-orange-600',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  // Redirect logged-in users to their respective dashboards
  React.useEffect(() => {
    if (!loading && user && profile) {
      switch (profile.role) {
        case 'asha_worker':
          router.push('/dashboard')
          break
        case 'ngo_partner':
          router.push('/ngo-dashboard')
          break
        case 'user':
          router.push('/user-dashboard')
          break
      }
    }
  }, [user, profile, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 mx-auto mb-2 flex items-center justify-center animate-spin">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
      </div>
    )
  }

  // Only show landing page if user is not logged in
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">ASHA AI</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-pink-600 hover:text-pink-700">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 text-sm font-medium mb-6">
                🌸 Voice-First Health Companion
              </span>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Your Trusted
                <span className="text-gradient-pink block">Health Companion</span>
          </h1>
              
              <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
                Maternal and menstrual health support for every woman.
              </p>
              <p className="text-lg text-pink-600 font-hindi mb-8 max-w-2xl mx-auto">
                हर महिला के लिए मातृ और मासिक स्वास्थ्य सहायता।
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6 rounded-full shadow-lg shadow-pink-300/50"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Speaking
                  <span className="ml-2 font-hindi">बोलना शुरू करें</span>
                </Button>
              </Link>
              
              <Link href="/learn">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-pink-300 text-pink-600 hover:bg-pink-50 text-lg px-8 py-6 rounded-full"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </Link>
            </motion.div>

            {/* Hero Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-pink-100 to-pink-200 overflow-hidden shadow-2xl shadow-pink-200/50 border border-pink-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 mx-auto mb-6 flex items-center justify-center shadow-lg">
                      <Mic className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-2xl font-semibold text-pink-700">
                      "Namaste! Main Asha Didi hoon"
                    </p>
                    <p className="text-lg text-pink-600 font-hindi mt-2">
                      "नमस्ते! मैं आशा दीदी हूं"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Everything You Need
            </h2>
            <p className="text-lg text-pink-600 font-hindi">
              आपकी ज़रूरत की हर चीज़
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-pink-100">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} mx-auto mb-4 flex items-center justify-center`}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-pink-600 font-hindi mb-2">
                      {feature.titleHindi}
                    </p>
                    <p className="text-sm text-gray-500">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-pink-500 to-rose-500 border-0 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center text-white">
              <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-2">
                Join Thousands of Women
              </h2>
              <p className="text-xl font-hindi mb-6 opacity-90">
                हज़ारों महिलाओं के साथ जुड़ें
              </p>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                Free, private, and designed for you. No typing needed - just speak.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button 
                    size="lg"
                    className="bg-white text-pink-600 hover:bg-pink-50 text-lg px-8 py-6 rounded-full"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <a href="tel:108">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-white/50 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full"
          >
                    <Phone className="w-5 h-5 mr-2" />
                    Emergency: 108
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-pink-100 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-semibold text-gray-800">ASHA AI</span>
            </div>
            
            <p className="text-sm text-gray-500">
              Made with ❤️ for women's health
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-pink-600">Privacy</Link>
              <Link href="/terms" className="hover:text-pink-600">Terms</Link>
              <Link href="/contact" className="hover:text-pink-600">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
