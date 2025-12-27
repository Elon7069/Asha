import { NextRequest, NextResponse } from 'next/server'
import { pipeline } from '@xenova/transformers'

// Initialize the ASR pipeline
let transcriber: any = null

async function getTranscriber() {
  if (!transcriber) {
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {
      chunk_length_s: 30,
      stride_length_s: 5,
    })
  }
  return transcriber
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Convert file to array buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Get transcriber
    const transcriber = await getTranscriber()
    
    // Transcribe audio
    const result = await transcriber(uint8Array)
    
    return NextResponse.json({
      transcript: result.text || '',
      confidence: result.chunks?.[0]?.confidence || 0
    })
    
  } catch (error) {
    console.error('Whisper transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}