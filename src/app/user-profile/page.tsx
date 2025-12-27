'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  Edit,
  Heart,
  Baby,
  Activity,
  LogOut,
  Loader2,
  Save,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'

interface UserProfileData {
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
  is_pregnant: boolean | null
  last_period_date: string | null
  pregnancy_week: number | null
  pregnancy_stage: string | null
  created_at: string
}

export default function UserProfilePage() {
  const { user, profile, signOut } = useAuth()
  const [profileData, setProfileData] = React.useState<UserProfileData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [editFormData, setEditFormData] = React.useState({
    full_name: '',
    phone_number: '',
    age: '',
    village: '',
    district: '',
    is_pregnant: false,
    last_period_date: ''
  })
  const router = useRouter()

  const supabase = getSupabaseClient()

  // Redirect if not authenticated or wrong role
  React.useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (profile && profile.role !== 'user') {
      router.push('/profile') // Redirect to unified profile route
      return
    }
  }, [user, profile, router])

  React.useEffect(() => {
    const fetchUserProfile = async () => {
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
          .eq('role', 'user')
          .single()

        if (userError || !ashaUser) {
          console.error('Error fetching user:', userError)
          setError('Unable to load profile data')
          setLoading(false)
          return
        }

        // Then get user profile
        const { data: profile, error: profileError } = await supabase
          .from('asha_user_profiles')
          .select(`
            id,
            user_id,
            village,
            district,
            state,
            is_currently_pregnant,
            pregnancy_stage,
            last_period_date,
            current_pregnancy_week,
            created_at
          `)
          .eq('user_id', ashaUser.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
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
            village: profile.village,
            district: profile.district,
            state: profile.state,
            is_pregnant: profile.is_currently_pregnant,
            last_period_date: profile.last_period_date,
            pregnancy_week: profile.current_pregnancy_week,
            pregnancy_stage: profile.pregnancy_stage,
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

    fetchUserProfile()
  }, [user?.id, supabase])

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleEditProfile = () => {
    if (profileData) {
      setEditFormData({
        full_name: profileData.full_name || '',
        phone_number: profileData.phone_number || '',
        age: profileData.age?.toString() || '',
        village: profileData.village || '',
        district: profileData.district || '',
        is_pregnant: profileData.is_pregnant || false,
        last_period_date: profileData.last_period_date || ''
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user || !profileData) return
    
    setIsUpdating(true)
    try {
      const supabase = getSupabaseClient()
      
      // Update asha_users table
      const { error: userError } = await supabase
        .from('asha_users')
        .update({
          full_name: editFormData.full_name,
          phone_number: editFormData.phone_number,
          age: editFormData.age ? parseInt(editFormData.age) : null
        })
        .eq('auth_id', user.id)
      
      if (userError) throw userError
      
      // Update asha_user_profiles table
      const { error: profileError } = await supabase
        .from('asha_user_profiles')
        .update({
          village: editFormData.village,
          district: editFormData.district,
          is_currently_pregnant: editFormData.is_pregnant,
          last_period_date: editFormData.last_period_date || null
        })
        .eq('user_id', profileData.user_id)
      
      if (profileError) throw profileError
      
      // Update local state
      setProfileData({
        ...profileData,
        full_name: editFormData.full_name,
        phone_number: editFormData.phone_number,
        age: editFormData.age ? parseInt(editFormData.age) : null,
        village: editFormData.village,
        district: editFormData.district,
        is_pregnant: editFormData.is_pregnant,
        last_period_date: editFormData.last_period_date
      })
      
      setIsEditDialogOpen(false)
    } catch (err: any) {
      console.error('Update error:', err)
      setError('Failed to update profile: ' + err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const calculatePregnancyWeeks = () => {
    if (!profileData?.last_period_date) return 0
    
    const lastPeriod = new Date(profileData.last_period_date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastPeriod.getTime())
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    return diffWeeks
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center animate-spin">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
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
            <p className="text-yellow-600">No profile data found</p>
            <p className="text-sm text-gray-500 mt-2">Please complete your profile setup</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pregnancyWeeks = calculatePregnancyWeeks()

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
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-500 font-hindi">प्रोफाइल</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditProfile} className="border-pink-200">
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
        <Card className="border-pink-100">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-pink-100 text-pink-600 text-xl">
                  {getInitials(profileData.full_name || profileData.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profileData.full_name || profileData.display_name || 'User'}
                </h2>
                <p className="text-gray-500">{profileData.email || user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-pink-200 text-pink-600">
                    <User className="w-3 h-3 mr-1" />
                    User
                  </Badge>
                  {profileData.is_pregnant && (
                    <Badge className="bg-pink-500">
                      <Baby className="w-3 h-3 mr-1" />
                      {pregnancyWeeks} weeks pregnant
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Community Member</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-pink-500" />
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
                  <p className="font-medium">Location</p>
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

          {/* Health Information */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Health Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Pregnancy Status</p>
                  <p className="text-gray-600">
                    {profileData.is_pregnant ? 'Pregnant' : 'Not Pregnant'}
                  </p>
                </div>
              </div>
              
              {profileData.is_pregnant && pregnancyWeeks > 0 && (
                <div className="flex items-center gap-3">
                  <Baby className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Pregnancy Week</p>
                    <p className="text-gray-600">Week {pregnancyWeeks}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Last Period</p>
                  <p className="text-gray-600">
                    {formatDate(profileData.last_period_date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Member Since</p>
                  <p className="text-gray-600">
                    {formatDate(profileData.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/voice-chat">
                <Button variant="outline" className="h-16 flex-col border-pink-200 w-full">
                  <Heart className="w-5 h-5 mb-1 text-pink-500" />
                  <span className="text-sm">Voice Chat</span>
                </Button>
              </Link>
              
              <Link href="/period-tracker">
                <Button variant="outline" className="h-16 flex-col border-pink-200 w-full">
                  <Calendar className="w-5 h-5 mb-1 text-pink-500" />
                  <span className="text-sm">Period Tracker</span>
                </Button>
              </Link>
              
              <Link href="/pregnancy">
                <Button variant="outline" className="h-16 flex-col border-pink-200 w-full">
                  <Baby className="w-5 h-5 mb-1 text-pink-500" />
                  <span className="text-sm">Pregnancy</span>
                </Button>
              </Link>
              
              <Link href="/nutrition">
                <Button variant="outline" className="h-16 flex-col border-pink-200 w-full">
                  <Activity className="w-5 h-5 mb-1 text-pink-500" />
                  <span className="text-sm">Nutrition</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-pink-500" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={editFormData.phone_number}
                onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={editFormData.age}
                onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                placeholder="Enter your age"
              />
            </div>
            
            <div>
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                value={editFormData.village}
                onChange={(e) => setEditFormData({...editFormData, village: e.target.value})}
                placeholder="Enter your village"
              />
            </div>
            
            <div>
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={editFormData.district}
                onChange={(e) => setEditFormData({...editFormData, district: e.target.value})}
                placeholder="Enter your district"
              />
            </div>
            
            <div>
              <Label htmlFor="pregnancy_status">Pregnancy Status</Label>
              <Select
                value={editFormData.is_pregnant ? "pregnant" : "not_pregnant"}
                onValueChange={(value) => setEditFormData({...editFormData, is_pregnant: value === "pregnant"})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_pregnant">Not Pregnant</SelectItem>
                  <SelectItem value="pregnant">Pregnant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {editFormData.is_pregnant && (
              <div>
                <Label htmlFor="last_period_date">Last Period Date</Label>
                <Input
                  id="last_period_date"
                  type="date"
                  value={editFormData.last_period_date}
                  onChange={(e) => setEditFormData({...editFormData, last_period_date: e.target.value})}
                />
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="flex-1 bg-pink-500 hover:bg-pink-600"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}