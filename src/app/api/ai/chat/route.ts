import { NextRequest, NextResponse } from 'next/server'
import { chatWithAshaDidi, type ChatMessage } from '@/lib/ai/mistral'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [], language = 'hi', sessionId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get AI response
    const response = await chatWithAshaDidi(
      message,
      conversationHistory as ChatMessage[],
      language
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
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

