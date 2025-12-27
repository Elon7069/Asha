import { NextRequest, NextResponse } from 'next/server'
import { pipeline } from '@xenova/transformers'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { spawn } from 'child_process'
import ffmpegStatic from 'ffmpeg-static'

export const runtime = 'nodejs'

// Initialize the ASR pipeline
let transcriber: any = null
let isModelLoading = false
let modelLoadPromise: Promise<any> | null = null

// Use whisper-base which is more compatible and stable than whisper-small
const WHISPER_MODEL = 'Xenova/whisper-base'

// Function to convert audio to WAV format using FFmpeg
async function convertToWav(inputPath: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    if (!ffmpegStatic) {
      reject(new Error('FFmpeg not available'))
      return
    }

    const ffmpeg = spawn(ffmpegStatic, [
      '-i', inputPath,
      '-ar', '16000', // 16kHz sample rate (Whisper requirement)
      '-ac', '1',     // Mono channel
      '-f', 'f32le',  // Output as 32-bit float PCM
      '-'             // Output to stdout
    ])

    const chunks: Buffer[] = []
    
    ffmpeg.stdout.on('data', (chunk) => {
      chunks.push(chunk)
    })

    ffmpeg.stderr.on('data', (data) => {
      console.log('FFmpeg stderr:', data.toString())
    })

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg process exited with code ${code}`))
        return
      }
      
      try {
        const audioBuffer = Buffer.concat(chunks)
        const audioArray = new Float32Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.length / 4)
        
        console.log('Audio converted:', {
          samples: audioArray.length,
          duration: audioArray.length / 16000,
          sampleRate: 16000
        })
        
        resolve(audioArray)
      } catch (err) {
        reject(new Error(`Failed to process audio data: ${err}`))
      }
    })

    ffmpeg.on('error', (err) => {
      reject(new Error(`FFmpeg error: ${err.message}`))
    })
  })
}

async function getTranscriber() {
  if (transcriber) {
    return transcriber
  }

  if (isModelLoading && modelLoadPromise) {
    console.log('Model is already loading, waiting...')
    return await modelLoadPromise
  }

  isModelLoading = true
  modelLoadPromise = (async () => {
    try {
      console.log(`Loading Whisper model (${WHISPER_MODEL})...`)
      console.log('This may take a few minutes on first run as the model needs to be downloaded.')
      
      transcriber = await pipeline(
        'automatic-speech-recognition', 
        WHISPER_MODEL, 
        {
          progress_callback: (progress: any) => {
            if (progress.status === 'downloading') {
              console.log(`Downloading model: ${Math.round(progress.progress || 0)}%`)
            } else if (progress.status === 'loading') {
              console.log('Loading model into memory...')
            } else if (progress.status === 'ready') {
              console.log('Model ready for transcription')
            }
          }
        } as any
      )
      
      console.log(`Whisper model (${WHISPER_MODEL}) loaded successfully`)
      isModelLoading = false
      return transcriber
    } catch (error) {
      isModelLoading = false
      modelLoadPromise = null
      console.error('Error initializing Whisper transcriber:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to load Whisper model: ${errorMessage}`)
    }
  })()

  return await modelLoadPromise
}

export async function POST(request: NextRequest) {
  let tempFilePath = ''
  let tempFileCreated = false
  
  try {
    console.log('Whisper transcription request received')
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log('Audio file received:', { 
      name: audioFile.name, 
      size: audioFile.size, 
      type: audioFile.type 
    })

    if (audioFile.size === 0) {
      return NextResponse.json({ error: 'Audio file is empty' }, { status: 400 })
    }

    const language = formData.get('language') as string || null
    console.log('Language requested:', language)

    const arrayBuffer = await audioFile.arrayBuffer()
    console.log('Audio buffer size:', arrayBuffer.byteLength)
    
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Audio file contains no data' }, { status: 400 })
    }

    const maxSize = 25 * 1024 * 1024
    if (arrayBuffer.byteLength > maxSize) {
      return NextResponse.json({ 
        error: 'Audio file is too large. Please record a shorter audio clip (max 25MB).' 
      }, { status: 400 })
    }

    console.log('Initializing Whisper transcriber...')
    
    let transcriberInstance
    try {
      transcriberInstance = await getTranscriber()
    } catch (modelError) {
      console.error('Failed to load Whisper model:', modelError)
      return NextResponse.json(
        { 
          error: 'Failed to load transcription model. Please try again in a moment.',
          details: process.env.NODE_ENV === 'development' 
            ? (modelError instanceof Error ? modelError.message : String(modelError))
            : undefined
        },
        { status: 503 }
      )
    }
    
    const options: any = {
      return_timestamps: false,
    }
    
    if (language) {
      const langMap: Record<string, string> = {
        'hi': 'hindi',
        'en': 'english',
        'hi-IN': 'hindi',
        'en-US': 'english',
      }
      options.language = langMap[language] || language
      console.log('Using language:', options.language)
    }
    
    console.log('Transcribing audio...')
    
    const ext = audioFile.name.split('.').pop() || 'webm'
    tempFilePath = join(tmpdir(), `whisper-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`)
    
    await writeFile(tempFilePath, Buffer.from(arrayBuffer))
    tempFileCreated = true
    console.log('Audio file written to temporary location:', tempFilePath)
    
    console.log('Converting audio using FFmpeg...')
    const audioData = await convertToWav(tempFilePath)
    
    const result = await transcriberInstance(audioData, options)
    console.log('Transcription completed')
    
    // Clean up temp file
    if (tempFileCreated) {
      try {
        await unlink(tempFilePath)
        console.log('Temporary file cleaned up')
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError)
      }
    }
    
    if (!result || !result.text || result.text.trim().length === 0) {
      console.warn('Transcription returned empty result')
      return NextResponse.json({ 
        error: 'No speech detected. Please speak more clearly and try again.' 
      }, { status: 400 })
    }
    
    console.log('Transcription successful:', {
      textLength: result.text.length,
      textPreview: result.text.substring(0, 100),
    })
    
    return NextResponse.json({
      transcript: result.text,
      confidence: result.chunks?.[0]?.confidence || 0,
      language: result.language || language || 'auto'
    })
    
  } catch (error: any) {
    console.error('Whisper transcription error:', error)
    
    // Clean up temp file on error
    if (tempFileCreated && tempFilePath) {
      try {
        await unlink(tempFilePath)
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file on error:', cleanupError)
      }
    }
    
    let errorMessage = 'Failed to transcribe audio'
    if (error.message) {
      errorMessage = error.message
    }
    
    if (errorMessage.includes('model') || errorMessage.includes('download')) {
      errorMessage = 'Failed to load transcription model. Please try again.'
    } else if (errorMessage.includes('memory') || errorMessage.includes('allocation')) {
      errorMessage = 'Insufficient memory to process audio. Please try a shorter recording.'
    } else if (errorMessage.includes('FFmpeg')) {
      errorMessage = 'Failed to process audio format. Please try recording again.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
