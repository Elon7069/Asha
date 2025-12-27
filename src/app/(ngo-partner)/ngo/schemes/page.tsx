'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Users,
  BarChart3,
  MapPin,
  Calendar,
  IndianRupee,
  ArrowLeft,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

interface Scheme {
  id: string
  name: string
  nameHindi: string
  description: string
  eligibility: string[]
  benefitAmount: number
  isActive: boolean
  districts: string[]
  viewsCount: number
  eligiblePopulation: number
  createdDate: string
  lastUpdated: string
}

interface SchemesSummary {
  totalSchemes: number
  activeSchemes: number
  totalViews: number
  totalEligible: number
}

export default function SchemeMgmtPage() {
  const router = useRouter()
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [summary, setSummary] = useState<SchemesSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newScheme, setNewScheme] = useState({
    name: '',
    nameHindi: '',
    description: '',
    eligibility: '',
    benefitAmount: '',
    districts: ''
  })

  const fetchSchemes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/ngo/schemes')
      if (!response.ok) throw new Error('Failed to fetch schemes')
      const result = await response.json()
      setSchemes(result.data.schemes)
      setSummary(result.data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchemes()
  }, [])

  const handleAddScheme = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/ngo/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newScheme.name,
          nameHindi: newScheme.nameHindi,
          description: newScheme.description,
          eligibility: newScheme.eligibility.split(',').map(e => e.trim()),
          benefitAmount: parseInt(newScheme.benefitAmount) || 0,
          districts: newScheme.districts.split(',').map(d => d.trim()),
          isActive: true
        })
      })
      
      if (!response.ok) throw new Error('Failed to create scheme')
      
      const result = await response.json()
      setSchemes([...schemes, result.data])
      setNewScheme({
        name: '',
        nameHindi: '',
        description: '',
        eligibility: '',
        benefitAmount: '',
        districts: ''
      })
      setIsAddDialogOpen(false)
      fetchSchemes() // Refresh to get updated summary
    } catch (err) {
      alert('Failed to add scheme. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleSchemeStatus = async (schemeId: string) => {
    try {
      const response = await fetch('/api/ngo/schemes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schemeId })
      })
      
      if (!response.ok) throw new Error('Failed to toggle scheme')
      
      const result = await response.json()
      setSchemes(schemes.map(scheme => 
        scheme.id === schemeId ? result.data : scheme
      ))
    } catch (err) {
      alert('Failed to update scheme status. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
          <p className="text-slate-600">Loading schemes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-red-200 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchSchemes} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              Government Scheme Management
            </h1>
            <p className="text-slate-600 mt-1">Manage scheme information and track awareness levels</p>
          </div>
        </div>

        {/* Add New Scheme Button */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchSchemes}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Scheme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Government Scheme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheme-name">Scheme Name (English)</Label>
                  <Input
                    id="scheme-name"
                    value={newScheme.name}
                    onChange={(e) => setNewScheme(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter scheme name"
                  />
                </div>
                <div>
                  <Label htmlFor="scheme-name-hindi">Scheme Name (Hindi)</Label>
                  <Input
                    id="scheme-name-hindi"
                    value={newScheme.nameHindi}
                    onChange={(e) => setNewScheme(prev => ({ ...prev, nameHindi: e.target.value }))}
                    placeholder="योजना का नाम हिंदी में"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="scheme-description">Description</Label>
                <Textarea
                  id="scheme-description"
                  value={newScheme.description}
                  onChange={(e) => setNewScheme(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the scheme benefits and purpose"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eligibility">Eligibility Criteria</Label>
                  <Input
                    id="eligibility"
                    value={newScheme.eligibility}
                    onChange={(e) => setNewScheme(prev => ({ ...prev, eligibility: e.target.value }))}
                    placeholder="Criteria 1, Criteria 2, Criteria 3"
                  />
                </div>
                <div>
                  <Label htmlFor="benefit-amount">Benefit Amount (₹)</Label>
                  <Input
                    id="benefit-amount"
                    type="number"
                    value={newScheme.benefitAmount}
                    onChange={(e) => setNewScheme(prev => ({ ...prev, benefitAmount: e.target.value }))}
                    placeholder="5000"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="districts">Active Districts</Label>
                <Input
                  id="districts"
                  value={newScheme.districts}
                  onChange={(e) => setNewScheme(prev => ({ ...prev, districts: e.target.value }))}
                  placeholder="District 1, District 2, District 3"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleAddScheme} className="bg-green-600 hover:bg-green-700" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {saving ? 'Adding...' : 'Add Scheme'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{summary?.totalSchemes || schemes.length}</div>
                <div className="text-sm text-slate-600">Total Schemes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{(summary?.totalViews || 0).toLocaleString()}</div>
                <div className="text-sm text-slate-600">Total Views</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{(summary?.totalEligible || 0).toLocaleString()}</div>
                <div className="text-sm text-slate-600">Eligible Population</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{summary?.activeSchemes || schemes.filter(s => s.isActive).length}</div>
                <div className="text-sm text-slate-600">Active Schemes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schemes List */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Scheme Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schemes.map((scheme) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{scheme.name}</h3>
                      <Badge className={scheme.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {scheme.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-slate-700 font-medium mb-2">{scheme.nameHindi}</div>
                    <div className="text-sm text-slate-600 mb-3">{scheme.description}</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Benefit Amount:</span>
                        <div className="font-semibold text-slate-900 flex items-center">
                          <IndianRupee className="w-4 h-4 mr-1" />
                          {scheme.benefitAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Views:</span>
                        <div className="font-semibold text-slate-900 flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {scheme.viewsCount}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Eligible Population:</span>
                        <div className="font-semibold text-slate-900 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {scheme.eligiblePopulation.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Districts:</span>
                        <div className="font-semibold text-slate-900 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {scheme.districts.length}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`toggle-${scheme.id}`} className="text-sm text-slate-600">
                        {scheme.isActive ? 'Active' : 'Inactive'}
                      </Label>
                      <Switch
                        id={`toggle-${scheme.id}`}
                        checked={scheme.isActive}
                        onCheckedChange={() => toggleSchemeStatus(scheme.id)}
                      />
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-300">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Eligibility Criteria */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Eligibility Criteria:</div>
                  <div className="flex flex-wrap gap-2">
                    {scheme.eligibility.map((criteria, index) => (
                      <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                        {criteria}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Districts */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Active in Districts:</div>
                  <div className="flex flex-wrap gap-2">
                    {scheme.districts.map((district, index) => (
                      <Badge key={index} variant="outline" className="border-green-200 text-green-700">
                        {district}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(scheme.createdDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Updated: {new Date(scheme.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-blue-900 mb-2">Important: NGO Role Limitations</div>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• NGOs can add/edit scheme information and track awareness levels</p>
                <p>• NGOs cannot apply on behalf of users or access personal eligibility data</p>
                <p>• All applications must be completed by beneficiaries through proper government channels</p>
                <p>• This interface is for information management only, not application processing</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  )
}