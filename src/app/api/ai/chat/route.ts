import { NextRequest, NextResponse } from 'next/server'
import { chatWithAshaDidi, type ChatMessage } from '@/lib/ai/mistral'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check for Mistral API key
    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY is not configured')
      return NextResponse.json(
        { 
          error: 'AI service is not configured. Please contact support.',
          details: process.env.NODE_ENV === 'development' ? 'MISTRAL_API_KEY environment variable is missing' : undefined
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { message, conversationHistory = [], language = 'hi', sessionId } = body

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    // Validate language
    if (language && language !== 'hi' && language !== 'en') {
      return NextResponse.json(
        { error: 'Language must be either "hi" or "en"' },
        { status: 400 }
      )
    }

    // Get AI response
    const response = await chatWithAshaDidi(
      message,
      conversationHistory as ChatMessage[],
      language || 'hi'
    )

    // Save to chat history if user is authenticated
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user && sessionId) {
        // Get the user's ASHA user record
        const { data: ashaUser } = await supabase
          .from('asha_users')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (ashaUser) {
          // Get the next message sequence
          const { data: lastMessage } = await supabase
            .from('asha_chat_history')
            .select('message_sequence')
            .eq('session_id', sessionId)
            .order('message_sequence', { ascending: false })
            .limit(1)
            .single()

          const nextSequence = (lastMessage?.message_sequence || 0) + 1

          // Save the chat message
          await supabase.from('asha_chat_history').insert({
            user_id: ashaUser.id,
            session_id: sessionId,
            message_sequence: nextSequence,
            user_message: message,
            ai_response: response.message,
            ai_model_used: 'mistral-large',
            intent_detected: response.intent,
            category: response.category,
            language_used: language,
            contains_sensitive_info: response.isEmergency,
          })

          // Update user's voice interaction count
          await supabase
            .from('asha_users')
            .update({ 
              total_voice_interactions: ashaUser.id ? 1 : 1,
              last_active_at: new Date().toISOString()
            })
            .eq('id', ashaUser.id)
        }
      }
    } catch (dbError) {
      console.error('Error saving chat history:', dbError)
      // Continue even if saving fails
    }

    return NextResponse.json({
      message: response.message,
      isEmergency: response.isEmergency,
      intent: response.intent,
      category: response.category,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process chat message'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Check for specific error types
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage = 'AI service authentication failed. Please contact support.'
        statusCode = 503
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        errorMessage = 'Service is temporarily unavailable. Please try again later.'
        statusCode = 429
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
        statusCode = 503
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: statusCode }
    )
  }
}

