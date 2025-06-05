'use server'

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { Document } from '@langchain/core/documents'
import { promises as fs } from 'fs'
import path from 'path'

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Use a consistent model name
const MODEL_NAME = 'gemini-2.0-flash'

// Directory for storing uploaded documents
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

// In-memory vector store for simplicity (would use a proper DB in production)
let documents: Document[] = []

/**
 * Ensure uploads directory exists
 */
async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating uploads directory:', error)
  }
}

/**
 * Split text into chunks
 */
async function splitText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  })
  
  const chunks = await splitter.splitText(text)
  return chunks
}

/**
 * Get embedding for a text using Gemini's embedding model
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Use the embedding model
    const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' })
    const result = await embeddingModel.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error('Error getting embedding:', error)
    // Return an empty array as fallback
    return []
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecB.length === 0) return 0
  
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0)
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0))
  
  // Avoid division by zero
  return magA && magB ? dotProduct / (magA * magB) : 0
}

/**
 * Save an uploaded file
 */
export async function saveUploadedFile(fileName: string, fileBuffer: Buffer): Promise<string> {
  await ensureUploadsDir()
  const filePath = path.join(UPLOADS_DIR, fileName)
  await fs.writeFile(filePath, fileBuffer)
  return filePath
}

/**
 * Get a list of all uploaded files
 */
export async function getUploadedFiles(): Promise<string[]> {
  await ensureUploadsDir()
  try {
    const files = await fs.readdir(UPLOADS_DIR)
    return files
  } catch (error) {
    console.error('Error reading uploads directory:', error)
    return []
  }
}

/**
 * Add a document to the knowledge base
 */
export async function addDocument(content: string, metadata: Record<string, any> = {}): Promise<void> {
  const chunks = await splitText(content)
  
  // Process chunks and add embeddings
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    
    // Get embedding for the chunk
    const embedding = await getEmbedding(chunk)
    
    documents.push(
      new Document({
        pageContent: chunk,
        metadata: {
          ...metadata,
          chunk: i,
          date_added: new Date().toISOString(),
          embedding: embedding, // Store the embedding with the document
        },
      })
    )
  }
  
  console.log(`Added ${chunks.length} chunks to knowledge base with embeddings`)
}

/**
 * Add a PDF file to the knowledge base using Gemini's PDF processing
 */
export async function addPdfFile(filePath: string): Promise<void> {
  try {
    // Read the PDF file
    const fileBuffer = await fs.readFile(filePath)
    const fileSize = fileBuffer.length
    
    // Check file size to determine processing method
    if (fileSize > 20 * 1024 * 1024) { // 20MB
      await addLargePdfFile(filePath, fileBuffer)
    } else {
      // For files under 20MB, process directly
      const model = genAI.getGenerativeModel({ model: MODEL_NAME })
      
      // Create a blob from the buffer for the fileData
      const blob = new Blob([fileBuffer], { type: 'application/pdf' })
      
      // Extract content from the PDF using Gemini's native PDF processing
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: Buffer.from(await blob.arrayBuffer()).toString('base64')
          }
        },
        "Extract the key information and main content from this document"
      ])
      
      // Add the extracted content to the knowledge base
      const extractedContent = result.response.text()
      await addDocument(extractedContent, {
        source: filePath,
        type: 'pdf',
        filename: path.basename(filePath),
      })
      
      console.log(`Added PDF file to knowledge base: ${filePath}`)
    }
  } catch (error) {
    console.error('Error adding PDF file:', error)
    throw new Error(`Failed to add PDF file: ${filePath}`)
  }
}

/**
 * Add a large PDF file using the Gemini File API
 */
export async function addLargePdfFile(filePath: string, fileBuffer?: Buffer): Promise<void> {
  try {
    // Read the file if buffer not provided
    if (!fileBuffer) {
      fileBuffer = await fs.readFile(filePath)
    }
    
    // For now, we'll handle large files the same way as small files
    // since the File API isn't fully implemented in the current SDK
    console.log('Large PDF file detected, processing with standard method')
    
    // Create a blob from the buffer for the fileData
    const blob = new Blob([fileBuffer], { type: 'application/pdf' })
    
    // Process with Gemini
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: Buffer.from(await blob.arrayBuffer()).toString('base64')
        }
      },
      "Extract the key information and main content from this document"
    ])
    
    // Add the extracted content to the knowledge base
    const extractedContent = result.response.text()
    await addDocument(extractedContent, {
      source: filePath,
      type: 'pdf',
      filename: path.basename(filePath),
    })
    
    console.log(`Added large PDF file to knowledge base: ${filePath}`)
  } catch (error) {
    console.error('Error adding large PDF file:', error)
    throw new Error(`Failed to add large PDF file: ${filePath}`)
  }
}

/**
 * Add a website to the knowledge base
 */
export async function addWebsite(url: string): Promise<void> {
  try {
    // Use Gemini to extract content from the website
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `Extract the main content and important information from this website: ${url}` }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
      }
    })
    
    // Add the extracted content to the knowledge base
    const extractedContent = result.response.text()
    await addDocument(extractedContent, {
      source: url,
      type: 'website',
    })
    
    console.log(`Added website to knowledge base: ${url}`)
  } catch (error) {
    console.error('Error adding website:', error)
    throw new Error(`Failed to add website: ${url}`)
  }
}

/**
 * Query the knowledge base using vector similarity search
 */
export async function queryKnowledgeBase(query: string, k: number = 5): Promise<Document[]> {
  try {
    // If no documents, return empty array
    if (documents.length === 0) {
      return []
    }
    
    // Get embedding for the query
    const queryEmbedding = await getEmbedding(query)
    
    // If embedding failed, fall back to keyword search
    if (queryEmbedding.length === 0) {
      console.log('Embedding failed, falling back to keyword search')
      return documents
        .filter(doc => doc.pageContent.toLowerCase().includes(query.toLowerCase()))
        .slice(0, k)
    }
    
    // Calculate cosine similarity with all documents
    const withSimilarity = documents.map(doc => {
      // Get document embedding
      const docEmbedding = doc.metadata.embedding || []
      
      // Calculate cosine similarity
      const similarity = cosineSimilarity(queryEmbedding, docEmbedding)
      return { doc, similarity }
    })
    
    // Sort by similarity and return top k
    return withSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .map(item => item.doc)
  } catch (error) {
    console.error('Error in vector search:', error)
    // Fall back to keyword search if vector search fails
    return documents
      .filter(doc => doc.pageContent.toLowerCase().includes(query.toLowerCase()))
      .slice(0, k)
  }
}

/**
 * Enhance a prompt with relevant context from the knowledge base
 */
export async function enhancePromptWithRAG(query: string): Promise<string> {
  try {
    if (documents.length === 0) {
      console.log('Knowledge base is empty, returning original query')
      return query
    }
    
    const relevantDocs = await queryKnowledgeBase(query)
    if (relevantDocs.length === 0) {
      return query
    }
    
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n')
    
    return `
Query: ${query}

Relevant context:
${context}

Based on the above context, please provide a comprehensive answer to the query.
`
  } catch (error) {
    console.error('Error enhancing prompt with RAG:', error)
    return query // Fall back to original query
  }
}

/**
 * Initialize the knowledge base with example content
 */
export async function initializeKnowledgeBase(): Promise<void> {
  try {
    // Clear existing documents
    documents = []
    
    // Example URLs
    const urls = [
      'https://az-1.info',
      'https://developers.arcgis.com/experience-builder/'
    ]
    
    // Add websites
    for (const url of urls) {
      try {
        await addWebsite(url)
      } catch (error) {
        console.error(`Error adding website ${url}:`, error)
      }
    }
    
    // Add existing PDFs
    const pdfFiles = (await getUploadedFiles()).filter(file => file.endsWith('.pdf'))
    for (const pdfFile of pdfFiles) {
      try {
        await addPdfFile(path.join(UPLOADS_DIR, pdfFile))
      } catch (error) {
        console.error(`Error adding PDF ${pdfFile}:`, error)
      }
    }
    
    console.log('Knowledge base initialized successfully')
  } catch (error) {
    console.error('Error initializing knowledge base:', error)
    throw error
  }
} 