'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Mic, 
  BookOpen,
  ArrowDown,
  Shield,
  Smartphone,
  Globe,
  Stethoscope,
  Calendar,
  Baby,
  AlertTriangle,
  Apple,
  Users2,
  CheckCircle2,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from '@/components/shared/LanguageSelector'
import HeroBackground3D from '@/components/3d/HeroBackground3D'

// Scroll Progress Indicator
function ScrollProgressIndicator() {
  const [scrollProgress, setScrollProgress] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50 pointer-events-none">
      <div 
        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300 origin-left"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}

// Navigation Bar
function NavigationBar() {
  const [language, setLanguage] = React.useState<'hi' | 'en'>('en')

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm pt-1">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">ASHA AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('features')}
            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection('testimonials')}
            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
          >
            Stories
          </button>
          <LanguageToggle value={language} onChange={setLanguage} />
        </div>

        <Link href="/profile-setup">
          <Button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  )
}


// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <HeroBackground3D />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-primary-200 shadow-lg mb-8"
        >
          <Heart className="w-5 h-5 text-primary-500" fill="#FF69B4" />
          <span className="text-sm font-semibold text-gray-700">
            Voice-First Health Companion
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
        >
          Your Trusted
          <br />
          <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
            Health Companion
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3 mb-12"
        >
          <p className="text-xl md:text-2xl text-gray-700 font-medium">
            Maternal and menstrual health support for every woman.
          </p>
          <p className="text-lg md:text-xl text-primary-600 font-semibold" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
            हर महिला के लिए मातृ और मासिक स्वास्थ्य सहायता।
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary CTA */}
          <Link href="/profile-setup">
            <button className="group relative px-10 py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:-translate-y-1 min-w-[280px]">
              <div className="flex items-center justify-center gap-3">
                <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div>Start Speaking</div>
                  <div className="text-sm font-normal opacity-90" style={{ fontFamily: 'Noto Sans Devanagari' }}>
                    बोलना शुरू करें
                  </div>
                </div>
              </div>
              {/* Animated pulse ring */}
              <span className="absolute inset-0 rounded-2xl bg-primary-500 animate-ping opacity-20" />
            </button>
          </Link>

          {/* Secondary CTA */}
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="group px-8 py-5 bg-white/80 backdrop-blur-xl border-2 border-primary-200 text-primary-600 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-400 min-w-[200px]"
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              Learn More
            </div>
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16"
        >
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-sm font-medium">Discover more</span>
            <ArrowDown className="w-6 h-6 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Trust Indicators Section
function TrustSection() {
  const trustBadges = [
    { icon: Stethoscope, label: "Medically Verified", value: "100%", emoji: "🏥" },
    { icon: Shield, label: "Privacy First", value: "Encrypted", emoji: "🔒" },
    { icon: Smartphone, label: "Offline Support", value: "Always On", emoji: "📱" },
    { icon: Globe, label: "Multi-Language", value: "Hindi + 5", emoji: "🌐" },
  ]

  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-primary-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Healthcare Professionals
          </h2>
          <p className="text-xl text-gray-600">
            Built with ASHA workers, verified by doctors
          </p>
        </motion.div>

        {/* Trust badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustBadges.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-5xl mb-3">{item.emoji}</div>
              <div className="text-sm font-semibold text-primary-600 mb-1">
                {item.value}
              </div>
              <div className="text-sm text-gray-700">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
const features = [
  {
      title: "Voice-First Interface",
      titleHindi: "आवाज़-प्रथम इंटरफ़ेस",
      description: "No typing needed. Just speak naturally in Hindi or your local language.",
      icon: "🎙️",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "Period Tracking",
      titleHindi: "मासिक धर्म ट्रैकिंग",
      description: "Smart predictions for your cycle, fertility window, and health tips.",
      icon: "📅",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Pregnancy Care",
      titleHindi: "गर्भावस्था देखभाल",
      description: "Week-by-week guidance, danger sign alerts, and nutrition advice.",
      icon: "🤰",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Emergency SOS",
      titleHindi: "आपातकालीन एसओएस",
      description: "One-tap alert to your ASHA worker and family in emergencies.",
      icon: "🚨",
      gradient: "from-red-500 to-orange-500",
    },
    {
      title: "Nutrition Guide",
      titleHindi: "पोषण मार्गदर्शिका",
      description: "Local food recommendations rich in iron and essential nutrients.",
      icon: "🥗",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "ASHA Connect",
      titleHindi: "आशा कनेक्ट",
      description: "Direct connection with your local ASHA worker for support.",
      icon: "🤝",
      gradient: "from-indigo-500 to-purple-500",
    },
  ]

  return (
    <section id="features" className="relative py-24 bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive health support designed specifically for rural Indian women
          </p>
        </motion.div>

        {/* 3D Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <div className="relative h-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* Icon */}
                <div className="relative mb-6">
                  <div className="text-7xl group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm font-semibold text-primary-600 mb-4" style={{ fontFamily: 'Noto Sans Devanagari' }}>
                    {feature.titleHindi}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative element */}
                <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${feature.gradient} opacity-5 rounded-tl-full`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Press & Speak",
      titleHindi: "दबाएं और बोलें",
      description: "Tap the microphone and speak your question or concern in Hindi",
      icon: "🎙️",
    },
    {
      step: "2",
      title: "AI Understanding",
      titleHindi: "एआई समझ",
      description: "Asha Didi understands your health query using advanced AI",
      icon: "🤖",
    },
    {
      step: "3",
      title: "Get Guidance",
      titleHindi: "मार्गदर्शन प्राप्त करें",
      description: "Receive personalized health advice in simple language",
      icon: "💬",
    },
    {
      step: "4",
      title: "Track Progress",
      titleHindi: "प्रगति ट्रैक करें",
      description: "Monitor your health journey with easy-to-understand insights",
      icon: "📊",
    },
  ]

  return (
    <section id="how-it-works" className="relative py-24 bg-gradient-to-b from-white to-primary-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Four simple steps to better health
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-600 -translate-y-1/2" />

          {/* Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                {/* Step number circle */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/50 z-10 relative">
                      <span className="text-4xl font-bold text-white">
                        {step.step}
                      </span>
                    </div>
                    {/* Pulse animation */}
                    <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20" />
                  </div>
                </div>

                {/* Icon */}
                <div className="text-center mb-4">
                  <span className="text-6xl">{step.icon}</span>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm font-semibold text-primary-600 mb-3" style={{ fontFamily: 'Noto Sans Devanagari' }}>
                    {step.titleHindi}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sunita Devi",
      location: "Sitapur, UP",
      role: "Expecting Mother",
      quote: "ASHA AI helped me understand my pregnancy week by week. I feel more confident now.",
      quoteHindi: "आशा एआई ने मुझे मेरी गर्भावस्था को सप्ताह दर सप्ताह समझने में मदद की।",
      avatar: "👩",
      rating: 5,
    },
    {
      name: "Radha Kumari",
      location: "Banda, UP",
      role: "ASHA Worker",
      quote: "Voice logging saves me so much time. I can now help more women in my village.",
      quoteHindi: "आवाज़ लॉगिंग से मेरा बहुत समय बचता है। अब मैं अपने गाँव में अधिक महिलाओं की मदद कर सकती हूँ।",
      avatar: "👩‍⚕️",
      rating: 5,
    },
    {
      name: "Meera Sharma",
      location: "Lucknow, UP",
      role: "New Mother",
      quote: "The nutrition advice with local foods was so helpful. My hemoglobin improved!",
      quoteHindi: "स्थानीय खाद्य पदार्थों के साथ पोषण सलाह बहुत मददगार थी।",
      avatar: "👩‍🍼",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="relative py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600">
            Real stories from real women
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-white to-primary-50/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-primary-100"
            >
              {/* Avatar */}
              <div className="text-6xl mb-4">{testimonial.avatar}</div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 text-lg mb-3 italic leading-relaxed">
                "{testimonial.quote}"
              </p>
              <p className="text-primary-600 text-sm mb-6 italic" style={{ fontFamily: 'Noto Sans Devanagari' }}>
                "{testimonial.quoteHindi}"
              </p>

              {/* Author */}
              <div className="border-t border-primary-200 pt-4">
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
                <div className="text-sm text-primary-600">📍 {testimonial.location}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Final CTA Section
function FinalCTASection() {
  return (
    <section className="relative py-32 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 overflow-hidden">
      {/* Simplified background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Start Your
            <br />
            Health Journey?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-4">
            Join thousands of women taking control of their health
          </p>
          <p className="text-lg text-white/80 mb-12" style={{ fontFamily: 'Noto Sans Devanagari' }}>
            अपनी स्वास्थ्य यात्रा आज ही शुरू करें
          </p>

          <Link href="/profile-setup">
            <button className="group px-12 py-6 bg-white text-primary-600 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center gap-3">
                <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
                Get Started Free
              </div>
            </button>
          </Link>

          <p className="mt-6 text-white/70 text-sm">
            ✓ No credit card required  ✓ Works offline  ✓ 100% private
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-primary-100 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-gray-800">ASHA AI</span>
          </div>
          
          <p className="text-sm text-gray-500">
            Made with ❤️ for women's health
          </p>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-primary-600">Privacy</Link>
            <Link href="/terms" className="hover:text-primary-600">Terms</Link>
            <Link href="/contact" className="hover:text-primary-600">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Landing Page Component
export default function LandingPage() {
  // Always show landing page - no auto-redirect
  // Users can manually navigate to their dashboards after selecting a role
  return (
    <div className="min-h-screen bg-white">
      <ScrollProgressIndicator />
      <NavigationBar />
      <main>
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  )
}
