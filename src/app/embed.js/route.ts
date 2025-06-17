import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the embed.js file from public directory
    const embedPath = path.join(process.cwd(), 'public', 'embed.js')
    const embedScript = fs.readFileSync(embedPath, 'utf8')

    return new Response(embedScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error serving embed script:', error)
    return NextResponse.json(
      { error: 'Script not found' },
      { status: 404 }
    )
  }
} 