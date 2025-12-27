'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  Phone, 
  MapPin,
  Check,
  ChevronLeft,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RedZoneButton2D } from '@/components/3d/RedZoneButton'
import Link from 'next/link'

type EmergencyStatus = 'ready' | 'activating' | 'sent' | 'error'

export default function RedZoneActivatePage() {
  const router = useRouter()
  const [status, setStatus] = React.useState<EmergencyStatus>('ready')
  const [location, setLocation] = React.useState<{ lat: number; lng: number } | null>(null)
  const [errorMessage, setErrorMessage] = React.useState('')

  // Get user's location
  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Location error:', error)
        }
      )
    }
  }, [])

  const handleActivate = async () => {
    setStatus('activating')

    try {
      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity_level: 'emergency',
          alert_type: 'emergency_sos',
          description: 'User activated Red Zone emergency button',
          location_lat: location?.lat,
          location_lng: location?.lng,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('sent')
        // Vibrate on success
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }
      } else {
        throw new Error(data.error || 'Failed to send alert')
      }
    } catch (error) {
      console.error('Emergency alert error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send alert')
    }
  }

  if (status === 'sent') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6"
        >
          <Check className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Help is on the way!
        </h1>
        <p className="text-xl text-green-600 font-hindi mb-4">
          मदद आ रही है!
        </p>
        
        <p className="text-gray-600 mb-8 max-w-sm">
          Your ASHA worker has been notified. Stay calm and stay where you are.
        </p>

        <div className="space-y-4 w-full max-w-sm">
          <a href="tel:108" className="block">
            <Button className="w-full bg-red-500 hover:bg-red-600 py-6 text-lg">
              <Phone className="w-5 h-5 mr-2" />
              Call 108 (Ambulance)
            </Button>
          </a>
          
          <Link href="/user-dashboard">
            <Button variant="outline" className="w-full py-6 text-lg border-pink-300">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/user-dashboard">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-red-600">Emergency SOS</h1>
          <p className="text-red-500 font-hindi">इमरजेंसी SOS</p>
        </div>
      </div>

      {/* Warning Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-700 mb-1">
                  Use only for real emergencies
                </h3>
                <p className="text-sm text-red-600">
                  This will alert your ASHA worker and emergency contacts immediately.
                </p>
                <p className="text-sm text-red-600 font-hindi mt-1">
                  यह तुरंत आपकी ASHA दीदी और इमरजेंसी संपर्कों को अलर्ट करेगा।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emergency Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center py-8"
      >
        {status === 'activating' ? (
          <div className="text-center">
            <div className="w-40 h-40 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
            </div>
            <p className="text-lg font-semibold text-red-600">Sending alert...</p>
            <p className="text-red-500 font-hindi">अलर्ट भेज रहे हैं...</p>
          </div>
        ) : (
          <RedZoneButton2D 
            onActivate={handleActivate}
            disabled={status === 'activating'}
          />
        )}

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-100 rounded-xl text-center">
            <p className="text-red-600 font-medium">{errorMessage}</p>
            <Button 
              onClick={() => setStatus('ready')}
              variant="outline"
              className="mt-2 border-red-300 text-red-600"
            >
              Try Again
            </Button>
          </div>
        )}
      </motion.div>

      {/* Location Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                location ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <MapPin className={`w-5 h-5 ${
                  location ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {location ? 'Location detected' : 'Getting location...'}
                </p>
                <p className="text-sm text-gray-500">
                  {location 
                    ? 'Your location will be shared with responders'
                    : 'Enable location for faster help'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Call Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <p className="text-sm font-medium text-gray-700">Or call directly:</p>
        
        <a href="tel:108" className="block">
          <Card className="border-red-200 hover:bg-red-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-red-600 text-lg">108</p>
                  <p className="text-sm text-gray-600">Ambulance / Emergency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="tel:102" className="block">
          <Card className="border-pink-200 hover:bg-pink-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-pink-600 text-lg">102</p>
                  <p className="text-sm text-gray-600">Pregnancy Helpline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>
      </motion.div>
    </div>
  )
}

