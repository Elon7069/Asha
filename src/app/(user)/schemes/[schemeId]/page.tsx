'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Phone,
  ExternalLink,
  Calendar,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSupabaseClient } from '@/lib/supabase/client'

interface Scheme {
  id: string
  scheme_name: string
  scheme_name_hindi: string
  scheme_category: string
  description: string
  description_hindi: string
  eligibility_criteria: string
  eligibility_criteria_hindi: string
  benefits: string
  benefits_hindi: string
  how_to_apply: string
  how_to_apply_hindi: string
  required_documents: string[]
  helpline_number: string
  official_website_url: string
  contact_person: string
}

export default function SchemeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const schemeId = params.schemeId as string
  const [scheme, setScheme] = React.useState<Scheme | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchScheme() {
      try {
        const supabase = getSupabaseClient()
        const { data } = await supabase
          .from('govt_schemes')
          .select('*')
          .eq('id', schemeId)
          .single()

        if (data) {
          setScheme(data as Scheme)
          
          // Increment view count
          await supabase
            .from('govt_schemes')
            .update({ views_count: (data.views_count || 0) + 1 })
            .eq('id', schemeId)
        }
      } catch (error) {
        console.error('Error fetching scheme:', error)
      } finally {
        setLoading(false)
      }
    }

    if (schemeId) {
      fetchScheme()
    }
  }, [schemeId])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading scheme details...</p>
      </div>
    )
  }

  if (!scheme) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Scheme not found.</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Scheme Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-pink-500 to-rose-500 border-0 text-white">
          <CardContent className="p-6">
            <Badge className="bg-white/20 text-white mb-4">
              {scheme.scheme_category}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{scheme.scheme_name_hindi}</h1>
            <p className="text-pink-100 text-lg">{scheme.scheme_name}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>About This Scheme</CardTitle>
            <p className="text-sm text-gray-500 font-hindi">इस योजना के बारे में</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{scheme.description_hindi}</p>
            <p className="text-gray-600 mt-2 text-sm">{scheme.description}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-green-100 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">Benefits</CardTitle>
            <p className="text-sm text-gray-500 font-hindi">लाभ</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{scheme.benefits_hindi}</p>
            <p className="text-gray-600 mt-2 text-sm">{scheme.benefits}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Eligibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Eligibility Criteria</CardTitle>
            <p className="text-sm text-gray-500 font-hindi">पात्रता मानदंड</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{scheme.eligibility_criteria_hindi || scheme.eligibility_criteria}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* How to Apply */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-blue-100 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700">How to Apply</CardTitle>
            <p className="text-sm text-gray-500 font-hindi">कैसे आवेदन करें</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">{scheme.how_to_apply_hindi || scheme.how_to_apply}</p>
            
            {scheme.required_documents && scheme.required_documents.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">Required Documents:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {scheme.required_documents.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <p className="text-sm text-gray-500 font-hindi">संपर्क जानकारी</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheme.helpline_number && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-sm text-gray-500">Helpline</p>
                  <a href={`tel:${scheme.helpline_number}`} className="text-lg font-semibold text-pink-600">
                    {scheme.helpline_number}
                  </a>
                </div>
              </div>
            )}

            {scheme.official_website_url && (
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a 
                    href={scheme.official_website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-pink-600 hover:underline"
                  >
                    Visit Official Website
                  </a>
                </div>
              </div>
            )}

            {scheme.contact_person && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="text-lg font-semibold text-gray-900">{scheme.contact_person}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

