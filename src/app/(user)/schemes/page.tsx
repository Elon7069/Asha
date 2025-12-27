'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Search,
  Filter,
  ExternalLink,
  Phone,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getSupabaseClient } from '@/lib/supabase/client'

interface Scheme {
  id: string
  scheme_name: string
  scheme_name_hindi: string
  scheme_category: string
  short_description: string
  benefits: string
  benefits_hindi: string
  eligibility_criteria: string
  how_to_apply: string
  how_to_apply_hindi: string
  helpline_number: string
  is_active: boolean
}

export default function SchemesPage() {
  const [schemes, setSchemes] = React.useState<Scheme[]>([])
  const [filteredSchemes, setFilteredSchemes] = React.useState<Scheme[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchSchemes() {
      try {
        const supabase = getSupabaseClient()
        const { data } = await supabase
          .from('govt_schemes')
          .select('*')
          .eq('is_active', true)
          .order('views_count', { ascending: false })

        if (data) {
          setSchemes(data as Scheme[])
          setFilteredSchemes(data as Scheme[])
        }
      } catch (error) {
        console.error('Error fetching schemes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchemes()
  }, [])

  React.useEffect(() => {
    let filtered = schemes

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.scheme_category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.scheme_name.toLowerCase().includes(query) ||
        s.scheme_name_hindi.includes(query) ||
        s.short_description?.toLowerCase().includes(query)
      )
    }

    setFilteredSchemes(filtered)
  }, [searchQuery, selectedCategory, schemes])

  const categories = [
    { value: 'all', label: 'All Categories', labelHindi: 'सभी श्रेणियां' },
    { value: 'nutrition', label: 'Nutrition', labelHindi: 'पोषण' },
    { value: 'financial', label: 'Financial', labelHindi: 'वित्तीय' },
    { value: 'healthcare', label: 'Healthcare', labelHindi: 'स्वास्थ्य सेवा' },
    { value: 'education', label: 'Education', labelHindi: 'शिक्षा' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Government Schemes</h1>
        <p className="text-pink-600 font-hindi">सरकारी योजनाएं</p>
        <p className="text-gray-600 text-sm mt-2">
          Find schemes you're eligible for
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search schemes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 min-h-[56px]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.value)}
                className="min-h-[56px]"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schemes List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading schemes...</p>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No schemes found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchemes.map((scheme) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-pink-100 hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{scheme.scheme_name_hindi}</CardTitle>
                      <p className="text-sm text-gray-500">{scheme.scheme_name}</p>
                    </div>
                    <Badge className="bg-pink-100 text-pink-700">
                      {scheme.scheme_category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 mb-4 flex-1">
                    {scheme.short_description || scheme.benefits_hindi}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-pink-100">
                    {scheme.helpline_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{scheme.helpline_number}</span>
                      </div>
                    )}

                    <Link href={`/schemes/${scheme.id}`}>
                      <Button className="w-full bg-pink-500 hover:bg-pink-600" size="lg">
                        View Details
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

