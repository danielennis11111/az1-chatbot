import { NextResponse } from 'next/server'
import { streamChatResponse } from '@/lib/gemini'
import { RateLimiter } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const { messages, dataCollectionEnabled = false } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format', message: 'Invalid message format' },
        { status: 400 }
      )
    }

    // Check rate limit
    const { canProceed, timeToWait } = RateLimiter.checkLimit()
    if (!canProceed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          timeToWait,
          message: `I need to rest for ${RateLimiter.formatTimeToWait(timeToWait)}. This helps me stay within my free usage limits. Please try again after that time.`
        },
        { status: 429 }
      )
    }

    try {
      console.log('Processing streaming messages:', messages.length, 'Data collection:', dataCollectionEnabled ? 'enabled' : 'disabled')
      
      // If data collection is enabled, we could save the messages to a database here
      if (dataCollectionEnabled) {
        // Example: await saveToDatabase(messages)
        console.log('Would save data to database (if implemented)')
      }
      
      // Get streaming response
      const streamResponse = await streamChatResponse(messages)
      
      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      })
    } catch (error) {
      console.error('Gemini API Error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to get response from AI',
          message: error instanceof Error ? error.message : 'I encountered an error while processing your request. Please try again.'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later.'
      },
      { status: 500 }
    )
  }
} 