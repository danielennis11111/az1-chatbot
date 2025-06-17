import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain')
  
  // For production, you'd validate the domain against your allowed list
  // For now, we'll return a basic config
  
  const config = {
    apiEndpoint: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/embed/stream'
      : 'https://az-1.info/api/embed/stream',
    theme: {
      primaryColor: '#00797D',
      secondaryColor: '#634B7B',
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
    },
    ui: {
      position: 'bottom-right',
      zIndex: 999999,
      borderRadius: '12px',
      shadow: '0 10px 40px rgba(0,0,0,0.1)',
    },
    messages: {
      welcomeMessage: 'Hi! I\'m your Arizona Digital Navigator. How can I help you with broadband and digital skills today?',
      placeholder: 'Type your message here...',
      sendButton: 'Send',
    },
    features: {
      allowFileUpload: false,
      enableVoice: true,
      showTypingIndicator: true,
      enableMarkdown: true,
    }
  }

  return NextResponse.json(config, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
} 