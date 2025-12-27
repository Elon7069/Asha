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
  Building2,
  Activity,
  LogOut,
  Loader2,
  Users,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'

interface NgoPartnerProfileData {
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
  organization_name: string | null
  organization_type: string | null
  registration_number: string | null
  focus_areas: string[] | null
  partnership_since: string | null
  created_at: string
}

export default function NgoPartnerProfilePage() {
  const { user, profile, signOut } = useAuth()
  const [profileData, setProfileData] = React.useState<NgoPartnerProfileData | null>(null)
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
    if (profile && profile.role !== 'ngo_partner') {
      router.push('/profile') // Redirect to unified profile route
      return
    }
  }, [user, profile, router])

  React.useEffect(() => {
    const fetchNgoProfile = async () => {
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
          .eq('role', 'ngo_partner')
          .single()

        if (userError || !ashaUser) {
          console.error('Error fetching NGO user:', userError)
          setError('Unable to load profile data')
          setLoading(false)
          return
        }

        // Then get NGO partner profile
        const { data: profile, error: profileError } = await supabase
          .from('ngo_partner_profiles')
          .select(`
            id,
            user_id,
            organization_name,
            organization_type,
            registration_number,
            operational_districts,
            operational_states,
            official_email,
            official_phone,
            website_url,
            total_beneficiaries_impacted,
            created_at
          `)
          .eq('user_id', ashaUser.id)
          .single()

        if (profileError) {
          console.error('Error fetching NGO partner profile:', profileError)
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
            email: profile.official_email,
            village: null, // NGOs don't have villages
            district: profile.operational_districts?.[0] || null,
            state: profile.operational_states?.[0] || 'India',
            organization_name: profile.organization_name,
            organization_type: profile.organization_type,
            registration_number: profile.registration_number,
            focus_areas: profile.operational_districts, // Using operational districts as focus areas
            partnership_since: profile.created_at,
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

    fetchNgoProfile()
  }, [user?.id, supabase])

  const getInitials = (name: string | null) => {
    if (!name) return 'N'
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
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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
            <p className="text-yellow-600">No NGO partner profile found</p>
            <p className="text-sm text-gray-500 mt-2">Please contact the administrator to set up your organization profile</p>
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
            <h1 className="text-3xl font-bold text-gray-900">NGO Partner Profile</h1>
            <p className="text-gray-500">Partner Organization Profile</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-indigo-200">
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
        <Card className="border-indigo-100">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl">
                  {getInitials(profileData.organization_name || profileData.full_name || profileData.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profileData.organization_name || profileData.full_name || profileData.display_name || 'NGO Partner'}
                </h2>
                <p className="text-lg text-gray-600">
                  {profileData.full_name || profileData.display_name}
                </p>
                <p className="text-gray-500">{profileData.email || user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-indigo-200 text-indigo-600">
                    <Building2 className="w-3 h-3 mr-1" />
                    NGO Partner
                  </Badge>
                  {profileData.organization_type && (
                    <Badge className="bg-indigo-500">
                      {profileData.organization_type}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Non-Governmental Organization Partner</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card className="border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                Contact Information
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
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Registration Number</p>
                  <p className="text-gray-600">{profileData.registration_number || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Service Area</p>
                  <p className="text-gray-600">
                    {profileData.village || profileData.district 
                      ? `${profileData.village || 'Multiple villages'}, ${profileData.district || 'Multiple districts'}` 
                      : 'Location not provided'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Information */}
          <Card className="border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Organization Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Organization Name</p>
                  <p className="text-gray-600">{profileData.organization_name || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Organization Type</p>
                  <p className="text-gray-600">{profileData.organization_type || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Focus Areas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profileData.focus_areas && profileData.focus_areas.length > 0 ? (
                      profileData.focus_areas.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-600">Not specified</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Partnership Since</p>
                  <p className="text-gray-600">{formatDate(profileData.partnership_since || profileData.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-indigo-100">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col border-indigo-200" onClick={() => window.location.href = '/ngo-dashboard'}>
                <BarChart3 className="w-5 h-5 mb-1 text-indigo-500" />
                <span className="text-sm">Dashboard</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex-col border-indigo-200" onClick={() => window.location.href = '/ngo-partner/schemes'}>
                <FileText className="w-5 h-5 mb-1 text-indigo-500" />
                <span className="text-sm">Schemes</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex-col border-indigo-200" onClick={() => window.location.href = '/ngo-partner/heatmap'}>
                <MapPin className="w-5 h-5 mb-1 text-indigo-500" />
                <span className="text-sm">Heatmap</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex-col border-indigo-200" onClick={() => window.location.href = '/ngo-partner/reports'}>
                <Activity className="w-5 h-5 mb-1 text-indigo-500" />
                <span className="text-sm">Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}