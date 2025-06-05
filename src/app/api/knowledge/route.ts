import { NextRequest, NextResponse } from 'next/server'
import { 
  initializeKnowledgeBase, 
  saveUploadedFile, 
  addPdfFile,
  getUploadedFiles
} from '@/lib/rag'

// Initialize the knowledge base
export async function GET() {
  try {
    await initializeKnowledgeBase()
    return NextResponse.json({ success: true, message: 'Knowledge base initialized' })
  } catch (error) {
    console.error('Error initializing knowledge base:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize knowledge base' },
      { status: 500 }
    )
  }
}

// Handle file uploads
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Save the file
    const filePath = await saveUploadedFile(file.name, buffer)
    
    // Add to knowledge base
    await addPdfFile(filePath)
    
    return NextResponse.json({
      success: true,
      message: `File ${file.name} uploaded and added to knowledge base`,
      file: file.name
    })
  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process file upload' },
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