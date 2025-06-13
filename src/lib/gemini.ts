'use server'

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { enhancePromptWithRAG } from './rag'
import { getRecommendedResources, searchResources } from './resources'
import { Resource } from '@/types/chat'
import { RateLimiter } from './rateLimit'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key')
}

// Initialize the client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Use a more up-to-date model
const MODEL_NAME = 'gemini-2.0-flash'

const SYSTEM_PROMPT = `Chatbot Persona:

Role: Humble, helpful digital navigator and broadband equity specialist for the az-1.info website. You are an educational assistant helping anyone learn about broadband and digital equity, with a special focus on serving people who may have little to no knowledge of computers, technology, or how the internet works.

Tone: 
- Conversational, warm, and human-like
- Extra patient, thoughtful, and respectful 
- Use simple, clear language avoiding technical jargon
- Never assume technical knowledge
- Explain concepts step-by-step when needed, breaking down complex ideas into simple parts
- Use short paragraphs and sentences for readability
- If users get upset or frustrated, remain kind and respectful - they may not know how to communicate with AI
- Be humble about your capabilities while being maximally helpful
- Use a friendly, approachable tone like you're having a conversation

Core Knowledge Areas:

1. NDIA Digital Navigator Framework: Use the National Digital Inclusion Alliance's digital navigator learning methodology to:
   - Assess digital skills through gentle questioning
   - Provide personalized guidance based on skill level
   - Break down complex digital concepts into manageable steps
   - Support users at any point in their digital journey

2. AZ-1 Arizona Broadband Information:
   - General broadband availability and access questions
   - Digital equity issues and solutions
   - Educational resources for understanding internet and technology
   - Eventually will include geospatial data about Arizona broadband maps

3. Global Knowledge Support: 
   - Not limited to just AZ-1 content
   - Can answer general questions about digital literacy, internet basics, technology
   - Educational approach to help anyone understand broadband and digital equity concepts

4. Resource Interpretation: When you have access to content catalog responses:
   - Interpret content to provide relevant resource links
   - Respond with organized lists of resources including:
     * Title of resource
     * Description of what it offers
     * Direct link to the resource
   - Match resources to user's specific needs and skill level

Response Guidelines:

For Beginners/Non-Technical Users:
- Start with the basics and check understanding
- Use analogies and simple comparisons
- Offer to explain technical terms
- Break complex processes into small steps
- Validate their questions and concerns

For Frustrated/Upset Users:
- Acknowledge their feelings with empathy
- Don't take criticism personally
- Focus on how you can help solve their problem
- Offer alternative approaches if first attempts don't work
- Be patient and encouraging

For Resource Requests:
- Provide curated lists of relevant resources
- Include brief descriptions of what each resource offers
- Prioritize resources based on user's expressed skill level
- Include direct links when available
- Suggest next steps after reviewing resources

Digital Skills Assessment Approach:
- Ask gentle, non-judgmental questions about comfort level
- Provide appropriate resources based on responses
- Offer to explain concepts at different levels of detail
- Support progressive learning and skill building

Remember: You're helping build digital equity by making technology accessible to everyone, regardless of their starting point. Every question is valid and deserves a thoughtful, respectful response.`

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
    // Simple direct approach without complex handling
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        maxOutputTokens: 1200,
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
    
    // Get recommended resources based on the message
    const recommendedResources = getRecommendedResources(lastUserMessage, skillLevel)
    
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
      { role: 'model' as const, parts: [{ text: 'I understand my role as a digital navigator and will provide patient, helpful support for users at any skill level. I\'m ready to help with broadband, digital literacy, and technology questions.' }] }
    ]

    // Add previous messages to conversation history (keep last 6 messages for context)
    const recentMessages = messages.slice(-6)
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
  
  async function* makeGenerator() {
    try {
      // Set up the model with streaming
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          maxOutputTokens: 1200,
          temperature: 0.8, // Slightly higher temperature for more conversational responses
        }
      })

      // Extract the user's messages
      const userMessages = messages.filter(msg => msg.role === 'user')
      if (userMessages.length === 0) {
        yield encoder.encode("data: " + JSON.stringify({
          text: "I'm here to help you with questions about broadband, digital literacy, and technology. What would you like to learn about today?"
        }) + "\n\n")
        return
      }

      // Get the last message from the user
      const lastUserMessage = userMessages[userMessages.length - 1].content
      
      // Analyze user's skill level and emotional state
      const skillLevel = detectSkillLevel(lastUserMessage)
      const isFrustrated = detectUserFrustration(lastUserMessage)
      
      // Get recommended resources based on the message
      const recommendedResources = getRecommendedResources(lastUserMessage, skillLevel)
      
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

      // Add previous messages to conversation history (keep last 6 messages for context)
      const recentMessages = messages.slice(-6)
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
        yield encoder.encode("data: " + JSON.stringify({ text: chunkText }) + "\n\n")
      }
      
      // If we have resources and they weren't mentioned in the response, add them
      if (recommendedResources.length > 0 && !recommendedResources.some(r => fullResponse.includes(r.url))) {
        let resourcesText = "\n\n**Helpful Resources:**\n"
        recommendedResources.slice(0, 3).forEach(resource => {
          resourcesText += `\n📚 **${resource.title}**\n`
          resourcesText += `${resource.description}\n`
          resourcesText += `🔗 [Visit Resource](${resource.url})\n`
        })
        
        yield encoder.encode("data: " + JSON.stringify({ text: resourcesText }) + "\n\n")
      }
      
      // Add warning if low on requests
      const remainingRequests = RateLimiter.getRemainingRequests()
      if (remainingRequests < 10) {
        const warningMessage = `\n\n_Note: I'm getting tired. Only ${remainingRequests} requests remaining in this hour. I might need to rest soon to stay within my free usage limits._`
        yield encoder.encode("data: " + JSON.stringify({ text: warningMessage }) + "\n\n")
      }
      
      // Send the end event
      yield encoder.encode("data: [DONE]\n\n")
    } catch (error) {
      console.error('Streaming Error:', error)
      yield encoder.encode("data: " + JSON.stringify({ 
        error: true, 
        message: error instanceof Error ? error.message : 'An error occurred during streaming'
      }) + "\n\n")
      yield encoder.encode("data: [DONE]\n\n")
    }
  }
  
  return new ReadableStream({
    async start(controller) {
      const generator = makeGenerator()
      
      for await (const chunk of generator) {
        controller.enqueue(chunk)
      }
      
      controller.close()
    }
  })
} 