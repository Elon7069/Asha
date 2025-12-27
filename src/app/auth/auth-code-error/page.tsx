'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ASHA AI</h1>
        </div>

        <Card className="border-pink-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Email Verification Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              There was an error verifying your email. This could happen if:
            </p>
            <ul className="text-sm text-gray-500 space-y-1 text-left">
              <li>• The verification link has expired</li>
              <li>• The link has already been used</li>
              <li>• There was a network error</li>
            </ul>
            <div className="pt-4">
              <Link href="/register">
                <Button className="w-full bg-pink-500 hover:bg-pink-600">
                  Try Registering Again
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-2 border-pink-200">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}