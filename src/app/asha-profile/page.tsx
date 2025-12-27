'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  Edit,
  Users,
  Activity,
  LogOut,
  Loader2,
  Award,
  Clock,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'

interface AshaWorkerProfileData {
  id: string
  user_id: string
  full_name: string | null
  display_name: string | null
  age: number | null
  phone_number: string | null
  email: string | null
  village: string | null
  district: string | null
  state: string | null
  employee_id: string | null
  certification_date: string | null
  supervisor_name: string | null
  total_beneficiaries: number | null
  created_at: string
}

export default function AshaWorkerProfilePage() {
  const { user, profile, signOut } = useAuth()
  const [profileData, setProfileData] = React.useState<AshaWorkerProfileData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const router = useRouter()

  const supabase = getSupabaseClient()

  // Redirect if not authenticated or wrong role
  React.useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (profile && profile.role !== 'asha_worker') {
      router.push('/profile') // Redirect to unified profile route
      return
    }
  }, [user, profile, router])

  React.useEffect(() => {
    const fetchWorkerProfile = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        // First get asha_users record
        const { data: ashaUser, error: userError } = await supabase
          .from('asha_users')
          .select('id, full_name, display_name, age, phone_number, role')
          .eq('auth_id', user.id)
          .eq('role', 'asha_worker')
          .single()

        if (userError || !ashaUser) {
          console.error('Error fetching ASHA user:', userError)
          setError('Unable to load profile data')
          setLoading(false)
          return
        }

        // Then get ASHA worker profile
        const { data: profile, error: profileError } = await supabase
          .from('asha_worker_profiles')
          .select(`
            id,
            user_id,
            worker_id,
            certification_date,
            supervisor_name,
            assigned_villages,
            assigned_district,
            current_beneficiaries_count,
            total_visits_completed,
            created_at
          `)
          .eq('user_id', ashaUser.id)
          .single()

        if (profileError) {
          console.error('Error fetching ASHA worker profile:', profileError)
          setError('Unable to load profile data')
        } else {
          // Combine data from both tables
          setProfileData({
            id: profile.id,
            user_id: profile.user_id,
            full_name: ashaUser.full_name,
            display_name: ashaUser.display_name,
            age: ashaUser.age,
            phone_number: ashaUser.phone_number,
            email: null, // Email is in auth.users, not accessible here
            village: profile.assigned_villages?.[0] || null,
            district: profile.assigned_district,
            state: 'India', // Default value
            employee_id: profile.worker_id,
            certification_date: profile.certification_date,
            supervisor_name: profile.supervisor_name,
            total_beneficiaries: profile.current_beneficiaries_count,
            created_at: profile.created_at
          })
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
        setError('Unable to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkerProfile()
  }, [user?.id, supabase])

  const getInitials = (name: string | null) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="border-yellow-200">
          <CardContent className="p-6 text-center">
            <p className="text-yellow-600">No ASHA worker profile found</p>
            <p className="text-sm text-gray-500 mt-2">Please contact your supervisor to set up your profile</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ASHA Worker Profile</h1>
            <p className="text-gray-500 font-hindi">आशा कार्यकर्ता प्रोफाइल</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-emerald-200">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" onClick={signOut} className="border-red-200 text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="border-emerald-100">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xl">
                  {getInitials(profileData.full_name || profileData.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profileData.full_name || profileData.display_name || 'ASHA Worker'}
                </h2>
                <p className="text-gray-500">{profileData.email || user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-emerald-200 text-emerald-600">
                    <Users className="w-3 h-3 mr-1" />
                    ASHA Worker
                  </Badge>
                  {profileData.employee_id && (
                    <Badge className="bg-emerald-500">
                      ID: {profileData.employee_id}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Accredited Social Health Activist</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">{profileData.email || user?.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">{profileData.phone_number || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Age</p>
                  <p className="text-gray-600">{profileData.age ? `${profileData.age} years` : 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Service Area</p>
                  <p className="text-gray-600">
                    {profileData.village || profileData.district 
                      ? `${profileData.village || 'Unknown village'}, ${profileData.district || 'Unknown district'}` 
                      : 'Location not provided'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Employee ID</p>
                  <p className="text-gray-600">{profileData.employee_id || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Certification Date</p>
                  <p className="text-gray-600">{formatDate(profileData.certification_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Supervisor</p>
                  <p className="text-gray-600">{profileData.supervisor_name || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Total Beneficiaries</p>
                  <p className="text-gray-600">{profileData.total_beneficiaries || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Service Since</p>
                  <p className="text-gray-600">{formatDate(profileData.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col border-emerald-200" onClick={() => window.location.href = '/asha-worker/beneficiaries'}>
                <Users className="w-5 h-5 mb-1 text-emerald-500" />
                <span className="text-sm">Beneficiaries</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex-col border-emerald-200" onClick={() => window.location.href = '/asha-worker/voice-log'}>
                <Activity className="w-5 h-5 mb-1 text-emerald-500" />
                <span className="text-sm">Voice Log</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex-col border-emerald-200" onClick={() => window.location.href = '/asha-worker/alerts'}>
                <Activity className="w-5 h-5 mb-1 text-emerald-500" />
                <span className="text-sm">Alerts</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex-col border-emerald-200" onClick={() => window.location.href = '/dashboard'}>
                <Target className="w-5 h-5 mb-1 text-emerald-500" />
                <span className="text-sm">Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}