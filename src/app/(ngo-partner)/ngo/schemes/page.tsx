'use client'

import React, { useState } from 'react'
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
  ArrowLeft
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

// Mock schemes data
const mockSchemes: Scheme[] = [
  {
    id: 's1',
    name: 'Pradhan Mantri Matru Vandana Yojana',
    nameHindi: 'प्रधानमंत्री मातृ वंदना योजना',
    description: 'Cash benefit for pregnant and lactating mothers for better nutrition and health care',
    eligibility: ['Pregnant women', 'First living child', 'Age 19+ years'],
    benefitAmount: 5000,
    isActive: true,
    districts: ['Raipur', 'Bilaspur', 'Durg'],
    viewsCount: 1247,
    eligiblePopulation: 2890,
    createdDate: '2023-01-15',
    lastUpdated: '2024-12-01'
  },
  {
    id: 's2',
    name: 'Janani Suraksha Yojana',
    nameHindi: 'जननी सुरक्षा योजना',
    description: 'Cash assistance for institutional delivery to reduce maternal and neonatal mortality',
    eligibility: ['Pregnant women', 'BPL family', 'Institutional delivery'],
    benefitAmount: 1400,
    isActive: true,
    districts: ['Raipur', 'Bilaspur'],
    viewsCount: 987,
    eligiblePopulation: 1567,
    createdDate: '2023-03-10',
    lastUpdated: '2024-11-15'
  },
  {
    id: 's3',
    name: 'Mukhyamantri Suposhan Yojana',
    nameHindi: 'मुख्यमंत्री सुपोषण योजना',
    description: 'State scheme for nutrition support to pregnant and lactating mothers',
    eligibility: ['Pregnant women', 'Lactating mothers', 'State resident'],
    benefitAmount: 3000,
    isActive: false,
    districts: ['Durg'],
    viewsCount: 456,
    eligiblePopulation: 890,
    createdDate: '2023-06-20',
    lastUpdated: '2024-10-05'
  }
]

export default function SchemeMgmtPage() {
  const router = useRouter()
  const [schemes, setSchemes] = useState(mockSchemes)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null)
  const [newScheme, setNewScheme] = useState({
    name: '',
    nameHindi: '',
    description: '',
    eligibility: '',
    benefitAmount: '',
    districts: ''
  })

  const handleAddScheme = () => {
    const scheme: Scheme = {
      id: `s${schemes.length + 1}`,
      name: newScheme.name,
      nameHindi: newScheme.nameHindi,
      description: newScheme.description,
      eligibility: newScheme.eligibility.split(',').map(e => e.trim()),
      benefitAmount: parseInt(newScheme.benefitAmount),
      isActive: true,
      districts: newScheme.districts.split(',').map(d => d.trim()),
      viewsCount: 0,
      eligiblePopulation: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    
    setSchemes([...schemes, scheme])
    setNewScheme({
      name: '',
      nameHindi: '',
      description: '',
      eligibility: '',
      benefitAmount: '',
      districts: ''
    })
    setIsAddDialogOpen(false)
  }

  const toggleSchemeStatus = (schemeId: string) => {
    setSchemes(schemes.map(scheme => 
      scheme.id === schemeId 
        ? { ...scheme, isActive: !scheme.isActive, lastUpdated: new Date().toISOString().split('T')[0] }
        : scheme
    ))
  }

  const totalViews = schemes.reduce((sum, scheme) => sum + scheme.viewsCount, 0)
  const totalEligiblePopulation = schemes.reduce((sum, scheme) => sum + scheme.eligiblePopulation, 0)
  const activeSchemes = schemes.filter(scheme => scheme.isActive).length

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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddScheme} className="bg-green-600 hover:bg-green-700">
                  Add Scheme
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                <div className="text-2xl font-bold text-slate-900">{schemes.length}</div>
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
                <div className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString()}</div>
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
                <div className="text-2xl font-bold text-slate-900">{totalEligiblePopulation.toLocaleString()}</div>
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
                <div className="text-2xl font-bold text-slate-900">{activeSchemes}</div>
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