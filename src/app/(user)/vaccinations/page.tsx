'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Syringe, 
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { format, isPast, isFuture, differenceInDays } from 'date-fns'

interface Vaccination {
  id: string
  vaccine_name: string
  vaccine_type: string
  dose_number: number | null
  scheduled_date: string
  completed_date: string | null
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled'
  reminder_sent: boolean
}

export default function VaccinationsPage() {
  const { user } = useAuth()
  const [vaccinations, setVaccinations] = React.useState<Vaccination[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchVaccinations() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const supabase = getSupabaseClient()
        
        // First get asha_users record
        const { data: ashaUser } = await supabase
          .from('asha_users')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (!ashaUser) {
          setLoading(false)
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('asha_user_profiles')
          .select('id')
          .eq('user_id', ashaUser.id)
          .single()

        if (profile) {
          const { data } = await supabase
            .from('vaccinations')
            .select('*')
            .eq('user_id', profile.id)
            .order('scheduled_date', { ascending: true })

          if (data) {
            setVaccinations(data as Vaccination[])
          }
        }
      } catch (error) {
        console.error('Error fetching vaccinations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVaccinations()
  }, [user])

  const upcomingVaccinations = vaccinations.filter(v => 
    v.status === 'scheduled' && isFuture(new Date(v.scheduled_date))
  )

  const completedVaccinations = vaccinations.filter(v => v.status === 'completed')

  const missedVaccinations = vaccinations.filter(v => 
    v.status === 'missed' || (v.status === 'scheduled' && isPast(new Date(v.scheduled_date)))
  )

  const getStatusBadge = (vaccination: Vaccination) => {
    switch (vaccination.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'missed':
        return <Badge className="bg-red-100 text-red-700">Missed</Badge>
      case 'scheduled':
        const daysUntil = differenceInDays(new Date(vaccination.scheduled_date), new Date())
        if (daysUntil < 0) {
          return <Badge className="bg-red-100 text-red-700">Overdue</Badge>
        } else if (daysUntil <= 7) {
          return <Badge className="bg-orange-100 text-orange-700">Due Soon</Badge>
        }
        return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vaccinations</h1>
        <p className="text-pink-600 font-hindi">टीकाकरण</p>
        <p className="text-gray-600 text-sm mt-2">
          Track your vaccination schedule
        </p>
      </div>

      {/* Upcoming Vaccinations */}
      {upcomingVaccinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-orange-100 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Upcoming Vaccinations
              </CardTitle>
              <p className="text-sm text-gray-500 font-hindi">आगामी टीकाकरण</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingVaccinations.map((vaccination) => {
                const daysUntil = differenceInDays(new Date(vaccination.scheduled_date), new Date())
                return (
                  <div
                    key={vaccination.id}
                    className="p-4 bg-white rounded-lg border border-orange-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{vaccination.vaccine_name}</h3>
                        {vaccination.dose_number && (
                          <p className="text-sm text-gray-500">Dose {vaccination.dose_number}</p>
                        )}
                      </div>
                      {getStatusBadge(vaccination)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(vaccination.scheduled_date), 'MMM d, yyyy')}</span>
                      {daysUntil >= 0 && (
                        <span className="text-orange-600 font-medium">
                          ({daysUntil} days away)
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Missed Vaccinations */}
      {missedVaccinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-red-100 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                Missed Vaccinations
              </CardTitle>
              <p className="text-sm text-gray-500 font-hindi">छूटे हुए टीकाकरण</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {missedVaccinations.map((vaccination) => (
                <div
                  key={vaccination.id}
                  className="p-4 bg-white rounded-lg border border-red-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{vaccination.vaccine_name}</h3>
                      {vaccination.dose_number && (
                        <p className="text-sm text-gray-500">Dose {vaccination.dose_number}</p>
                      )}
                    </div>
                    {getStatusBadge(vaccination)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Was due: {format(new Date(vaccination.scheduled_date), 'MMM d, yyyy')}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                    size="sm"
                  >
                    Reschedule
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Completed Vaccinations */}
      {completedVaccinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Completed Vaccinations
              </CardTitle>
              <p className="text-sm text-gray-500 font-hindi">पूर्ण टीकाकरण</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedVaccinations.map((vaccination) => (
                <div
                  key={vaccination.id}
                  className="p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{vaccination.vaccine_name}</h3>
                      {vaccination.dose_number && (
                        <p className="text-sm text-gray-500">Dose {vaccination.dose_number}</p>
                      )}
                    </div>
                    {getStatusBadge(vaccination)}
                  </div>
                  {vaccination.completed_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Completed on {format(new Date(vaccination.completed_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && vaccinations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Syringe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vaccinations scheduled yet.</p>
            <p className="text-gray-500 font-hindi mt-1">अभी कोई टीकाकरण निर्धारित नहीं है।</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

