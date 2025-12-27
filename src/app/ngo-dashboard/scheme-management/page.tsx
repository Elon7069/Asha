'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit,
  Eye,
  Trash2,
  Filter,
  Search,
  Download,
  Users,
  FileText,
  Award,
  Heart,
  DollarSign,
  Activity,
  Info,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  BarChart3,
  Phone
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RoleBasedLayout from '@/components/layout/RoleBasedLayout'

interface Scheme {
  id: string
  name: string
  nameHindi: string
  category: 'nutrition' | 'cash' | 'healthcare' | 'education'
  description: string
  descriptionHindi: string
  eligibility: string[]
  eligibilityHindi: string[]
  requiredDocuments: string[]
  applicationSteps: string[]
  helplineNumber: string
  activeDistricts: string[]
  status: 'active' | 'draft' | 'archived'
  beneficiaries: number
  views: number
  applications: number
  lastUpdated: string
  createdBy: string
}

interface SchemeAnalytics {
  totalSchemes: number
  activeSchemes: number
  totalViews: number
  totalApplications: number
  eligibleWomen: number
  informedWomen: number
  appliedWomen: number
}

export default function SchemeManagement() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  const [selectedStatus, setSelectedStatus] = React.useState('all')
  const [isAddSchemeOpen, setIsAddSchemeOpen] = React.useState(false)
  const [editingScheme, setEditingScheme] = React.useState<Scheme | null>(null)

  const [schemes, setSchemes] = React.useState<Scheme[]>([
    {
      id: 'scheme1',
      name: 'Pradhan Mantri Matru Vandana Yojana',
      nameHindi: 'प्रधानमंत्री मातृ वंदना योजना',
      category: 'cash',
      description: 'Cash incentive scheme for pregnant and lactating women',
      descriptionHindi: 'गर्भवती और स्तनपान कराने वाली महिलाओं के लिए नकद प्रोत्साहन योजना',
      eligibility: [
        'Pregnant women aged 19 years or above',
        'First living child only',
        'Registered on government health system'
      ],
      eligibilityHindi: [
        '19 वर्ष या उससे अधिक उम्र की गर्भवती महिलाएं',
        'केवल पहला जीवित बच्चा',
        'सरकारी स्वास्थ्य प्रणाली में पंजीकृत'
      ],
      requiredDocuments: [
        'Aadhar Card',
        'Bank Account Details',
        'Pregnancy Registration Card',
        'Income Certificate'
      ],
      applicationSteps: [
        'Register at nearest Anganwadi center',
        'Submit required documents',
        'Complete health checkups',
        'Receive direct bank transfer'
      ],
      helplineNumber: '1800-XXX-XXXX',
      activeDistricts: ['Allahabad', 'Varanasi', 'Kanpur'],
      status: 'active',
      beneficiaries: 847,
      views: 2341,
      applications: 156,
      lastUpdated: '2024-12-20',
      createdBy: 'Health Department'
    },
    {
      id: 'scheme2',
      name: 'Janani Suraksha Yojana',
      nameHindi: 'जननी सुरक्षा योजना',
      category: 'healthcare',
      description: 'Safe delivery and post-natal care scheme',
      descriptionHindi: 'सुरक्षित प्रसव और प्रसवोत्तर देखभाल योजना',
      eligibility: [
        'Pregnant women from BPL families',
        'Institutional delivery mandatory',
        'Age between 18-35 years'
      ],
      eligibilityHindi: [
        'बीपीएल परिवार की गर्भवती महिलाएं',
        'संस्थागत प्रसव अनिवार्य',
        '18-35 वर्ष की आयु'
      ],
      requiredDocuments: [
        'BPL Card',
        'Pregnancy Card',
        'Aadhar Card',
        'Bank Details'
      ],
      applicationSteps: [
        'Register at PHC/CHC',
        'Complete ANC visits',
        'Institutional delivery',
        'Receive cash benefit'
      ],
      helplineNumber: '1800-XXX-YYYY',
      activeDistricts: ['Allahabad', 'Varanasi'],
      status: 'active',
      beneficiaries: 623,
      views: 1876,
      applications: 89,
      lastUpdated: '2024-12-18',
      createdBy: 'NRHM'
    },
    {
      id: 'scheme3',
      name: 'Anemia Prevention Program',
      nameHindi: 'एनीमिया रोकथाम कार्यक्रम',
      category: 'nutrition',
      description: 'Iron and Folic Acid supplementation program',
      descriptionHindi: 'आयरन और फोलिक एसिड पूरक कार्यक्रम',
      eligibility: [
        'All pregnant women',
        'Adolescent girls (10-19 years)',
        'Lactating mothers up to 6 months'
      ],
      eligibilityHindi: [
        'सभी गर्भवती महिलाएं',
        'किशोर लड़कियां (10-19 वर्ष)',
        '6 महीने तक की स्तनपान कराने वाली माताएं'
      ],
      requiredDocuments: [
        'Health Card',
        'Age Proof',
        'Pregnancy Test (if applicable)'
      ],
      applicationSteps: [
        'Visit nearest ASHA worker',
        'Health assessment',
        'Receive IFA tablets',
        'Regular monitoring'
      ],
      helplineNumber: '1800-XXX-ZZZZ',
      activeDistricts: ['Allahabad', 'Varanasi', 'Kanpur', 'Lucknow'],
      status: 'active',
      beneficiaries: 1234,
      views: 3456,
      applications: 234,
      lastUpdated: '2024-12-25',
      createdBy: 'Nutrition Mission'
    }
  ])

  const analytics: SchemeAnalytics = {
    totalSchemes: schemes.length,
    activeSchemes: schemes.filter(s => s.status === 'active').length,
    totalViews: schemes.reduce((sum, s) => sum + s.views, 0),
    totalApplications: schemes.reduce((sum, s) => sum + s.applications, 0),
    eligibleWomen: 2847,
    informedWomen: 1923,
    appliedWomen: 479
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition': return Heart
      case 'cash': return DollarSign
      case 'healthcare': return Activity
      case 'education': return FileText
      default: return Award
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition': return 'bg-pink-100 text-pink-700 border-pink-300'
      case 'cash': return 'bg-green-100 text-green-700 border-green-300'
      case 'healthcare': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'education': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300'
      case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.nameHindi.includes(searchTerm)
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || scheme.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <RoleBasedLayout role="ngo_partner">
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Scheme Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage government schemes and ensure correct reach • योजना प्रबंधन
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsAddSchemeOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add New Scheme
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{analytics.activeSchemes}</div>
                  <div className="text-sm text-gray-600">Active Schemes</div>
                  <div className="text-xs text-gray-500">of {analytics.totalSchemes} total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                  <div className="text-xs text-blue-600">via app engagement</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{analytics.informedWomen.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Women Informed</div>
                  <div className="text-xs text-green-600">{Math.round((analytics.informedWomen/analytics.eligibleWomen)*100)}% of eligible</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Target className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{analytics.appliedWomen}</div>
                  <div className="text-sm text-gray-600">Applications</div>
                  <div className="text-xs text-yellow-600">{Math.round((analytics.appliedWomen/analytics.informedWomen)*100)}% conversion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search schemes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="cash">Cash Benefits</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schemes List */}
        <div className="space-y-4">
          {filteredSchemes.map((scheme, index) => {
            const CategoryIcon = getCategoryIcon(scheme.category)
            return (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                      <div className="lg:col-span-2">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getCategoryColor(scheme.category)}`}>
                            <CategoryIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <div>
                                <h3 className="text-lg font-semibold">{scheme.name}</h3>
                                <p className="text-gray-600 text-sm">{scheme.nameHindi}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={getCategoryColor(scheme.category)}>
                                  {scheme.category}
                                </Badge>
                                <Badge className={getStatusColor(scheme.status)}>
                                  {scheme.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{scheme.description}</p>
                            <p className="text-gray-600 text-xs">{scheme.descriptionHindi}</p>
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                              {scheme.activeDistricts.map(district => (
                                <Badge key={district} variant="outline" className="text-xs">
                                  {district}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-indigo-600">{scheme.beneficiaries}</div>
                            <div className="text-xs text-gray-600">Beneficiaries</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">{scheme.views}</div>
                            <div className="text-xs text-gray-600">Views</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">{scheme.applications}</div>
                            <div className="text-xs text-gray-600">Applied</div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated: {new Date(scheme.lastUpdated).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            Helpline: {scheme.helplineNumber}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingScheme(scheme)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                          Archive
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Smart Matching Insights */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Smart Matching Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">87%</div>
                <div className="text-sm text-gray-600">Women Eligible</div>
                <div className="text-xs text-gray-500">for at least one scheme</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">68%</div>
                <div className="text-sm text-gray-600">Informed Rate</div>
                <div className="text-xs text-gray-500">heard about schemes</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">25%</div>
                <div className="text-sm text-gray-600">Application Rate</div>
                <div className="text-xs text-gray-500">from informed women</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Scheme Dialog */}
        <Dialog open={isAddSchemeOpen || editingScheme !== null} onOpenChange={(open) => {
          if (!open) {
            setIsAddSchemeOpen(false)
            setEditingScheme(null)
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingScheme ? 'Edit Scheme' : 'Add New Scheme'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="schemeName">Scheme Name (English)</Label>
                <Input id="schemeName" placeholder="Enter scheme name" />
              </div>
              <div>
                <Label htmlFor="schemeNameHindi">Scheme Name (Hindi)</Label>
                <Input id="schemeNameHindi" placeholder="योजना का नाम" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="cash">Cash Benefits</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (English)</Label>
                <Textarea id="description" placeholder="Enter scheme description" />
              </div>
              <div>
                <Label htmlFor="descriptionHindi">Description (Hindi)</Label>
                <Textarea id="descriptionHindi" placeholder="योजना का विवरण" />
              </div>
              <div>
                <Label htmlFor="helpline">Helpline Number</Label>
                <Input id="helpline" placeholder="1800-XXX-XXXX" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddSchemeOpen(false)
                  setEditingScheme(null)
                }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {editingScheme ? 'Update Scheme' : 'Create Scheme'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleBasedLayout>
  )
}