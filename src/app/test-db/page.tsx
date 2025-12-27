'use client'

import * as React from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DatabaseTestPage() {
  const [result, setResult] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)
  const [testEmail, setTestEmail] = React.useState('test@example.com')
  const [testPassword, setTestPassword] = React.useState('password123')

  const testNgoTable = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const supabase = getSupabaseClient()
      
      // Try to query the table structure
      const { data, error } = await supabase
        .from('ngo_partner_profiles')
        .select('*')
        .limit(1)

      if (error) {
        setResult(`❌ Table Error: ${error.message}\n\nThis likely means the ngo_partner_profiles table doesn't exist in your Supabase database.\n\nGo to Supabase Dashboard → SQL Editor → Run the SQL from create_ngo_table.sql`)
      } else {
        setResult(`✅ Table exists and is accessible! Found ${data?.length || 0} records.`)
      }
    } catch (err: any) {
      setResult(`Connection Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testRegistration = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const supabase = getSupabaseClient()
      
      // Test user registration
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: undefined // Skip email confirmation
        }
      })

      if (error) {
        setResult(`❌ Registration Error: ${error.message}`)
      } else if (data.user) {
        setResult(`✅ Registration successful!\nUser ID: ${data.user.id}\nEmail: ${data.user.email}\n\nYou can now try logging in with these credentials.`)
      }
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (error) {
        setResult(`❌ Login Error: ${error.message}`)
      } else if (data.user) {
        setResult(`✅ Login successful!\nUser ID: ${data.user.id}\nEmail: ${data.user.email}`)
      }
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔧 Database & Auth Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Use this page to test database tables and authentication without going through the full registration flow.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="database">Database Test</TabsTrigger>
          <TabsTrigger value="auth">Auth Test</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NGO Partner Profiles Table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testNgoTable} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test NGO Profiles Table'}
              </Button>
              
              {result && (
                <div className="p-4 bg-gray-100 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{result}</pre>
                </div>
              )}
              
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>If table doesn't exist:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Copy and run the SQL from <code>create_ngo_table.sql</code></li>
                  <li>Test again</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Test Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Test Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="password123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={testRegistration} disabled={loading} variant="outline">
                  {loading ? 'Testing...' : 'Test Registration'}
                </Button>
                <Button onClick={testLogin} disabled={loading} variant="outline">
                  {loading ? 'Testing...' : 'Test Login'}
                </Button>
              </div>
              
              {result && (
                <div className="p-4 bg-gray-100 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{result}</pre>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p><strong>Steps to fix login issues:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>First test registration with a new email</li>
                  <li>Then test login with the same credentials</li>
                  <li>If successful, the main registration should work</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-blue-200 bg-blue-50 mt-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600">ℹ️</div>
            <div>
              <h3 className="font-medium text-blue-900">Quick Links</h3>
              <div className="text-sm text-blue-700 mt-1 space-y-1">
                <div>• <a href="/register" className="underline">Registration Page</a></div>
                <div>• <a href="/login" className="underline">Login Page</a></div>
                <div>• <a href="/ngo-dashboard" className="underline">NGO Dashboard</a> (requires login)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}