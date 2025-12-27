'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter,
  ChevronRight,
  AlertTriangle,
  Baby,
  Phone,
  MapPin,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Mock beneficiaries data
const mockBeneficiaries = [
  {
    id: '1',
    name: 'Sunita Devi',
    age: 28,
    village: 'Rampur',
    phone: '9876543210',
    isPregnant: true,
    pregnancyWeek: 32,
    isHighRisk: true,
    riskFactors: ['anemia', 'previous_complications'],
    lastVisit: '2 days ago',
  },
  {
    id: '2',
    name: 'Meena Kumari',
    age: 24,
    village: 'Sitapur',
    phone: '9876543211',
    isPregnant: true,
    pregnancyWeek: 20,
    isHighRisk: false,
    riskFactors: [],
    lastVisit: '1 week ago',
  },
  {
    id: '3',
    name: 'Priya Sharma',
    age: 22,
    village: 'Rampur',
    phone: '9876543212',
    isPregnant: false,
    isHighRisk: false,
    riskFactors: [],
    lastVisit: '3 days ago',
  },
  {
    id: '4',
    name: 'Kavita Yadav',
    age: 30,
    village: 'Sitapur',
    phone: '9876543213',
    isPregnant: true,
    pregnancyWeek: 38,
    isHighRisk: true,
    riskFactors: ['high_bp', 'gestational_diabetes'],
    lastVisit: '1 day ago',
  },
  {
    id: '5',
    name: 'Anita Devi',
    age: 26,
    village: 'Rampur',
    phone: '9876543214',
    isPregnant: true,
    pregnancyWeek: 16,
    isHighRisk: false,
    riskFactors: [],
    lastVisit: '5 days ago',
  },
]

export default function BeneficiariesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filter, setFilter] = React.useState<'all' | 'pregnant' | 'high_risk'>('all')

  const filteredBeneficiaries = mockBeneficiaries.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.village.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'pregnant') return matchesSearch && b.isPregnant
    if (filter === 'high_risk') return matchesSearch && b.isHighRisk
    return matchesSearch
  })

  const stats = {
    total: mockBeneficiaries.length,
    pregnant: mockBeneficiaries.filter(b => b.isPregnant).length,
    highRisk: mockBeneficiaries.filter(b => b.isHighRisk).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
          <p className="text-emerald-600 font-hindi">लाभार्थी</p>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-3"
      >
        <Card className="border-emerald-100">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-pink-600">{stats.pregnant}</p>
            <p className="text-xs text-gray-500">Pregnant</p>
          </CardContent>
        </Card>
        <Card className="border-red-100 bg-red-50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
            <p className="text-xs text-gray-500">High Risk</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name or village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-emerald-200"
          />
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="grid grid-cols-3 bg-emerald-50">
          <TabsTrigger value="all" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            All
          </TabsTrigger>
          <TabsTrigger value="pregnant" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Pregnant
          </TabsTrigger>
          <TabsTrigger value="high_risk" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            High Risk
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Beneficiary List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {filteredBeneficiaries.map((beneficiary) => (
          <Link key={beneficiary.id} href={`/beneficiaries/${beneficiary.id}`}>
            <Card className={cn(
              'hover:shadow-md transition-shadow',
              beneficiary.isHighRisk ? 'border-l-4 border-l-red-500' : 'border-emerald-100'
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={cn(
                      beneficiary.isHighRisk ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    )}>
                      {beneficiary.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{beneficiary.name}</p>
                      {beneficiary.isHighRisk && (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{beneficiary.age} yrs</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {beneficiary.village}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {beneficiary.isPregnant && (
                        <Badge className="bg-pink-100 text-pink-700 text-xs">
                          <Baby className="w-3 h-3 mr-1" />
                          Week {beneficiary.pregnancyWeek}
                        </Badge>
                      )}
                      {beneficiary.isHighRisk && (
                        <Badge variant="destructive" className="text-xs">
                          High Risk
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <a 
                      href={`tel:${beneficiary.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <span className="text-xs text-gray-400">{beneficiary.lastVisit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredBeneficiaries.length === 0 && (
          <Card className="border-emerald-100">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No beneficiaries found</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

