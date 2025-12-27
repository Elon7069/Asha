'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Apple, 
  Pill, 
  Check,
  ChevronRight,
  Droplets,
  Leaf,
  Clock,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Local iron-rich foods database
const ironRichFoods = [
  { name: 'Spinach (Palak)', nameHindi: 'पालक', iron: '2.7mg/100g', emoji: '🥬', tip: 'Eat with lemon for better absorption' },
  { name: 'Jaggery (Gur)', nameHindi: 'गुड़', iron: '11mg/100g', emoji: '🍯', tip: 'Add to milk or eat after meals' },
  { name: 'Chickpeas (Chana)', nameHindi: 'चना', iron: '6.2mg/100g', emoji: '🫘', tip: 'Soak overnight and boil' },
  { name: 'Dates (Khajoor)', nameHindi: 'खजूर', iron: '1mg/piece', emoji: '🌴', tip: 'Eat 2-3 daily' },
  { name: 'Pomegranate (Anar)', nameHindi: 'अनार', iron: '0.3mg/100g', emoji: '🍎', tip: 'Drink fresh juice' },
  { name: 'Beetroot (Chukandar)', nameHindi: 'चुकंदर', iron: '0.8mg/100g', emoji: '🍠', tip: 'Add to salads or juice' },
]

const dailyTips = [
  {
    icon: Pill,
    title: 'Take IFA tablet after meals',
    titleHindi: 'खाने के बाद IFA गोली लें',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Droplets,
    title: 'Drink 8-10 glasses of water',
    titleHindi: '8-10 गिलास पानी पिएं',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Leaf,
    title: 'Eat green vegetables daily',
    titleHindi: 'रोज़ हरी सब्ज़ियां खाएं',
    color: 'bg-green-100 text-green-600',
  },
]

export default function NutritionPage() {
  const router = useRouter()
  const [ifaTaken, setIfaTaken] = React.useState(false)
  const [ifaStreak, setIfaStreak] = React.useState(5) // Mock streak

  const handleIfaTaken = () => {
    setIfaTaken(true)
    setIfaStreak(prev => prev + 1)
    // In real app, save to database
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nutrition & IFA</h1>
          <p className="text-pink-600 font-hindi">पोषण और IFA</p>
        </div>
      </div>

      {/* IFA Tracker Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(
          'border-0 overflow-hidden',
          ifaTaken 
            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
            : 'bg-gradient-to-br from-orange-500 to-amber-500'
        )}>
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Today's IFA Tablet</p>
                <p className="text-2xl font-bold">
                  {ifaTaken ? 'Taken! ✓' : 'Not taken yet'}
                </p>
                <p className="text-white/80 font-hindi">
                  {ifaTaken ? 'ले लिया! ✓' : 'अभी नहीं लिया'}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Pill className="w-8 h-8" />
              </div>
            </div>
            
            {!ifaTaken && (
              <Button 
                onClick={handleIfaTaken}
                className="w-full bg-white text-orange-600 hover:bg-orange-50"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark as Taken
              </Button>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Current streak</span>
                <span className="font-bold">{ifaStreak} days 🔥</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* IFA Reminder Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-700 mb-1">
                  Why IFA is important
                </h3>
                <p className="text-sm text-orange-600">
                  IFA tablets prevent anemia and help your baby grow healthy. Take one tablet daily after lunch.
                </p>
                <p className="text-sm text-orange-600 font-hindi mt-1">
                  IFA गोली खून की कमी रोकती है और बच्चे को स्वस्थ रखती है। रोज़ दोपहर के खाने के बाद एक गोली लें।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Daily Tips</h2>
        <div className="space-y-3">
          {dailyTips.map((tip, index) => (
            <Card key={index} className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${tip.color} flex items-center justify-center`}>
                    <tip.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tip.title}</p>
                    <p className="text-sm text-pink-600 font-hindi">{tip.titleHindi}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Iron-Rich Foods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Iron-Rich Foods</h2>
          <Badge className="bg-pink-100 text-pink-700">Local foods</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {ironRichFoods.map((food, index) => (
            <Card key={index} className="border-pink-100 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-3xl mb-2">{food.emoji}</div>
                <h3 className="font-medium text-gray-900 text-sm">{food.name}</h3>
                <p className="text-xs text-pink-600 font-hindi">{food.nameHindi}</p>
                <p className="text-xs text-gray-500 mt-1">Iron: {food.iron}</p>
                <p className="text-xs text-green-600 mt-1">{food.tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Meal Log Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link href="/nutrition/meal-log">
          <Card className="border-pink-100 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Apple className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Log Your Meals</h3>
                    <p className="text-sm text-pink-600 font-hindi">अपना खाना लॉग करें</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
}

