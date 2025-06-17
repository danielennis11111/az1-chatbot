import { NextRequest, NextResponse } from 'next/server'
import { 
  initializeKnowledgeBase, 
  saveUploadedFile, 
  addPdfFile,
  getUploadedFiles,
  rebuildKnowledgeBase
} from '@/lib/rag'

// Initialize the knowledge base
export async function GET() {
  try {
    const files = await getUploadedFiles()
    return NextResponse.json({ 
      success: true, 
      files,
      message: `Found ${files.length} uploaded files` 
    })
  } catch (error) {
    console.error('Error getting knowledge base status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get knowledge base status' },
      { status: 500 }
    )
  }
}

// Handle file uploads
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'rebuild') {
      console.log('Manual knowledge base rebuild requested')
      await rebuildKnowledgeBase()
      return NextResponse.json({ 
        success: true, 
        message: 'Knowledge base rebuilt successfully with enhanced content catalog processing' 
      })
    } else {
      console.log('Initializing knowledge base')
      await initializeKnowledgeBase()
      return NextResponse.json({ 
        success: true, 
        message: 'Knowledge base initialized successfully' 
      })
    }
  } catch (error) {
    console.error('Error managing knowledge base:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to manage knowledge base' },
      { status: 500 }
    )
  }
}

// Get list of uploaded files
export async function OPTIONS() {
  try {
    const files = await getUploadedFiles()
    return NextResponse.json({ success: true, files })
  } catch (error) {
    console.error('Error getting uploaded files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get uploaded files' },
      { status: 500 }
    )
  }
} 