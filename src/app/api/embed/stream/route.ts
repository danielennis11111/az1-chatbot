import { NextResponse } from 'next/server'
import { streamChatResponse } from '@/lib/gemini'
import { RateLimiter } from '@/lib/rateLimit'

// Allowed origins for embed usage - you can add your domains here
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://az-1.info',
  'https://www.az-1.info',
  // Add your client domains here
]

export async function POST(req: Request) {
  try {
    // Check origin for security
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    
    // For development, allow localhost. For production, check allowed origins
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isAllowedOrigin = isDevelopment || 
      ALLOWED_ORIGINS.some(allowedOrigin => 
        origin?.startsWith(allowedOrigin) || referer?.startsWith(allowedOrigin)
      )

    if (!isAllowedOrigin) {
      return NextResponse.json(
        { error: 'Unauthorized origin', message: 'This domain is not authorized to use the embed widget' },
        { status: 403 }
      )
    }

    const { messages, embedKey } = await req.json()

    // Validate embed key (this would check against your cloud storage)
    if (!embedKey || embedKey !== process.env.EMBED_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid embed key', message: 'Invalid API key for embed usage' },
        { status: 401 }
      )
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format', message: 'Invalid message format' },
        { status: 400 }
      )
    }

    // Check rate limit (stricter for embed usage)
    const { canProceed, timeToWait } = RateLimiter.checkLimit()
    if (!canProceed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          timeToWait,
          message: `Please wait ${RateLimiter.formatTimeToWait(timeToWait)} before sending another message.`
        },
        { status: 429 }
      )
    }

    try {
      console.log('Processing embed streaming messages:', messages.length, 'from origin:', origin)
      
      // Get streaming response (data collection disabled for embed by default)
      const streamResponse = await streamChatResponse(messages)
      
      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    } catch (error) {
      console.error('Gemini API Error in embed:', error)
      return NextResponse.json(
        { 
          error: 'Failed to get response from AI',
          message: 'I encountered an error while processing your request. Please try again.'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Embed API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// Handle CORS preflight requests
export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin')
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isAllowedOrigin = isDevelopment || 
    ALLOWED_ORIGINS.some(allowedOrigin => origin?.startsWith(allowedOrigin))

  if (!isAllowedOrigin) {
    return new Response(null, { status: 403 })
  }

  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
} 