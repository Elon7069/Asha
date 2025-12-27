import { NextRequest, NextResponse } from 'next/server'
import { chatWithAshaDidi, type ChatMessage } from '@/lib/ai/mistral'

// Emergency detection function
function detectEmergency(message: string): boolean {
  const emergencyKeywords = [
    // Hindi
    'खून', 'bleeding', 'बहुत दर्द', 'तेज़ दर्द', 'severe pain',
    'behosh', 'बेहोश', 'unconscious', 'chakkar', 'चक्कर', 'dizzy',
    'bukhar', 'बुखार', 'fever', 'emergency', 'इमरजेंसी',
    'help', 'मदद', 'bachao', 'बचाओ', 'jaldi', 'जल्दी',
    'hospital', 'अस्पताल', 'doctor', 'डॉक्टर',
    // Danger signs
    'baby not moving', 'बच्चा नहीं हिल रहा', 'convulsion', 'दौरा',
    'water broke', 'पानी टूट गया', 'labour', 'प्रसव पीड़ा',
    'heavy bleeding', 'ज्यादा खून', 'can\'t breathe', 'सांस नहीं आ रही'
  ]
  
  const lowerMessage = message.toLowerCase()
  return emergencyKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context = 'general', messages = [] } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Determine if this is an emergency
    const isEmergency = detectEmergency(message)
    
    // Build conversation history for ASHA Didi
    const conversationHistory: ChatMessage[] = messages.slice(-5).map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    // Get AI response using the existing chatWithAshaDidi function
    const response = await chatWithAshaDidi(
      message,
      conversationHistory,
      'hi' // Default to Hindi
    )

    return NextResponse.json({
      message: response.message,
      isEmergency: response.isEmergency || isEmergency,
      intent: response.intent,
      category: response.category,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}