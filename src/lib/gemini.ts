'use server'

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { enhancePromptWithRAG } from './rag'
import { getRecommendedResources, searchResources, getEnhancedRecommendedResources } from './resources'
import { Resource } from '@/types/chat'
import { RateLimiter } from './rateLimit'
import { initializeKnowledgeBase } from './rag'

let genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key')
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

// Use the latest and best model
const MODEL_NAME = 'gemini-2.0-flash'

// Initialize knowledge base on demand
let knowledgeBaseInitialized = false

async function ensureKnowledgeBase() {
  if (!knowledgeBaseInitialized) {
    try {
      await initializeKnowledgeBase()
      knowledgeBaseInitialized = true
      console.log('Knowledge base initialized successfully')
    } catch (error) {
      console.error('Error initializing knowledge base:', error)
    }
  }
}

const SYSTEM_PROMPT = `Chatbot Persona:

You are a friendly AI chatbot helping someone who knows nothing about the internet. Speak in short, clear sentences. Use everyday examples and simple analogies. Keep answers concise and to the point. Break down complex ideas into easy steps. Cite sources like [Source: AZ-1 Content Catalog] when you reference the content catalog. If info isn't in the catalog, say so and explain in your own words.

When citing the content catalog, include the full entry as a formatted list with Title, Description, URL, Category, Audience, and Tags.

Core Knowledge Areas:
1. Digital literacy basics: what is the internet, how to connect, basic terminology.
2. Broadband in Arizona: availability, affordability programs, local resources.
3. Digital skills and troubleshooting: simple steps to fix common issues.
4. Resource recommendations: suggest relevant links and state their source.

Remember to remain patient, respectful, and use a warm, conversational tone.    `

/**
 * Detect user's skill level from their message
 */
function detectSkillLevel(message: string): 'beginner' | 'intermediate' | 'advanced' {
  const content = message.toLowerCase()
  
  // Beginner indicators
  const beginnerPhrases = [
    'new to', 'don\'t know', 'never used', 'first time', 'beginner',
    'don\'t understand', 'confused', 'help me start', 'what is',
    'how do i', 'i\'m not good with', 'not familiar'
  ]
  
  // Advanced indicators  
  const advancedPhrases = [
    'configure', 'settings', 'troubleshoot', 'optimize', 'technical',
    'specifications', 'bandwidth', 'latency', 'protocols'
  ]
  
  if (beginnerPhrases.some(phrase => content.includes(phrase))) {
    return 'beginner'
  }
  
  if (advancedPhrases.some(phrase => content.includes(phrase))) {
    return 'advanced' 
  }
  
  return 'intermediate'
}

/**
 * Analyze if user seems frustrated or upset
 */
function detectUserFrustration(message: string): boolean {
  const content = message.toLowerCase()
  const frustrationIndicators = [
    'frustrated', 'angry', 'mad', 'upset', 'annoying', 'stupid',
    'hate', 'terrible', 'awful', 'useless', 'doesn\'t work',
    'broken', 'give up', 'can\'t figure', 'too hard'
  ]
  
  return frustrationIndicators.some(indicator => content.includes(indicator))
}

export async function getChatResponse(messages: { role: string; content: string }[]) {
  try {
    // Ensure knowledge base is initialized
    await ensureKnowledgeBase()
    // Simple direct approach without complex handling
    const model = getGenAI().getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      }
    })

    // Extract the user's messages
    const userMessages = messages.filter(msg => msg.role === 'user')
    if (userMessages.length === 0) {
      return "I'm here to help you with questions about broadband, digital literacy, and technology. What would you like to learn about today?"
    }

    // Get the last message from the user
    const lastUserMessage = userMessages[userMessages.length - 1].content
    
    // Analyze user's skill level and emotional state
    const skillLevel = detectSkillLevel(lastUserMessage)
    const isFrustrated = detectUserFrustration(lastUserMessage)
    
    // Get recommended resources based on the message, including content catalog
    const recommendedResources = await getEnhancedRecommendedResources(lastUserMessage, skillLevel)
    
    // Check if message contains keywords related to searching
    const isSearchRelated = 
      lastUserMessage.toLowerCase().includes('search') ||
      lastUserMessage.toLowerCase().includes('az-1.info') ||
      lastUserMessage.toLowerCase().includes('find information') ||
      lastUserMessage.toLowerCase().includes('website') ||
      lastUserMessage.toLowerCase().includes('resource')

    // Try to enhance the last message with RAG if possible
    let enhancedContent = lastUserMessage
    try {
      const enhancedPrompt = await enhancePromptWithRAG(lastUserMessage)
      if (enhancedPrompt !== lastUserMessage) {
        console.log('Enhanced prompt with RAG context')
        enhancedContent = enhancedPrompt
      }
    } catch (error) {
      console.error('Error enhancing prompt with RAG:', error)
    }

    // Build a simple conversation history
    const conversationHistory = [
      { role: 'user' as const, parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model' as const, parts: [{ text: 'Hey there! I\'m your Arizona Digital Navigator. I\'ll explain things simply and help you with anything about the internet or digital skills. How can I assist you today?' }] }
    ]

    // Add previous messages to conversation history (keep last 4 messages for context)
    const recentMessages = messages.slice(-4)
    for (let i = 0; i < recentMessages.length - 1; i++) {
      const message = recentMessages[i]
      if (message.role === 'user') {
        conversationHistory.push({ 
          role: 'user' as const,
          parts: [{ text: message.content }]
        })
      } else if (message.role === 'assistant') {
        conversationHistory.push({ 
          role: 'model' as const,
          parts: [{ text: message.content }]
        })
      }
    }

    // Prepare the current user message with additional context
    let currentPrompt = enhancedContent
    
    // Add skill level and emotional context
    let contextualInfo = `\n\nContext for this response:`
    contextualInfo += `\n- User skill level appears to be: ${skillLevel}`
    if (isFrustrated) {
      contextualInfo += `\n- User may be frustrated - respond with extra patience and empathy`
    }
    
    // Add resource information if we have recommendations
    if (recommendedResources.length > 0) {
      contextualInfo += `\n- Relevant resources available to recommend:`
      recommendedResources.forEach(resource => {
        contextualInfo += `\n  * ${resource.title}: ${resource.description} (${resource.url})`
      })
      contextualInfo += `\n- Please include these resources in your response when relevant`
    }
    
    // For search-related queries, add special instructions
    if (isSearchRelated) {
      console.log('Detected search query, adding special instructions')
      contextualInfo += `\n- This appears to be a search or resource request - provide specific resource links and guidance`
    }
    
    currentPrompt += contextualInfo

    conversationHistory.push({
      role: 'user' as const,
      parts: [{ text: currentPrompt }]
    })

    // Generate content
    console.log('Sending to Gemini with conversation history of', conversationHistory.length, 'messages')
    const result = await model.generateContent({
      contents: conversationHistory,
    })

    let response = result.response.text()
    
    // If we have resources and they weren't mentioned in the response, add them
    if (recommendedResources.length > 0 && !recommendedResources.some(r => response.includes(r.url))) {
      response += `\n\n**Helpful Resources:**\n`
      recommendedResources.slice(0, 3).forEach(resource => {
        response += `\n📚 **${resource.title}**\n`
        response += `${resource.description}\n`
        response += `🔗 [Visit Resource](${resource.url})\n`
      })
    }

    return response
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw error
  }
}

/**
 * Stream chat response using Gemini API
 */
export async function streamChatResponse(messages: { role: string; content: string }[]) {
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  
  // Start processing in the background
  processChatStream(messages, writer).catch(error => {
    console.error('Stream processing error:', error)
    writer.write(encoder.encode(`data: ${JSON.stringify({ 
      error: true, 
      message: error instanceof Error ? error.message : 'An error occurred during streaming'
    })}\n\n`))
    writer.write(encoder.encode('data: [DONE]\n\n'))
    writer.close()
  })
  
  return stream.readable
}

/**
 * Process the chat stream
 */
async function processChatStream(
  messages: { role: string; content: string }[],
  writer: WritableStreamDefaultWriter<Uint8Array>
) {
  const encoder = new TextEncoder()
  
  try {
    // Ensure knowledge base is initialized
    await ensureKnowledgeBase()
    // Set up the model with streaming
    const model = getGenAI().getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      }
    })

    // Extract the user's messages
    const userMessages = messages.filter(msg => msg.role === 'user')
    if (userMessages.length === 0) {
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        text: "I'm here to help you with questions about broadband, digital literacy, and technology. What would you like to learn about today?"
      })}\n\n`))
      await writer.write(encoder.encode('data: [DONE]\n\n'))
      await writer.close()
      return
    }

    // Get the last message from the user
    const lastUserMessage = userMessages[userMessages.length - 1].content
    
    // Analyze user's skill level and emotional state
    const skillLevel = detectSkillLevel(lastUserMessage)
    const isFrustrated = detectUserFrustration(lastUserMessage)
    
    // Get recommended resources based on the message, including content catalog
    const recommendedResources = await getEnhancedRecommendedResources(lastUserMessage, skillLevel)
    
    // Check if message contains keywords related to searching
    const isSearchRelated = 
      lastUserMessage.toLowerCase().includes('search') ||
      lastUserMessage.toLowerCase().includes('az-1.info') ||
      lastUserMessage.toLowerCase().includes('find information') ||
      lastUserMessage.toLowerCase().includes('website') ||
      lastUserMessage.toLowerCase().includes('resource')

    // Try to enhance the last message with RAG if possible
    let enhancedContent = lastUserMessage
    try {
      const enhancedPrompt = await enhancePromptWithRAG(lastUserMessage)
      if (enhancedPrompt !== lastUserMessage) {
        console.log('Enhanced prompt with RAG context')
        enhancedContent = enhancedPrompt
      }
    } catch (error) {
      console.error('Error enhancing prompt with RAG:', error)
    }

    // Build a simple conversation history
    const conversationHistory = [
      { role: 'user' as const, parts: [{ text: SYSTEM_PROMPT + "\n\nAdditional instructions: Be conversational and natural. Break down complex answers into simple steps. Use a friendly, human-like tone." }] },
      { role: 'model' as const, parts: [{ text: 'I understand my role as a digital navigator and will provide patient, conversational support for users at any skill level. I\'ll break down complex concepts into simple steps and use a friendly tone.' }] }
    ]

    // Add previous messages to conversation history (keep last 4 messages for context)
    const recentMessages = messages.slice(-4)
    for (let i = 0; i < recentMessages.length - 1; i++) {
      const message = recentMessages[i]
      if (message.role === 'user') {
        conversationHistory.push({ 
          role: 'user' as const,
          parts: [{ text: message.content }]
        })
      } else if (message.role === 'assistant') {
        conversationHistory.push({ 
          role: 'model' as const,
          parts: [{ text: message.content }]
        })
      }
    }

    // Prepare the current user message with additional context
    let currentPrompt = enhancedContent
    
    // Add skill level and emotional context
    let contextualInfo = `\n\nContext for this response:`
    contextualInfo += `\n- User skill level appears to be: ${skillLevel}`
    if (isFrustrated) {
      contextualInfo += `\n- User may be frustrated - respond with extra patience and empathy`
    }
    
    // Add resource information if we have recommendations
    if (recommendedResources.length > 0) {
      contextualInfo += `\n- Relevant resources available to recommend:`
      recommendedResources.forEach(resource => {
        contextualInfo += `\n  * ${resource.title}: ${resource.description} (${resource.url})`
      })
      contextualInfo += `\n- Please include these resources in your response when relevant`
    }
    
    // For search-related queries, add special instructions
    if (isSearchRelated) {
      console.log('Detected search query, adding special instructions')
      contextualInfo += `\n- This appears to be a search or resource request - provide specific resource links and guidance`
    }
    
    currentPrompt += contextualInfo

    conversationHistory.push({
      role: 'user' as const,
      parts: [{ text: currentPrompt }]
    })

    // Generate streaming content
    console.log('Sending to Gemini with conversation history of', conversationHistory.length, 'messages')
    const result = await model.generateContentStream({
      contents: conversationHistory,
    })

    let fullResponse = ""
    
    // Stream the response chunks
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      fullResponse += chunkText
      await writer.write(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`))
    }
    
    // If we have resources and they weren't mentioned in the response, add them
    if (recommendedResources.length > 0 && !recommendedResources.some(r => fullResponse.includes(r.url))) {
      let resourcesText = "\n\n**Helpful Resources:**\n"
      recommendedResources.slice(0, 3).forEach(resource => {
        resourcesText += `\n📚 **${resource.title}**\n`
        resourcesText += `${resource.description}\n`
        resourcesText += `🔗 [Visit Resource](${resource.url})\n`
      })
      
      await writer.write(encoder.encode(`data: ${JSON.stringify({ text: resourcesText })}\n\n`))
    }
    
    // Add warning if low on requests
    const remainingRequests = RateLimiter.getRemainingRequests()
    if (remainingRequests < 10) {
      const warningMessage = `\n\n_Note: I'm getting tired. Only ${remainingRequests} requests remaining in this hour. I might need to rest soon to stay within my free usage limits._`
      await writer.write(encoder.encode(`data: ${JSON.stringify({ text: warningMessage })}\n\n`))
    }
    
    // Send the end event
    await writer.write(encoder.encode('data: [DONE]\n\n'))
    await writer.close()
  } catch (error) {
    console.error('Streaming Error:', error)
    await writer.write(encoder.encode(`data: ${JSON.stringify({ 
      error: true, 
      message: error instanceof Error ? error.message : 'An error occurred during streaming'
    })}\n\n`))
    await writer.write(encoder.encode('data: [DONE]\n\n'))
    await writer.close()
  }
} 