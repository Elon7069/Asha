import { Mistral } from '@mistralai/mistralai'

// Initialize Mistral client
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
})

// Export for use in API routes
export const mistralClient = mistral

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResponse {
  message: string
  isEmergency: boolean
  intent: string | null
  category: string | null
}

// Emergency keywords in Hindi and English
const EMERGENCY_KEYWORDS = [
  // Hindi
  'खून', 'bleeding', 'बहुत दर्द', 'तेज़ दर्द', 'severe pain',
  'behosh', 'बेहोश', 'unconscious', 'chakkar', 'चक्कर', 'dizzy',
  'bukhar', 'बुखार', 'fever', 'emergency', 'इमरजेंसी',
  'help', 'मदद', 'bachao', 'बचाओ', 'jaldi', 'जल्दी',
  'hospital', 'अस्पताल', 'doctor', 'डॉक्टर',
  // Danger signs
  'baby not moving', 'बच्चा नहीं हिल रहा', 'convulsion', 'दौरा',
  'water broke', 'पानी टूट गया', 'labour', 'प्रसव पीड़ा'
]

// Check if message contains emergency keywords
function detectEmergency(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return EMERGENCY_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  )
}

// Detect intent from message
function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('period') || lowerMessage.includes('mahina') || lowerMessage.includes('माहवारी') || lowerMessage.includes('mc')) {
    return 'menstrual_query'
  }
  if (lowerMessage.includes('pregnant') || lowerMessage.includes('garbh') || lowerMessage.includes('गर्भ') || lowerMessage.includes('baby')) {
    return 'pregnancy_query'
  }
  if (lowerMessage.includes('food') || lowerMessage.includes('khana') || lowerMessage.includes('खाना') || lowerMessage.includes('diet') || lowerMessage.includes('iron')) {
    return 'nutrition_query'
  }
  if (lowerMessage.includes('sad') || lowerMessage.includes('udas') || lowerMessage.includes('उदास') || lowerMessage.includes('tension') || lowerMessage.includes('stress')) {
    return 'mental_health_query'
  }
  if (lowerMessage.includes('scheme') || lowerMessage.includes('yojana') || lowerMessage.includes('योजना') || lowerMessage.includes('benefit')) {
    return 'scheme_query'
  }
  if (lowerMessage.includes('ifa') || lowerMessage.includes('tablet') || lowerMessage.includes('goli') || lowerMessage.includes('गोली')) {
    return 'ifa_query'
  }
  
  return 'general_query'
}

// Detect category from intent
function detectCategory(intent: string): string {
  const categoryMap: Record<string, string> = {
    'menstrual_query': 'menstrual_health',
    'pregnancy_query': 'pregnancy',
    'nutrition_query': 'nutrition',
    'mental_health_query': 'mental_health',
    'scheme_query': 'schemes',
    'ifa_query': 'nutrition',
    'general_query': 'general'
  }
  return categoryMap[intent] || 'general'
}

export async function chatWithAshaDidi(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  language: string = 'hi'
): Promise<ChatResponse> {
  const isEmergency = detectEmergency(userMessage)
  const intent = detectIntent(userMessage)
  const category = detectCategory(intent)

  // If emergency detected, return immediate response
  if (isEmergency) {
    const emergencyResponse = language === 'hi' 
      ? 'यह गंभीर लग रहा है। कृपया तुरंत Red Zone बटन दबाएं या अपनी ASHA दीदी को बुलाएं। क्या आप ठीक हैं?'
      : 'This sounds serious. Please press the Red Zone button immediately or call your ASHA worker. Are you okay?'
    
    return {
      message: emergencyResponse,
      isEmergency: true,
      intent: 'emergency',
      category: 'emergency'
    }
  }

  const systemPrompt = `You are "Asha Didi" (आशा दीदी), a trusted maternal health companion for rural Indian women. You are like a caring elder sister or trusted neighbor who provides health guidance with warmth and empathy.

CORE PERSONALITY:
- Warm, motherly, non-judgmental, and approachable
- Speaks like a trusted family member, not a formal doctor
- Uses simple, everyday language that rural women can easily understand
- Always validates feelings and concerns before giving advice
- Shows genuine care and concern for the user's wellbeing

CULTURAL CONTEXT:
- You understand rural Indian healthcare challenges and constraints
- You know about local foods, traditions, and cultural practices
- You respect traditional knowledge while providing evidence-based guidance
- You use familiar terms: "दीदी" (sister), "बहन" (sister), "बेटी" (daughter) when appropriate
- You reference local foods: दाल (dal), साग (saag), चना (chana), गुड़ (gur), हल्दी (turmeric)

RESPONSE RULES:
1. Keep responses up to 200 words for detailed explanations (${language === 'hi' ? 'Hindi responses should be natural and conversational' : 'English responses should be simple and clear'})
2. Use everyday language - avoid medical jargon completely
3. If user mentions emergency symptoms → immediately say: "${language === 'hi' ? 'यह गंभीर है। कृपया तुरंत Red Zone बटन दबाएं या अपनी ASHA दीदी को बुलाएं। क्या आप ठीक हैं?' : 'This is serious. Please press the Red Zone button immediately or call your ASHA worker. Are you okay?'}"
4. NEVER diagnose - always refer to ASHA worker or doctor for serious symptoms
5. Provide comfort first, then actionable next steps
6. End with a caring question or encouragement to continue the conversation
7. Use examples from daily life that rural women can relate to

TOPICS YOU HANDLE:
- Period questions & irregularities (माहवारी के सवाल)
- Pregnancy symptoms & week-by-week guidance (गर्भावस्था के लक्षण)
- Nutrition advice using local foods (दाल, साग, चना, गुड़, हरी सब्जियां)
- IFA tablet reminders and importance (आयरन की गोली)
- Mental health check-ins (light, supportive, non-diagnostic)
- Government scheme information (सरकारी योजनाएं)
- Danger sign education (खतरे के संकेत)
- General health questions (सामान्य स्वास्थ्य सवाल)

LANGUAGE REQUIREMENTS:
${language === 'hi' 
  ? '- Respond ONLY in Hindi using Devanagari script\n- Use natural, conversational Hindi with common rural phrases\n- Avoid English words unless absolutely necessary (like "ASHA", "Red Zone")\n- Use respectful forms: आप (you - formal) or तुम (you - friendly)\n- Include common Hindi health terms: दर्द (pain), बुखार (fever), चक्कर (dizziness), थकान (tiredness)'
  : '- Respond in simple, clear English\n- Use short sentences and common words\n- Avoid complex medical terminology\n- Be warm and supportive in tone'}

IMPORTANT: Always prioritize the user's safety. When in doubt about severity, encourage them to contact their ASHA worker or visit a health center.`

  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      maxTokens: 500, // Increased for 200 words (approximately 250-300 tokens for Hindi, 200-250 for English)
      temperature: 0.7,
    })

    const aiMessage = response.choices?.[0]?.message?.content || 
      (language === 'hi' ? 'माफ़ करें, कुछ गड़बड़ हो गई। कृपया फिर से कोशिश करें।' : 'Sorry, something went wrong. Please try again.')

    return {
      message: typeof aiMessage === 'string' ? aiMessage : String(aiMessage),
      isEmergency: false,
      intent,
      category
    }
  } catch (error) {
    console.error('Mistral API error:', error)
    return {
      message: language === 'hi' 
        ? 'माफ़ करें, अभी कुछ तकनीकी समस्या है। कृपया थोड़ी देर बाद कोशिश करें।'
        : 'Sorry, there is a technical issue. Please try again later.',
      isEmergency: false,
      intent: null,
      category: null
    }
  }
}

// Extract structured data from voice transcription (for ASHA visit logging)
export async function extractVisitData(transcription: string): Promise<Record<string, unknown>> {
  const systemPrompt = `You are a medical data extraction AI. Extract structured JSON from this ASHA worker's visit notes.

RULES:
- Output ONLY valid JSON, no markdown, no explanations
- Use null for missing fields
- Detect patient name from context
- Extract vital signs, symptoms, and actions taken

VISIT NOTES: "${transcription}"

OUTPUT FORMAT:
{
  "patient_name": string | null,
  "visit_type": "routine_checkup" | "emergency" | "follow_up" | null,
  "vitals": {
    "blood_pressure": { "systolic": number, "diastolic": number } | null,
    "weight_kg": number | null,
    "temperature_celsius": number | null
  },
  "symptoms": string[],
  "symptom_severity": "mild" | "moderate" | "severe" | null,
  "services_provided": string[],
  "medicines_distributed": string[],
  "counseling_topics": string[],
  "observations": string | null,
  "concerns_noted": string | null,
  "follow_up_required": boolean,
  "next_visit_date": "YYYY-MM-DD" | null,
  "referral_needed": boolean,
  "referral_reason": string | null
}`

  try {
    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcription }
      ],
      maxTokens: 500,
      temperature: 0.3,
    })

    const content = response.choices?.[0]?.message?.content || '{}'
    
    // Parse JSON from response - handle both plain JSON and markdown-wrapped JSON
    let jsonString = typeof content === 'string' ? content : String(content)
    
    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Extract JSON object
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        // Ensure all required fields have defaults
        return {
          patient_name: parsed.patient_name || null,
          visit_type: parsed.visit_type || null,
          vitals: parsed.vitals || {
            blood_pressure: null,
            weight_kg: null,
            temperature_celsius: null
          },
          symptoms: parsed.symptoms || [],
          symptom_severity: parsed.symptom_severity || null,
          services_provided: parsed.services_provided || [],
          medicines_distributed: parsed.medicines_distributed || [],
          counseling_topics: parsed.counseling_topics || [],
          observations: parsed.observations || null,
          concerns_noted: parsed.concerns_noted || null,
          follow_up_required: parsed.follow_up_required || false,
          next_visit_date: parsed.next_visit_date || null,
          referral_needed: parsed.referral_needed || false,
          referral_reason: parsed.referral_reason || null
        }
      } catch (e) {
        console.error('JSON parse error:', e)
        return {}
      }
    }
    return {}
  } catch (error) {
    console.error('Data extraction error:', error)
    return {}
  }
}

// Analyze symptoms for red flags
export async function analyzeSymptoms(
  symptoms: string[],
  isPregnant: boolean,
  pregnancyWeek?: number
): Promise<{
  isRedFlag: boolean
  riskScore: number
  recommendation: string
  reasons: string[]
}> {
  const context = isPregnant 
    ? `Patient is pregnant (week ${pregnancyWeek || 'unknown'}).`
    : 'Patient is not currently pregnant.'

  const systemPrompt = `You are a maternal health risk assessment assistant. Analyze the following symptoms and determine if they indicate a red flag condition.

${context}

Red flag conditions include:
- Heavy vaginal bleeding
- Severe abdominal pain
- High fever (>38°C)
- Severe headache with vision problems
- Seizures or convulsions
- Decreased or no fetal movement (after 20 weeks)
- Water breaking before 37 weeks
- Signs of preeclampsia (swelling, headache, vision changes)

Return a JSON object with:
- isRedFlag: boolean
- riskScore: number (0-100)
- recommendation: string (in simple language)
- reasons: array of strings explaining the assessment`

  try {
    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Symptoms: ${symptoms.join(', ')}` }
      ],
      maxTokens: 300,
      temperature: 0.2,
    })

    const content = response.choices?.[0]?.message?.content || '{}'
    const jsonMatch = typeof content === 'string' ? content.match(/\{[\s\S]*\}/) : null
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return {
      isRedFlag: false,
      riskScore: 0,
      recommendation: 'Unable to assess. Please consult your ASHA worker.',
      reasons: []
    }
  } catch (error) {
    console.error('Symptom analysis error:', error)
    return {
      isRedFlag: false,
      riskScore: 0,
      recommendation: 'Unable to assess. Please consult your ASHA worker.',
      reasons: []
    }
  }
}

