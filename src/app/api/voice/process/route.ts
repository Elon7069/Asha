import { NextRequest, NextResponse } from 'next/server'
import { extractVisitData } from '@/lib/ai/mistral'

export const maxDuration = 60 // Allow up to 60 seconds for processing

/**
 * Voice Processing API - MVP Version
 * Option A: Accepts audio file, transcribes with Whisper, extracts data with Mistral
 * Option B: Accepts already-transcribed text and extracts data
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    let transcription: string
    
    // Option A: Audio file upload - transcribe first
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const audioFile = formData.get('audio') as File | null
      const language = formData.get('language') as string || 'hi'
      
      if (!audioFile) {
        return NextResponse.json(
          { error: 'No audio file provided' },
          { status: 400 }
        )
      }

      // Transcribe audio using Whisper endpoint
      const whisperFormData = new FormData()
      whisperFormData.append('audio', audioFile)
      whisperFormData.append('language', language)
      
      const host = request.headers.get('host') || 'localhost:3000'
      const protocol = host.includes('localhost') ? 'http' : 'https'
      
      const whisperResponse = await fetch(`${protocol}://${host}/api/whisper/transcribe`, {
        method: 'POST',
        body: whisperFormData,
      })

      if (!whisperResponse.ok) {
        const errorText = await whisperResponse.text()
        console.error('Whisper transcription failed:', errorText)
        return NextResponse.json(
          { error: 'Failed to transcribe audio', details: errorText },
          { status: 500 }
        )
      }

      const whisperResult = await whisperResponse.json()
      transcription = whisperResult.transcript
      
    // Option B: Already-transcribed text
    } else {
      const body = await request.json()
      transcription = body.transcription
    }

    if (!transcription || transcription.trim() === '') {
      return NextResponse.json(
        { error: 'No speech detected or transcription is empty' },
        { status: 400 }
      )
    }

    // Extract structured visit data using Mistral
    const extractedData = await extractVisitData(transcription)

    // Detect missing required fields for follow-up
    const missingFields: string[] = []
    
    if (!extractedData.patient_name) {
      missingFields.push('patient_name')
    }
    
    const vitals = extractedData.vitals as { blood_pressure?: unknown; weight_kg?: unknown; temperature_celsius?: unknown } | undefined
    if (!vitals || (!vitals.blood_pressure && !vitals.weight_kg && !vitals.temperature_celsius)) {
      missingFields.push('vitals')
    }
    
    if (!extractedData.visit_type) {
      missingFields.push('visit_type')
    }

    // Generate follow-up question in Hindi if data incomplete
    let followUpQuestion: string | null = null
    
    if (missingFields.length > 0) {
      const fieldQuestions: Record<string, string> = {
        patient_name: 'कृपया मरीज़ का नाम बताएं।',
        vitals: 'कृपया BP, वज़न या तापमान बताएं।',
        visit_type: 'यह कौन सी विज़िट है - routine checkup, follow up, या emergency?',
      }
      
      followUpQuestion = fieldQuestions[missingFields[0]] || null
    }

    // Calculate confidence score
    const totalFields = 10
    const filledFields = [
      extractedData.patient_name,
      extractedData.visit_type,
      vitals?.blood_pressure,
      vitals?.weight_kg,
      vitals?.temperature_celsius,
      Array.isArray(extractedData.symptoms) && extractedData.symptoms.length > 0,
      Array.isArray(extractedData.services_provided) && extractedData.services_provided.length > 0,
      extractedData.observations,
      extractedData.follow_up_required !== undefined,
      extractedData.referral_needed !== undefined,
    ].filter(Boolean).length
    
    const confidenceScore = Math.round((filledFields / totalFields) * 100) / 100

    return NextResponse.json({
      success: true,
      transcription,
      extractedData,
      confidenceScore,
      missingFields,
      followUpQuestion,
      isComplete: missingFields.length === 0,
    })
    
  } catch (error) {
    console.error('Voice processing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process voice recording',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

